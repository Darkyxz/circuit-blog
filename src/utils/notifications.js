// Sistema de notificaciones para comentarios
export const sendCommentNotification = async (parentComment, newComment, post) => {
  // Por ahora, solo loggeamos la notificación
  // En el futuro se puede integrar con un servicio de email como SendGrid, Resend, etc.
  
  console.log('📧 Nueva notificación de comentario:', {
    to: parentComment.user.email,
    subject: `Nueva respuesta a tu comentario en "${post.title}"`,
    parentAuthor: parentComment.user.name,
    replyAuthor: newComment.user.name,
    replyContent: newComment.desc.substring(0, 100) + '...',
    postTitle: post.title,
    postUrl: `${process.env.NEXTAUTH_URL}/posts/${post.slug}#comment-${newComment.id}`
  });

  // Aquí se podría integrar con un servicio de email real:
  /*
  try {
    await sendEmail({
      to: parentComment.user.email,
      subject: `Nueva respuesta a tu comentario en "${post.title}"`,
      html: `
        <h2>¡Tienes una nueva respuesta!</h2>
        <p>Hola ${parentComment.user.name},</p>
        <p><strong>${newComment.user.name}</strong> ha respondido a tu comentario en el post "<strong>${post.title}</strong>":</p>
        <blockquote style="border-left: 3px solid #007acc; padding-left: 15px; margin: 20px 0;">
          ${newComment.desc}
        </blockquote>
        <p><a href="${process.env.NEXTAUTH_URL}/posts/${post.slug}#comment-${newComment.id}" style="background: #007acc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver respuesta</a></p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Si no quieres recibir estas notificaciones, puedes desactivarlas en tu perfil.
        </p>
      `
    });
  } catch (error) {
    console.error('Error enviando notificación por email:', error);
  }
  */
};

export const sendMentionNotification = async (mentionedUser, comment, post) => {
  console.log('📧 Nueva mención:', {
    to: mentionedUser.email,
    subject: `Te han mencionado en "${post.title}"`,
    mentionedBy: comment.user.name,
    content: comment.desc.substring(0, 100) + '...',
    postTitle: post.title,
    postUrl: `${process.env.NEXTAUTH_URL}/posts/${post.slug}#comment-${comment.id}`
  });
};

// Función para detectar menciones en comentarios (@username)
export const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};