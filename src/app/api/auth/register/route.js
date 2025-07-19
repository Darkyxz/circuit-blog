import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import bcrypt from "bcryptjs";
import { asyncHandler } from "@/utils/errors/error-handler";
import { ValidationError } from "@/utils/errors/custom-errors";

// REGISTER USER
export const POST = asyncHandler(async (req) => {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validaciones básicas
    if (!name || !email || !password) {
      throw new ValidationError('Todos los campos son requeridos');
    }

    if (password.length < 6) {
      throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Formato de email inválido');
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Ya existe una cuenta con este email' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'USER',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json(
      { 
        message: 'Usuario creado exitosamente',
        user 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Ya existe una cuenta con este email' },
        { status: 400 }
      );
    }

    throw error;
  }
});