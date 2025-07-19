import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { asyncHandler } from "@/utils/errors/error-handler";
import { NotFoundError } from "@/utils/errors/custom-errors";

// GET USER POSTS
export const GET = asyncHandler(async (req, { params }) => {
  const { id } = params;

  try {
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, isActive: true }
    });

    if (!user || !user.isActive) {
      throw new NotFoundError('User');
    }

    // Obtener posts del usuario
    const posts = await prisma.post.findMany({
      where: {
        user: {
          id: id
        },
        status: 'PUBLISHED'
      },
      include: {
        cat: {
          select: {
            title: true,
            slug: true
          }
        },
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(posts);

  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
});