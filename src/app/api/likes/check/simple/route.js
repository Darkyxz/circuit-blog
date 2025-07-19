import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");

  if (!postSlug) {
    return NextResponse.json({ error: "Post slug is required" }, { status: 400 });
  }

  try {
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

    // Por ahora, simular que el usuario nunca ha dado like
    // En el futuro, aquí verificaríamos el modelo Like
    return NextResponse.json({
      postSlug,
      liked: false, // Por ahora siempre false
      totalLikes: post.likes,
      likedAt: null,
      canLike: post.status === 'PUBLISHED'
    });

  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: "Failed to check like status" }, { status: 500 });
  }
}
