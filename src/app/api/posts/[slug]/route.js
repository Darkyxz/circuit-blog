import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/utils/auth";

// GET SINGLE POST
export const GET = async (req, { params }) => {
  const { slug } = params;

  try {
    // First, get the post without updating views (for caching)
    const post = await prisma.post.findUnique({
      where: { slug },
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
      },
    });

    if (!post) {
      return new NextResponse(
        JSON.stringify({ message: "Post not found" }), 
        { status: 404 }
      );
    }

    // Update views in a separate, non-blocking operation
    prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
    }).catch(err => console.error('Error updating views:', err));

    return new NextResponse(
      JSON.stringify(post), 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err) {
    console.error('Single post API error:', err);
    return new NextResponse(
      JSON.stringify({ 
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      }), 
      { status: 500 }
    );
  }
};

// UPDATE POST
export const PUT = async (req, { params }) => {
  const { slug } = params;
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "Not authenticated" }), 
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { title, desc, img, catSlug } = body;

    // Verificar que el post existe y pertenece al usuario o es admin
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    if (!existingPost) {
      return new NextResponse(
        JSON.stringify({ message: "Post not found" }), 
        { status: 404 }
      );
    }

    // Verificar permisos - solo el autor o admin pueden editar
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    const canEdit = existingPost.userEmail === session.user.email || 
                   (currentUser && ['ADMIN', 'EDITOR'].includes(currentUser.role));

    if (!canEdit) {
      return new NextResponse(
        JSON.stringify({ message: "Not authorized to edit this post" }), 
        { status: 403 }
      );
    }

    // Actualizar el post
    const updatedPost = await prisma.post.update({
      where: { slug },
      data: {
        title: title || existingPost.title,
        desc: desc || existingPost.desc,
        img: img !== undefined ? img : existingPost.img,
        catSlug: catSlug || existingPost.catSlug,
        updatedAt: new Date()
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

    return new NextResponse(
      JSON.stringify(updatedPost), 
      { status: 200 }
    );

  } catch (err) {
    console.error('Update post API error:', err);
    return new NextResponse(
      JSON.stringify({ 
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      }), 
      { status: 500 }
    );
  }
};
