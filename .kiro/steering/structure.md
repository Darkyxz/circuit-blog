# Project Structure & Organization

## Root Directory
```
├── src/                    # Source code
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets (images, icons)
├── .kiro/                  # Kiro AI assistant configuration
├── .env.local              # Environment variables (not committed)
├── next.config.js          # Next.js configuration
└── package.json            # Dependencies and scripts
```

## Source Code Structure (`src/`)

### App Router (`src/app/`)
- **Next.js 13+ App Router structure**
- Each folder represents a route
- `layout.js` for shared layouts
- `page.jsx` for route components
- `api/` for API endpoints

### Key Routes
- `/` - Homepage with featured posts
- `/blog` - Blog listing with pagination
- `/posts/[slug]` - Individual post pages
- `/write` - Post creation/editing (authenticated)
- `/admin` - Administrative dashboard
- `/login` - Authentication page

### Components (`src/components/`)
- **Organized by feature/functionality**
- Each component has its own folder with `.jsx` and `.module.css`
- Reusable UI components in `ui/` subfolder
- Component naming: PascalCase for folders and files

### Core Directories
- `context/` - React Context providers (Theme, etc.)
- `hooks/` - Custom React hooks
- `providers/` - App-level providers (Auth, Theme)
- `schemas/` - Zod validation schemas
- `utils/` - Utility functions and configurations
- `middleware/` - Authentication and route protection

## Naming Conventions
- **Files**: PascalCase for components (`Card.jsx`)
- **Folders**: camelCase for utilities, PascalCase for components
- **CSS Modules**: `component.module.css`
- **API Routes**: lowercase with hyphens (`/api/posts/[slug]`)

## Database Models (Prisma)
- `User` - User accounts with roles (ADMIN, EDITOR, AUTHOR, USER)
- `Post` - Blog posts with status (DRAFT, PUBLISHED, ARCHIVED)
- `Category` - Post categories with slugs
- `Comment` - Nested comments with moderation
- `Like` - Post likes/reactions
- `Account/Session` - NextAuth.js authentication

## Asset Organization
- `public/` - Static images, icons, and assets
- Images organized by category (logos, social icons, etc.)
- Use Next.js Image component for optimization

## Configuration Files
- `jsconfig.json` - Path aliases (`@/*` → `./src/*`)
- `vitest.config.js` - Testing configuration
- `.eslintrc.json` - Code linting rules
- `render.yaml` - Deployment configuration