import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { asyncHandler } from "@/utils/errors/error-handler";
import { NotFoundError } from "@/utils/errors/custom-errors";

// GET USER PROFILE
export const GET = asyncHandler(async (req, { params }) => {
  const { id } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        bio: true,
        website: true,
        twitter: true,
        github: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            Post: {
              where: {
                status: 'PUBLISHED'
              }
            },
            Comment: {
              where: {
                status: 'APPROVED'
              }
            },
            likes: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (!user.isActive) {
      throw new NotFoundError('User');
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
});