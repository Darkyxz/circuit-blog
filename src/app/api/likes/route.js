import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { likeActionSchema, postLikesSchema, canUserLike } from "@/schemas/like";
import { asyncHandler, validateBody, validateQuery } from "@/utils/errors/error-handler";
import { NotFoundError, DatabaseError, AuthenticationError, ValidationError, ConflictError } from "@/utils/errors/custom-errors";

// GET - Obtener likes de un post
export const GET = asyncHandler(async (req) => {
  const validatedQuery = validateQuery(postLikesSchema, req.url);
  const { postSlug, page = 1, limit = 50 } = validatedQuery;

  try {
    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      select: { id: true, title: true, likes: true }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    // Obtener likes con paginación
    const [likes, count] = await Promise.all([
      prisma.like.findMany({
        where: { postSlug },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: limit * (page - 1)
      }),
      prisma.like.count({ where: { postSlug } })
    ]);

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      likes,
      count,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      post: {
        slug: post.slug,
        title: post.title,
        totalLikes: post.likes
      }
    }, { status: 200 });

  } catch (err) {
    throw new DatabaseError('Failed to fetch likes', err);
  }
});

// POST - Dar like/unlike a un post
export const POST = asyncHandler(async (req) => {
  const session = await getAuthSession();

  if (!session) {
    throw new AuthenticationError('Authentication required to like posts');
  }

  const validatedData = await validateBody(likeActionSchema, req);
  const { postSlug, action = 'like' } = validatedData;

  try {
    // Verificar que el post existe y está publicado
    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      select: { 
        id: true, 
        title: true, 
        status: true, 
        likes: true,
        user: {
          select: {
            role: true
          }
        }
      }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    // Verificar permisos
    if (!canUserLike(session.user.role || 'USER', post.status)) {
      throw new ValidationError('Cannot like this post');
    }

    // Verificar si el usuario ya ha dado like
    const existingLike = await prisma.like.findUnique({
      where: {
        userEmail_postSlug: {
          userEmail: session.user.email,
          postSlug: postSlug
        }
      }
    });

    if (action === 'like') {
      if (existingLike) {
        throw new ConflictError('You have already liked this post');
      }

      // Crear like y actualizar contador
      await prisma.$transaction(async (tx) => {
        await tx.like.create({
          data: {
            userEmail: session.user.email,
            postSlug: postSlug
          }
        });

        await tx.post.update({
          where: { slug: postSlug },
          data: { likes: { increment: 1 } }
        });
      });

      return NextResponse.json({
        message: 'Post liked successfully',
        liked: true,
        totalLikes: post.likes + 1
      }, { status: 201 });

    } else if (action === 'unlike') {
      if (!existingLike) {
        throw new ValidationError('You have not liked this post');
      }

      // Eliminar like y actualizar contador
      await prisma.$transaction(async (tx) => {
        await tx.like.delete({
          where: {
            userEmail_postSlug: {
              userEmail: session.user.email,
              postSlug: postSlug
            }
          }
        });

        await tx.post.update({
          where: { slug: postSlug },
          data: { likes: { decrement: 1 } }
        });
      });

      return NextResponse.json({
        message: 'Post unliked successfully',
        liked: false,
        totalLikes: Math.max(0, post.likes - 1)
      }, { status: 200 });
    }

  } catch (err) {
    throw new DatabaseError('Failed to process like action', err);
  }
});
