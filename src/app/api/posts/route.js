import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { postsQuerySchema, createPostSchema, sanitizeHtml } from "@/schemas/post";
import { asyncHandler, validateQuery, validateBody } from "@/utils/errors/error-handler";
import { NotFoundError, DatabaseError, ConflictError, AuthenticationError } from "@/utils/errors/custom-errors";

export const GET = asyncHandler(async (req) => {
  // Validar query parameters
  const validatedQuery = validateQuery(postsQuerySchema, req.url);
  const { page = 1, cat, search, limit = 6, status = 'PUBLISHED', featured } = validatedQuery;

  // Construir query optimizada
  const whereClause = {
    status: status,
    ...(cat && { catSlug: cat }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { desc: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(featured !== undefined && { featured })
  };

  const selectFields = {
    id: true,
    title: true,
    desc: true,
    img: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
    catSlug: true,
    views: true,
    likes: true,
    status: true,
    featured: true,
    user: {
      select: {
        name: true,
        email: true,
        image: true
      }
    },
    cat: {
      select: {
        title: true,
        slug: true
      }
    }
  };

  try {
    // Ejecutar consultas en paralelo para mejor rendimiento
    const [posts, count] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        select: selectFields,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: limit * (page - 1)
      }),
      prisma.post.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(count / limit);

    // Sanitizar contenido HTML
    const sanitizedPosts = posts.map(post => ({
      ...post,
      desc: sanitizeHtml(post.desc)
    }));

    return NextResponse.json(
      { 
        posts: sanitizedPosts, 
        count, 
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err) {
    throw new DatabaseError('Failed to fetch posts', err);
  }
});

// CREATE A POST
export const POST = asyncHandler(async (req) => {
  const session = await getAuthSession();

  if (!session) {
    throw new AuthenticationError('Authentication required to create posts');
  }

  // Validar body del request
  const validatedData = await validateBody(createPostSchema, req);
  const { title, desc, img, catSlug, slug, status = 'PUBLISHED', featured = false } = validatedData;

  // Sanitizar contenido HTML
  const sanitizedDesc = sanitizeHtml(desc);

  try {
    // Verificar que el slug no exista
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (existingPost) {
      throw new ConflictError('A post with this slug already exists');
    }

    // Verificar que la categoría exista
    const category = await prisma.category.findUnique({
      where: { slug: catSlug },
      select: { id: true }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    // Crear el post
    const post = await prisma.post.create({
      data: {
        title,
        desc: sanitizedDesc,
        img: img || null,
        slug,
        catSlug,
        status,
        featured,
        userEmail: session.user.email
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        },
        cat: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    });
    
    return NextResponse.json({
      message: 'Post created successfully',
      post
    }, { status: 201 });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Post with this slug already exists');
    }
    throw new DatabaseError('Failed to create post', err);
  }
});
