import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { asyncHandler } from "@/utils/errors/error-handler";
import { AuthenticationError, NotFoundError, AuthorizationError } from "@/utils/errors/custom-errors";

// GET SINGLE USER
export const GET = asyncHandler(async (req, { params }) => {
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
  
  if (!user || !['ADMIN', 'EDITOR'].includes(user.role)) {
    throw new AuthorizationError('Not authorized to access user management');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      bio: true,
      website: true,
      twitter: true,
      github: true,
      _count: {
        select: {
          Post: true,
          Comment: true,
          likes: true
        }
      }
    }
  });

  if (!targetUser) {
    throw new NotFoundError('User');
  }

  return NextResponse.json(targetUser);
});

// UPDATE USER
export const PUT = asyncHandler(async (req, { params }) => {
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
    throw new AuthorizationError('Only admins can update users');
  }

  const body = await req.json();
  const { role, isActive, bio, website, twitter, github } = body;

  // Verify target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!targetUser) {
    throw new NotFoundError('User');
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      role: role || undefined,
      isActive: isActive !== undefined ? isActive : undefined,
      bio: bio !== undefined ? bio : undefined,
      website: website !== undefined ? website : undefined,
      twitter: twitter !== undefined ? twitter : undefined,
      github: github !== undefined ? github : undefined
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      bio: true,
      website: true,
      twitter: true,
      github: true
    }
  });

  return NextResponse.json({
    message: 'User updated successfully',
    user: updatedUser
  });
});

// DELETE USER (soft delete - deactivate)
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
    throw new AuthorizationError('Only admins can delete users');
  }

  // Verify target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true }
  });

  if (!targetUser) {
    throw new NotFoundError('User');
  }

  // Prevent admin from deleting other admins
  if (targetUser.role === 'ADMIN') {
    throw new AuthorizationError('Cannot delete admin users');
  }

  // Soft delete - deactivate user
  const deactivatedUser = await prisma.user.update({
    where: { id },
    data: {
      isActive: false
    }
  });

  return NextResponse.json({
    message: 'User deactivated successfully',
    user: deactivatedUser
  });
});
