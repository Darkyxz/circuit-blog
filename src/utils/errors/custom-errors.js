// Clases de error personalizadas para mejor manejo de errores

export class BaseError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends BaseError {
  constructor(message, field = null, value = null) {
    super(message, 400, true)
    this.field = field
    this.value = value
    this.type = 'VALIDATION_ERROR'
  }
}

export class AuthenticationError extends BaseError {
  constructor(message = 'Authentication required') {
    super(message, 401, true)
    this.type = 'AUTHENTICATION_ERROR'
  }
}

export class AuthorizationError extends BaseError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, true)
    this.type = 'AUTHORIZATION_ERROR'
  }
}

export class NotFoundError extends BaseError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, true)
    this.type = 'NOT_FOUND_ERROR'
    this.resource = resource
  }
}

export class ConflictError extends BaseError {
  constructor(message = 'Resource already exists') {
    super(message, 409, true)
    this.type = 'CONFLICT_ERROR'
  }
}

export class RateLimitError extends BaseError {
  constructor(message = 'Rate limit exceeded', retryAfter = 60) {
    super(message, 429, true)
    this.type = 'RATE_LIMIT_ERROR'
    this.retryAfter = retryAfter
  }
}

export class DatabaseError extends BaseError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, true)
    this.type = 'DATABASE_ERROR'
    this.originalError = originalError
  }
}

export class ExternalServiceError extends BaseError {
  constructor(service, message = 'External service error', statusCode = 502) {
    super(message, statusCode, true)
    this.type = 'EXTERNAL_SERVICE_ERROR'
    this.service = service
  }
}

export class FileUploadError extends BaseError {
  constructor(message = 'File upload failed', fileType = null, fileSize = null) {
    super(message, 400, true)
    this.type = 'FILE_UPLOAD_ERROR'
    this.fileType = fileType
    this.fileSize = fileSize
  }
}

// Utility para verificar si un error es operacional
export const isOperationalError = (error) => {
  if (error instanceof BaseError) {
    return error.isOperational
  }
  return false
}

// Utility para formatear errores para respuestas API
export const formatErrorResponse = (error, includeStack = false) => {
  const response = {
    error: {
      message: error.message,
      type: error.type || 'UNKNOWN_ERROR',
      statusCode: error.statusCode || 500,
      timestamp: new Date().toISOString()
    }
  }
  
  // Incluir campos adicionales según el tipo de error
  if (error instanceof ValidationError) {
    response.error.field = error.field
    response.error.value = error.value
  }
  
  if (error instanceof RateLimitError) {
    response.error.retryAfter = error.retryAfter
  }
  
  if (error instanceof NotFoundError) {
    response.error.resource = error.resource
  }
  
  if (error instanceof ExternalServiceError) {
    response.error.service = error.service
  }
  
  if (error instanceof FileUploadError) {
    response.error.fileType = error.fileType
    response.error.fileSize = error.fileSize
  }
  
  // Incluir stack trace solo en desarrollo
  if (includeStack && process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack
  }
  
  return response
}

// Utility para loggear errores
export const logError = (error, context = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      type: error.type,
      isOperational: error.isOperational
    },
    context
  }
  
  // En producción, aquí se podría integrar con servicios como Sentry
  if (process.env.NODE_ENV === 'production') {
    // Ejemplo: Sentry.captureException(error, { extra: context })
    console.error('ERROR:', JSON.stringify(logData, null, 2))
  } else {
    console.error('ERROR:', logData)
  }
}

// Utility para manejar errores de Prisma
export const handlePrismaError = (error) => {
  if (error.code === 'P2002') {
    // Violación de constraint único
    const field = error.meta?.target?.[0] || 'field'
    return new ConflictError(`${field} already exists`)
  }
  
  if (error.code === 'P2025') {
    // Registro no encontrado
    return new NotFoundError('Record')
  }
  
  if (error.code === 'P2003') {
    // Violación de foreign key
    return new ValidationError('Invalid reference')
  }
  
  // Error genérico de base de datos
  return new DatabaseError('Database operation failed', error)
}

// Utility para manejar errores de validación de Zod
export const handleZodError = (error) => {
  const firstError = error.errors[0]
  return new ValidationError(
    firstError.message,
    firstError.path.join('.'),
    firstError.received
  )
}
