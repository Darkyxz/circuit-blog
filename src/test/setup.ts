import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js image
vi.mock('next/image', () => ({
  default: (props: any) => {
    return React.createElement('img', props)
  },
}))

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock dynamic imports
vi.mock('next/dynamic', () => ({
  default: (importFunc: any) => {
    const Component = importFunc()
    return Component
  },
}))

// Global test utilities
global.fetch = vi.fn()

// Mock window.Worker
global.Worker = class Worker {
  constructor(public url: string) {}
  postMessage = vi.fn()
  terminate = vi.fn()
  onmessage = vi.fn()
  onerror = vi.fn()
}
