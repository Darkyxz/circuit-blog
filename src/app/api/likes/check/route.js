import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { asyncHandler, validateQuery } from "@/utils/errors/error-handler";
import { NotFoundError, DatabaseError, AuthenticationError } from "@/utils/errors/custom-errors";
import { z } from "zod";

// Schema para verificar like
const checkLikeSchema = z.object({
  postSlug: z
    .string()
    .min(1, 'Post slug requerido')
    .max(100, 'Post slug demasiado largo')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Post slug inválido')
});

// GET - Verificar si el usuario actual ha dado like a un post
export const GET = asyncHandler(async (req) => {
  const session = await getAuthSession();

  if (!session) {
    throw new AuthenticationError('Authentication required to check like status');
  }

  const validatedQuery = validateQuery(checkLikeSchema, req.url);
  const { postSlug } = validatedQuery;

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
      throw new NotFoundError('Post');
    }

    // Verificar si el usuario ha dado like
    const existingLike = await prisma.like.findUnique({
      where: {
        userEmail_postSlug: {
          userEmail: session.user.email,
          postSlug: postSlug
        }
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      postSlug,
      liked: !!existingLike,
      totalLikes: post.likes,
      likedAt: existingLike?.createdAt || null,
      canLike: post.status === 'PUBLISHED'
    }, { status: 200 });

  } catch (err) {
    throw new DatabaseError('Failed to check like status', err);
  }
});
