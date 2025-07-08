import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page")) || 1;
  const cat = searchParams.get("cat");
  const search = searchParams.get("search");

  const POST_PER_PAGE = 6; // Incrementamos para mejor UX

  // Construir query optimizada
  const whereClause = {
    status: 'PUBLISHED', // Solo posts publicados
    ...(cat && { catSlug: cat }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { desc: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const selectFields = {
    id: true,
    title: true,
    desc: true,
    img: true,
    slug: true,
    createdAt: true,
    catSlug: true,
    views: true,
    user: {
      select: {
        name: true,
        email: true
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
        take: POST_PER_PAGE,
        skip: POST_PER_PAGE * (page - 1)
      }),
      prisma.post.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(count / POST_PER_PAGE);

    return new NextResponse(
      JSON.stringify({ 
        posts, 
        count, 
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }), 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err) {
    console.error('Posts API Error:', err);
    return new NextResponse(
      JSON.stringify({ 
        message: "Error fetching posts",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      }), 
      { status: 500 }
    );
  }
};

// CREATE A POST
export const POST = async (req) => {
  console.log('POST /api/posts - Request received');
  
  const session = await getAuthSession();
  console.log('Session:', session ? 'Authenticated' : 'Not authenticated');

  if (!session) {
    console.log('Returning 401 - Not authenticated');
    return new NextResponse(
      JSON.stringify({ message: "Not Authenticated!" }), { status: 401 }
    );
  }

  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const post = await prisma.post.create({
      data: { ...body, userEmail: session.user.email },
    });
    
    console.log('Post created successfully:', post.id);
    return new NextResponse(JSON.stringify(post), { status: 200 });
  } catch (err) {
    console.error('Error creating post:', err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!", error: err.message }), { status: 500 }
    );
  }
};
