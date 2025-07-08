import { NextResponse } from 'next/server';
import { checkAdminPermission } from '@/middleware/adminAuth';
import prisma from '@/utils/connect';

// ELIMINAR POST
export async function DELETE(request, { params }) {
  try {
    // Verificar permisos de admin
    const authResult = await checkAdminPermission();
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Verificar si el post existe
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } }
      }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Solo ADMIN puede eliminar posts de otros usuarios
    // EDITOR solo puede eliminar sus propios posts
    if (authResult.user.role === 'EDITOR' && 
        existingPost.userEmail !== authResult.user.email) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Eliminar comentarios asociados primero
    await prisma.comment.deleteMany({
      where: { postSlug: existingPost.slug }
    });

    // Eliminar el post
    await prisma.post.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ACTUALIZAR POST
export async function PATCH(request, { params }) {
  try {
    // Verificar permisos de admin
    const authResult = await checkAdminPermission();
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Verificar si el post existe
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } }
      }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Solo ADMIN puede editar posts de otros usuarios
    // EDITOR solo puede editar sus propios posts
    if (authResult.user.role === 'EDITOR' && 
        existingPost.userEmail !== authResult.user.email) {
      return NextResponse.json(
        { error: 'You can only edit your own posts' },
        { status: 403 }
      );
    }

    // Campos que se pueden actualizar
    const allowedFields = ['title', 'desc', 'img', 'status', 'featured', 'catSlug'];
    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Si se actualiza el título, regenerar el slug
    if (updateData.title) {
      const slugify = (str) =>
        str
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      
      updateData.slug = slugify(updateData.title);
    }

    // Actualizar el post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
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
      }
    });

    return NextResponse.json(updatedPost);

  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
