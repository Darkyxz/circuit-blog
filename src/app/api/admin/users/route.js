import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { asyncHandler } from "@/utils/errors/error-handler";
import { AuthenticationError, NotFoundError, AuthorizationError } from "@/utils/errors/custom-errors";

// GET ALL USERS
export const GET = asyncHandler(async (req) => {
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

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  return NextResponse.json(users);
});

// UPDATE USER ROLE
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
    throw new AuthorizationError('Only admins can update user roles');
  }

  const body = await req.json();
  const { role, isActive } = body;

  // Update user role and active status
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      role: role || undefined,
      isActive: isActive !== undefined ? isActive : undefined
    }
  });

  return NextResponse.json({
    message: 'User updated successfully',
    user: updatedUser
  });
});
