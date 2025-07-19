import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

// GET - Obtener likes de un post (simplificado)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");

  if (!postSlug) {
    return NextResponse.json({ error: "Post slug is required" }, { status: 400 });
  }

  try {
    // Obtener información del post
    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      select: { 
        id: true, 
        title: true, 
        likes: true,
        slug: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Por ahora, devolver solo el conteo de likes del post
    return NextResponse.json({
      post: {
        slug: post.slug,
        title: post.title,
        totalLikes: post.likes
      },
      likes: [], // Array vacío por ahora
      count: post.likes,
      totalPages: 1,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false
    });

  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 });
  }
}

// POST - Dar like/unlike a un post (simplificado)
export async function POST(req) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { postSlug, action = 'like' } = body;

    if (!postSlug) {
      return NextResponse.json({ error: "Post slug is required" }, { status: 400 });
    }

    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      select: { 
        id: true, 
        title: true, 
        likes: true,
        status: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status !== 'PUBLISHED') {
      return NextResponse.json({ error: "Cannot like unpublished post" }, { status: 400 });
    }

    // Por ahora, simplemente actualizar el contador de likes
    let newLikesCount = post.likes;
    
    if (action === 'like') {
      newLikesCount = post.likes + 1;
    } else if (action === 'unlike') {
      newLikesCount = Math.max(0, post.likes - 1);
    }

    // Actualizar el post
    const updatedPost = await prisma.post.update({
      where: { slug: postSlug },
      data: { likes: newLikesCount },
      select: { likes: true }
    });

    return NextResponse.json({
      message: `Post ${action}d successfully`,
      liked: action === 'like',
      totalLikes: updatedPost.likes
    });

  } catch (error) {
    console.error('Error updating like:', error);
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}
