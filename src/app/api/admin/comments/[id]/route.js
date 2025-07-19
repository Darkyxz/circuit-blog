import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { asyncHandler } from "@/utils/errors/error-handler";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/utils/errors/custom-errors";

// UPDATE COMMENT STATUS (ADMIN)
export const PUT = asyncHandler(async (req, { params }) => {
  const { id } = params;
  const session = await getAuthSession();

  if (!session) {
    throw new AuthenticationError('Authentication required');
  }

  // Check if user is admin or editor
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });
  
  if (!user || !['ADMIN', 'EDITOR'].includes(user.role)) {
    throw new AuthorizationError('Not authorized to moderate comments');
  }

  const body = await req.json();
  const { status, desc } = body;

  // Verify comment exists
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!comment) {
    throw new NotFoundError('Comment');
  }

  // Update comment
  const updatedComment = await prisma.comment.update({
    where: { id },
    data: {
      status: status || undefined,
      desc: desc !== undefined ? desc : undefined,
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
});

// DELETE COMMENT (ADMIN)
export const DELETE = asyncHandler(async (req, { params }) => {
  const { id } = params;
  const session = await getAuthSession();

  if (!session) {
    throw new AuthenticationError('Authentication required');
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });
  
  if (!user || user.role !== 'ADMIN') {
    throw new AuthorizationError('Only admins can delete comments');
  }

  // Verify comment exists
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      replies: true
    }
  });

  if (!comment) {
    throw new NotFoundError('Comment');
  }

  // If has replies, soft delete (mark as deleted)
  if (comment.replies.length > 0) {
    const deletedComment = await prisma.comment.update({
      where: { id },
      data: {
        desc: '[Comentario eliminado por moderador]',
        status: 'REJECTED',
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      message: 'Comment marked as deleted',
      comment: deletedComment
    });
  } else {
    // Hard delete if no replies
    await prisma.comment.delete({
      where: { id }
    });
    
    return NextResponse.json({
      message: 'Comment deleted successfully'
    });
  }
});