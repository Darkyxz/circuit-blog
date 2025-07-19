import { z } from 'zod'

// Categorías válidas del sistema
const VALID_CATEGORIES = [
  'programming',
  'artificial-intelligence',
  'gaming',
  'docker',
  'mcps',
  'web-development',
  'mobile-development',
  'devops',
  'machine-learning',
  'cybersecurity',
  'blockchain',
  'cloud-computing'
]

// Schema para crear un post
export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .trim(),
  
  desc: z
    .string()
    .min(50, 'El contenido debe tener al menos 50 caracteres')
    .max(50000, 'El contenido no puede exceder 50000 caracteres'),
  
  img: z
    .string()
    .url('La URL de la imagen debe ser válida')
    .optional()
    .or(z.literal('')),
  
  catSlug: z
    .enum(VALID_CATEGORIES, {
      errorMap: () => ({ message: 'Categoría inválida' })
    }),
  
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(100, 'El slug no puede exceder 100 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug debe contener solo letras minúsculas, números y guiones'),
  
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .default('PUBLISHED')
    .optional(),
    
  featured: z
    .boolean()
    .default(false)
    .optional()
})

// Schema para actualizar un post
export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().min(1, 'ID requerido')
})

// Schema para query parameters de posts
export const postsQuerySchema = z.object({
  page: z
    .string()
    .transform(val => {
      const parsed = parseInt(val, 10)
      return isNaN(parsed) ? 1 : Math.max(1, parsed)
    })
    .default('1')
    .optional(),
  
  cat: z
    .string()
    .refine(val => VALID_CATEGORIES.includes(val), {
      message: 'Invalid category'
    })
    .optional(),
  
  search: z
    .string()
    .min(1, 'La búsqueda debe tener al menos 1 caracter')
    .max(100, 'La búsqueda no puede exceder 100 caracteres')
    .optional(),
  
  limit: z
    .string()
    .transform(val => {
      const parsed = parseInt(val, 10)
      return isNaN(parsed) ? 6 : Math.min(50, Math.max(1, parsed))
    })
    .default('6')
    .optional(),
    
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .default('PUBLISHED')
    .optional(),
    
  featured: z
    .string()
    .transform(val => val === 'true')
    .optional()
}).transform(data => ({
  page: data.page || 1,
  cat: data.cat || undefined,
  search: data.search || undefined,
  limit: data.limit || 6,
  status: data.status || 'PUBLISHED',
  featured: data.featured
}))

// Schema para slug de post
export const postSlugSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug requerido')
    .max(100, 'Slug demasiado largo')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido')
})

// Utility para limpiar HTML
export const sanitizeHtml = (html) => {
  // Permitir solo tags básicos y seguros
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre']
  const allowedAttributes = {
    a: ['href', 'title', 'target'],
    img: ['src', 'alt', 'title', 'width', 'height']
  }
  
  // Remover scripts y eventos
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
}

// Validar tamaño de imagen
export const validateImageSize = (file) => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  return file.size <= maxSize
}

// Validar tipo de imagen
export const validateImageType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  return allowedTypes.includes(file.type)
}

export { VALID_CATEGORIES }
