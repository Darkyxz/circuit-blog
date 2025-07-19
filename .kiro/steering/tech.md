# Technology Stack & Build System

## Core Stack
- **Framework**: Next.js 13.4.19 (App Router)
- **Runtime**: React 18.2.0
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js with OAuth providers (Google, GitHub)
- **Styling**: CSS Modules
- **Package Manager**: Bun (primary), npm/yarn supported
- **Testing**: Vitest with React Testing Library
- **Linting**: ESLint with Next.js config

## Key Dependencies
- **Editor**: React Quill for rich text editing
- **Image Handling**: Cloudinary + Firebase Storage
- **Data Fetching**: SWR for client-side data fetching
- **Form Validation**: React Hook Form + Zod schemas
- **HTML Parsing**: html-react-parser with DOMPurify sanitization

## Development Commands
```bash
# Development server
bun run dev          # Start dev server on localhost:3000
npm run dev          # Alternative with npm

# Production build
bun run build        # Build for production
bun run start        # Start production server

# Code quality
bun run lint         # Run ESLint

# Database operations
bunx prisma generate # Generate Prisma client
bunx prisma db push  # Sync schema with database
bunx prisma studio   # Open database GUI

# Testing
bun test            # Run Vitest tests
```

## Environment Setup
- Copy `.env.example` to `.env.local`
- Configure MongoDB connection (local or Atlas)
- Set up OAuth providers (Google, GitHub)
- Configure Firebase for image storage
- Generate NextAuth secret key

## Build Configuration
- **Output**: Standalone mode for deployment
- **Images**: Optimized with next/image, supports Cloudinary/Firebase domains
- **Path Aliases**: `@/*` maps to `./src/*`
- **Deployment**: Configured for Render with `render.yaml`