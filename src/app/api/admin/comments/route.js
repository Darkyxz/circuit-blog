import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { asyncHandler } from "@/utils/errors/error-handler";
import { AuthenticationError, AuthorizationError } from "@/utils/errors/custom-errors";

// GET ALL COMMENTS FOR ADMIN
export const GET = asyncHandler(async (req) => {
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
    throw new AuthorizationError('Not authorized to access comment management');
  }

  const comments = await prisma.comment.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true
        }
      },
      post: {
        select: {
          title: true,
          slug: true
        }
      },
      parent: {
        select: {
          id: true,
          desc: true,
          user: {
            select: {
              name: true
            }
          }
        }
      },
      _count: {
        select: {
          replies: true
        }
      }
    },
    orderBy: [
      { status: 'asc' }, // Pending first
      { createdAt: 'desc' }
    ]
  });

  return NextResponse.json(comments);
});