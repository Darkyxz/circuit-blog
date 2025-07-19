import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { sendCommentNotification, extractMentions, sendMentionNotification } from "@/utils/notifications";

// GET COMMENTS OF A POST - Version simple para compatibilidad
export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");

  if (!postSlug) {
    return NextResponse.json({ error: "Post slug is required" }, { status: 400 });
  }

  try {
    // Obtener comentarios principales (sin padre) con respuestas anidadas
    const comments = await prisma.comment.findMany({
      where: {
        postSlug,
        status: 'APPROVED',
        parentId: null // Solo comentarios principales
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        replies: {
          where: {
            status: 'APPROVED'
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
                role: true
              }
            },
            replies: {
              where: {
                status: 'APPROVED'
              },
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    image: true,
                    role: true
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            replies: {
              where: {
                status: 'APPROVED'
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (err) {
    console.error('Error fetching comments:', err);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
};

// CREATE A COMMENT - Version simple para compatibilidad
export const POST = async (req) => {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { desc, postSlug, parentId } = body;

    if (!desc || !postSlug) {
      return NextResponse.json({ error: "Description and post slug are required" }, { status: 400 });
    }

    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      select: { id: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Si es una respuesta, verificar que el comentario padre existe y obtener datos para notificación
    let parentComment = null;
    if (parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (!parentComment) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }
    }

    // Obtener datos completos del post para notificaciones
    const postData = await prisma.post.findUnique({
      where: { slug: postSlug },
      select: {
        id: true,
        title: true,
        slug: true
      }
    });

    const comment = await prisma.comment.create({
      data: {
        desc: desc.trim(),
        postSlug,
        userEmail: session.user.email,
        status: 'APPROVED',
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // Enviar notificación si es una respuesta y no es el mismo usuario
    if (parentComment && parentComment.user.email !== session.user.email) {
      try {
        await sendCommentNotification(parentComment, comment, postData);
      } catch (error) {
        console.error('Error enviando notificación:', error);
        // No fallar la creación del comentario por un error de notificación
      }
    }

    // Detectar menciones y enviar notificaciones
    const mentions = extractMentions(desc);
    if (mentions.length > 0) {
      try {
        // Buscar usuarios mencionados
        const mentionedUsers = await prisma.user.findMany({
          where: {
            name: {
              in: mentions
            },
            email: {
              not: session.user.email // No notificar al autor del comentario
            }
          },
          select: {
            name: true,
            email: true
          }
        });

        // Enviar notificaciones de mención
        for (const user of mentionedUsers) {
          await sendMentionNotification(user, comment, postData);
        }
      } catch (error) {
        console.error('Error enviando notificaciones de mención:', error);
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error('Error creating comment:', err);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
};
