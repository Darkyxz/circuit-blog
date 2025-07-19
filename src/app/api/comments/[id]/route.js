import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { updateCommentSchema, deleteCommentSchema } from "@/schemas/comment";
import { asyncHandler, validateBody } from "@/utils/errors/error-handler";
import { NotFoundError, AuthenticationError, AuthorizationError } from "@/utils/errors/custom-errors";

// UPDATE COMMENT
export const PUT = asyncHandler(async (req, { params }) => {
  const session = await getAuthSession();
  
  if (!session) {
    throw new AuthenticationError('Authentication required');
  }

  const { id } = params;
  const validatedData = await validateBody(updateCommentSchema, req);
  const { desc } = validatedData;

  try {
    // Verificar que el comentario existe y pertenece al usuario
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingComment) {
      throw new NotFoundError('Comment');
    }

    // Verificar permisos - solo el autor o admin pueden editar
    if (existingComment.userEmail !== session.user.email) {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      
      if (!user || !['ADMIN', 'EDITOR'].includes(user.role)) {
        throw new AuthorizationError('Cannot edit this comment');
      }
    }

    // Actualizar comentario
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        desc: desc.trim(),
        updatedAt: new Date()
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
      message: 'Comment updated successfully',
      comment: updatedComment
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
});

// DELETE COMMENT
export const DELETE = asyncHandler(async (req, { params }) => {
  const session = await getAuthSession();
  
  if (!session) {
    throw new AuthenticationError('Authentication required');
  }

  const { id } = params;

  try {
    // Verificar que el comentario existe
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { 
        user: true,
        replies: true 
      }
    });

    if (!existingComment) {
      throw new NotFoundError('Comment');
    }

    // Verificar permisos - solo el autor o admin pueden eliminar
    if (existingComment.userEmail !== session.user.email) {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      
      if (!user || !['ADMIN', 'EDITOR'].includes(user.role)) {
        throw new AuthorizationError('Cannot delete this comment');
      }
    }

    // Si tiene respuestas, marcar como eliminado en lugar de eliminar
    if (existingComment.replies.length > 0) {
      const deletedComment = await prisma.comment.update({
        where: { id },
        data: {
          desc: '[Comentario eliminado]',
          status: 'REJECTED',
          updatedAt: new Date()
        }
      });
      
      return NextResponse.json({
        message: 'Comment marked as deleted',
        comment: deletedComment
      });
    } else {
      // Eliminar completamente si no tiene respuestas
      await prisma.comment.delete({
        where: { id }
      });
      
      return NextResponse.json({
        message: 'Comment deleted successfully'
      });
    }

  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
});

// GET SINGLE COMMENT
export const GET = asyncHandler(async (req, { params }) => {
  const { id } = params;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!comment) {
      throw new NotFoundError('Comment');
    }

    return NextResponse.json(comment);

  } catch (error) {
    console.error('Error fetching comment:', error);
    throw error;
  }
});
