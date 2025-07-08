import { NextResponse } from 'next/server';
import { checkAdminPermission } from '@/middleware/adminAuth';
import prisma from '@/utils/connect';

export async function GET(request) {
  try {
    // Verificar permisos de admin
    const authResult = await checkAdminPermission();
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Construir filtros
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (category) {
      where.catSlug = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { desc: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Obtener posts con información completa
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          cat: {
            select: {
              title: true,
              slug: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        }
      }),
      prisma.post.count({ where })
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
