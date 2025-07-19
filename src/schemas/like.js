import { z } from 'zod'

// Schema para crear/eliminar un like
export const likeActionSchema = z.object({
  postSlug: z
    .string()
    .min(1, 'Post slug requerido')
    .max(100, 'Post slug demasiado largo')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Post slug inválido'),
  
  action: z
    .enum(['like', 'unlike'])
    .default('like')
})

// Schema para obtener likes de un post
export const postLikesSchema = z.object({
  postSlug: z
    .string()
    .min(1, 'Post slug requerido')
    .max(100, 'Post slug demasiado largo')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Post slug inválido'),
  
  page: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(1).default(1))
    .optional(),
  
  limit: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(1).max(100).default(50))
    .optional()
})

// Schema para obtener posts que le han gustado a un usuario
export const userLikesSchema = z.object({
  userEmail: z
    .string()
    .email('Email inválido')
    .optional(),
  
  page: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(1).default(1))
    .optional(),
  
  limit: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(1).max(50).default(20))
    .optional()
})

// Rate limiting para likes
export const LIKE_RATE_LIMIT = {
  maxPerMinute: 30,
  maxPerHour: 200,
  cooldownSeconds: 1
}

// Validar si el usuario puede dar like
export const canUserLike = (userRole, postStatus) => {
  if (postStatus !== 'PUBLISHED') {
    return false
  }
  
  // Todos los usuarios autenticados pueden dar like
  return ['USER', 'AUTHOR', 'EDITOR', 'ADMIN'].includes(userRole)
}

// Utility para formatear datos de like
export const formatLikeData = (like) => ({
  id: like.id,
  createdAt: like.createdAt,
  user: {
    name: like.user?.name || 'Usuario',
    email: like.user?.email,
    image: like.user?.image
  },
  post: {
    slug: like.post?.slug,
    title: like.post?.title
  }
})

// Utility para calcular estadísticas de likes
export const calculateLikeStats = (likes) => {
  const stats = {
    total: likes.length,
    recent: 0,
    byTimeOfDay: Array(24).fill(0),
    byDayOfWeek: Array(7).fill(0),
    topUsers: {}
  }
  
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  likes.forEach(like => {
    const likeDate = new Date(like.createdAt)
    
    // Likes recientes (último día)
    if (likeDate > oneDayAgo) {
      stats.recent++
    }
    
    // Distribución por hora del día
    const hour = likeDate.getHours()
    stats.byTimeOfDay[hour]++
    
    // Distribución por día de la semana (0 = domingo)
    const dayOfWeek = likeDate.getDay()
    stats.byDayOfWeek[dayOfWeek]++
    
    // Usuarios más activos
    const userEmail = like.userEmail
    stats.topUsers[userEmail] = (stats.topUsers[userEmail] || 0) + 1
  })
  
  return stats
}
