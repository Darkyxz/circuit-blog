import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { 
  BaseError, 
  ValidationError, 
  AuthenticationError,
  formatErrorResponse,
  logError,
  handlePrismaError,
  handleZodError,
  isOperationalError
} from './custom-errors'

// Middleware principal para manejo de errores en rutas API
export function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res)
    } catch (error) {
      return handleError(error, req)
    }
  }
}

// Función principal para manejar errores
export function handleError(error, req = null) {
  // Contexto adicional para logging
  const context = {
    url: req?.url || 'unknown',
    method: req?.method || 'unknown',
    userAgent: req?.headers?.['user-agent'] || 'unknown',
    ip: req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown'
  }

  let processedError = error

  // Procesar diferentes tipos de errores
  if (error instanceof ZodError) {
    processedError = handleZodError(error)
  } else if (error instanceof PrismaClientKnownRequestError) {
    processedError = handlePrismaError(error)
  } else if (!(error instanceof BaseError)) {
    // Convertir errores desconocidos a BaseError
    processedError = new BaseError(
      process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : error.message,
      500,
      false
    )
  }

  // Loggear el error
  logError(processedError, context)

  // Formatear respuesta
  const errorResponse = formatErrorResponse(
    processedError,
    process.env.NODE_ENV === 'development'
  )

  // Retornar respuesta HTTP
  return NextResponse.json(
    errorResponse,
    { 
      status: processedError.statusCode || 500,
      headers: {
        'Content-Type': 'application/json',
        ...(processedError.retryAfter && {
          'Retry-After': processedError.retryAfter.toString()
        })
      }
    }
  )
}

// Utility para crear respuestas de error estandarizadas
export function createErrorResponse(error, statusCode = 500) {
  const formattedError = formatErrorResponse(error)
  
  return NextResponse.json(
    formattedError,
    { 
      status: statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

// Utility para validar request con schema
export function validateRequest(schema, data) {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      throw handleZodError(error)
    }
    throw error
  }
}

// Utility para validar query parameters
export function validateQuery(schema, url) {
  const { searchParams } = new URL(url)
  const queryObject = {}
  
  // Solo incluir parámetros que tienen valores no vacíos
  for (const [key, value] of searchParams.entries()) {
    if (value !== '') {
      queryObject[key] = value
    }
  }
  
  return validateRequest(schema, queryObject)
}

// Utility para validar body de request
export async function validateBody(schema, req) {
  try {
    const body = await req.json()
    return validateRequest(schema, body)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON in request body')
    }
    throw error
  }
}

// Utility para manejo de errores asíncronos
export function asyncHandler(fn) {
  return async (req, res) => {
    try {
      return await fn(req, res)
    } catch (error) {
      return handleError(error, req)
    }
  }
}

// Utility para timeout de requests
export function withTimeout(handler, timeoutMs = 30000) {
  return async (req, res) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new BaseError('Request timeout', 408))
      }, timeoutMs)
    })

    try {
      return await Promise.race([
        handler(req, res),
        timeoutPromise
      ])
    } catch (error) {
      return handleError(error, req)
    }
  }
}

// Utility para rate limiting básico
const requestCounts = new Map()

export function withRateLimit(handler, maxRequests = 100, windowMs = 60000) {
  return async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs

    // Limpiar requests antiguos
    const userRequests = requestCounts.get(ip) || []
    const recentRequests = userRequests.filter(time => time > windowStart)

    if (recentRequests.length >= maxRequests) {
      const error = new BaseError('Rate limit exceeded', 429)
      error.retryAfter = Math.ceil(windowMs / 1000)
      throw error
    }

    // Agregar request actual
    recentRequests.push(now)
    requestCounts.set(ip, recentRequests)

    return handler(req, res)
  }
}

// Utility para CORS básico
export function withCors(handler, options = {}) {
  const defaultOptions = {
    origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }

  const corsOptions = { ...defaultOptions, ...options }

  return async (req, res) => {
    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': corsOptions.origin,
          'Access-Control-Allow-Methods': corsOptions.methods.join(', '),
          'Access-Control-Allow-Headers': corsOptions.allowedHeaders.join(', '),
          'Access-Control-Max-Age': '86400'
        }
      })
    }

    const response = await handler(req, res)
    
    // Agregar headers CORS a la respuesta
    response.headers.set('Access-Control-Allow-Origin', corsOptions.origin)
    response.headers.set('Access-Control-Allow-Methods', corsOptions.methods.join(', '))
    response.headers.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '))

    return response
  }
}
