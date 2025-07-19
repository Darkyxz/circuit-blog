import { z } from 'zod'

// Schema para actualizar perfil de usuario
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim()
    .optional(),
  
  bio: z
    .string()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .trim()
    .optional(),
  
  website: z
    .string()
    .url('La URL del sitio web debe ser válida')
    .optional()
    .or(z.literal('')),
  
  twitter: z
    .string()
    .regex(/^@?[\w]{1,15}$/, 'Usuario de Twitter inválido')
    .optional()
    .or(z.literal('')),
  
  github: z
    .string()
    .regex(/^[\w-]{1,39}$/, 'Usuario de GitHub inválido')
    .optional()
    .or(z.literal(''))
})

// Schema para cambiar rol de usuario (solo admin)
export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'ID de usuario requerido'),
  role: z.enum(['ADMIN', 'EDITOR', 'AUTHOR', 'USER']),
  reason: z
    .string()
    .max(500, 'La razón no puede exceder 500 caracteres')
    .optional()
})

// Schema para query de usuarios
export const usersQuerySchema = z.object({
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
  
  role: z
    .enum(['ADMIN', 'EDITOR', 'AUTHOR', 'USER'])
    .optional(),
  
  search: z
    .string()
    .min(2, 'La búsqueda debe tener al menos 2 caracteres')
    .max(100, 'La búsqueda no puede exceder 100 caracteres')
    .optional(),
  
  active: z
    .string()
    .transform(val => val === 'true')
    .pipe(z.boolean())
    .optional()
})

// Schema para banear/desbanear usuario
export const banUserSchema = z.object({
  userId: z.string().min(1, 'ID de usuario requerido'),
  action: z.enum(['ban', 'unban']),
  reason: z
    .string()
    .min(10, 'La razón debe tener al menos 10 caracteres')
    .max(500, 'La razón no puede exceder 500 caracteres')
    .when('action', {
      is: 'ban',
      then: z.string().min(10),
      otherwise: z.string().optional()
    })
})

// Schema para configuración de usuario
export const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.enum(['es', 'en']).default('es'),
  notifications: z.object({
    email: z.boolean().default(true),
    comments: z.boolean().default(true),
    mentions: z.boolean().default(true),
    newsletter: z.boolean().default(false)
  }).default({}),
  privacy: z.object({
    showEmail: z.boolean().default(false),
    showProfile: z.boolean().default(true),
    allowMessages: z.boolean().default(true)
  }).default({})
})

// Validar permisos de usuario
export const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    'USER': 1,
    'AUTHOR': 2,
    'EDITOR': 3,
    'ADMIN': 4
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Validar imagen de perfil
export const validateProfileImage = (file) => {
  const maxSize = 2 * 1024 * 1024 // 2MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  return {
    validSize: file.size <= maxSize,
    validType: allowedTypes.includes(file.type),
    maxSize: '2MB',
    allowedTypes: allowedTypes.join(', ')
  }
}

// Sanitizar nombre de usuario
export const sanitizeUsername = (username) => {
  return username
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase()
    .substring(0, 30)
}

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Rate limiting para acciones de usuario
export const USER_RATE_LIMITS = {
  profileUpdate: {
    maxPerHour: 5,
    cooldownMinutes: 10
  },
  imageUpload: {
    maxPerHour: 10,
    cooldownMinutes: 5
  },
  passwordChange: {
    maxPerDay: 3,
    cooldownMinutes: 60
  }
}
