import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { createCommentSchema, commentsQuerySchema, sanitizeComment, containsOffensiveContent } from "@/schemas/comment";
import { asyncHandler, validateQuery, validateBody } from "@/utils/errors/error-handler";
import { NotFoundError, DatabaseError, AuthenticationError, ValidationError } from "@/utils/errors/custom-errors";

// GET COMMENTS OF A POST
export const GET = asyncHandler(async (req) => {
  // Validar query parameters
  const validatedQuery = validateQuery(commentsQuerySchema, req.url);
  const { postSlug, page = 1, limit = 20, status = 'APPROVED' } = validatedQuery;

  try {
    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      select: { id: true }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    // Construir query con filtros
    const whereClause = {
      postSlug,
      status
    };

    // Ejecutar consultas en paralelo
    const [comments, count] = await Promise.all([
      prisma.comment.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: limit * (page - 1)
      }),
      prisma.comment.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      comments,
      count,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }, { status: 200 });
  } catch (err) {
    throw new DatabaseError('Failed to fetch comments', err);
  }
});

// CREATE A COMMENT
export const POST = asyncHandler(async (req) => {
  const session = await getAuthSession();

  if (!session) {
    throw new AuthenticationError('Authentication required to comment');
  }

  // Validar body del request
  const validatedData = await validateBody(createCommentSchema, req);
  const { desc, postSlug } = validatedData;

  // Sanitizar contenido
  const sanitizedDesc = sanitizeComment(desc);

  // Verificar contenido ofensivo
  if (containsOffensiveContent(sanitizedDesc)) {
    throw new ValidationError('Comment contains inappropriate content');
  }

  try {
    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      select: { id: true }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    // Crear comentario
    const comment = await prisma.comment.create({
      data: {
        desc: sanitizedDesc,
        postSlug,
        userEmail: session.user.email,
        status: 'APPROVED' // Auto-aprobar por ahora
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Comment created successfully',
      comment
    }, { status: 201 });
  } catch (err) {
    throw new DatabaseError('Failed to create comment', err);
  }
});
