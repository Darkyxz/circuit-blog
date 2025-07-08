import { NextResponse } from 'next/server';
import prisma from '@/utils/connect';

export async function GET(request) {
  try {
    // Ejecutar múltiples consultas en paralelo para mejor rendimiento
    const [
      postsCount,
      categoriesCount,
      recentPosts,
      popularPosts,
      publishedCount,
      draftCount
    ] = await Promise.all([
      // Consulta 1: Contar total de posts
      prisma.post.count(),
      
      // Consulta 2: Contar categorías
      prisma.category.count(),
      
      // Consulta 3: Posts recientes (últimos 5)
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          catSlug: true,
          views: true,
          status: true
        }
      }),
      
      // Consulta 4: Posts más populares
      prisma.post.findMany({
        take: 5,
        orderBy: { views: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          catSlug: true
        }
      }),
      
      // Consulta 5: Contar posts publicados
      prisma.post.count({
        where: { status: 'PUBLISHED' }
      }),
      
      // Consulta 6: Contar borradores
      prisma.post.count({
        where: { status: 'DRAFT' }
      })
    ]);

    return NextResponse.json({
      stats: {
        totalPosts: postsCount,
        totalCategories: categoriesCount,
        publishedPosts: publishedCount,
        draftPosts: draftCount
      },
      recentPosts,
      popularPosts
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
