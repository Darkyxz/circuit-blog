import { z } from 'zod'

// Schema para crear un comentario
export const createCommentSchema = z.object({
  desc: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(2000, 'El comentario no puede exceder 2000 caracteres')
    .trim(),
  
  postSlug: z
    .string()
    .min(1, 'Post slug requerido')
    .max(100, 'Post slug demasiado largo')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Post slug inválido'),
    
  parentId: z
    .string()
    .optional()
    .nullable()
})

// Schema para actualizar un comentario
export const updateCommentSchema = z.object({
  desc: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(2000, 'El comentario no puede exceder 2000 caracteres')
    .trim()
    .optional(),
  
  status: z
    .enum(['PENDING', 'APPROVED', 'REJECTED'])
    .optional()
})

// Schema para query de comentarios
export const commentsQuerySchema = z.object({
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
    .pipe(z.number().min(1).max(50).default(20))
    .optional(),
    
  status: z
    .enum(['PENDING', 'APPROVED', 'REJECTED'])
    .optional()
})

// Schema para moderación de comentarios
export const moderateCommentSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  action: z.enum(['approve', 'reject', 'delete']),
  reason: z
    .string()
    .max(500, 'La razón no puede exceder 500 caracteres')
    .optional()
})

// Schema para eliminar comentario
export const deleteCommentSchema = z.object({
  id: z.string().min(1, 'ID requerido')
})

// Utility para limpiar comentarios
export const sanitizeComment = (comment) => {
  // Remover HTML tags y scripts
  return comment
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .trim()
}

// Validar contenido ofensivo básico
export const containsOffensiveContent = (text) => {
  const offensiveWords = [
    'spam', 'fake', 'scam', 'porn', 'xxx'
    // Añadir más palabras según necesidades
  ]
  
  const lowerText = text.toLowerCase()
  return offensiveWords.some(word => lowerText.includes(word))
}

// Rate limiting para comentarios
export const COMMENT_RATE_LIMIT = {
  maxPerHour: 10,
  maxPerDay: 50,
  cooldownMinutes: 2
}
