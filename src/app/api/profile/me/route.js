import { NextResponse } from "next/server";
import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { asyncHandler } from "@/utils/errors/error-handler";
import { AuthenticationError, ValidationError } from "@/utils/errors/custom-errors";

// GET CURRENT USER PROFILE
export const GET = asyncHandler(async (req) => {
  const session = await getAuthSession();

  if (!session) {
    throw new AuthenticationError('Authentication required');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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
      throw new AuthenticationError('User not found');
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
});

// UPDATE CURRENT USER PROFILE
export const PUT = asyncHandler(async (req) => {
  const session = await getAuthSession();

  if (!session) {
    throw new AuthenticationError('Authentication required');
  }

  try {
    const body = await req.json();
    const { name, bio, website, twitter, github, image } = body;

    // Validaciones básicas
    if (!name || !name.trim()) {
      throw new ValidationError('Name is required');
    }

    // Validar URLs si se proporcionan
    if (website && website.trim()) {
      try {
        new URL(website);
      } catch {
        throw new ValidationError('Invalid website URL');
      }
    }

    // Limpiar datos de redes sociales (remover @ y espacios)
    const cleanTwitter = twitter ? twitter.replace('@', '').trim() : '';
    const cleanGithub = github ? github.trim() : '';

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
        bio: bio ? bio.trim() : null,
        website: website ? website.trim() : null,
        twitter: cleanTwitter || null,
        github: cleanGithub || null,
        image: image || undefined
      },
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
        createdAt: true
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
});