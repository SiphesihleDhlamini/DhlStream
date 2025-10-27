# DhlStream - Personal Media Streaming Platform

## Overview

DhlStream is a Netflix-style personal streaming platform that allows users to stream their local movie and TV show collection through a beautiful web interface. The application scans local directories for media files and presents them in an immersive, content-first browsing experience inspired by premium streaming services like Netflix, Disney+, and HBO Max.

The platform features user authentication, watch progress tracking, and a responsive design optimized for both desktop and mobile viewing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query)** for server state management and data fetching
- **Shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens

**Design System:**
- Dark-optimized interface with light mode support
- Custom color system using CSS variables for theming
- Typography: Inter (UI) + Playfair Display (accents)
- Spacing follows Tailwind's standard scale (2, 4, 6, 8, 12, 16, 24)
- Component-based architecture with reusable UI primitives

**Key Frontend Components:**
- Protected route wrapper for authentication
- Video player with custom controls and progress tracking
- Content cards with hover effects and play buttons
- Horizontal scrolling content rows
- Hero section for featured content
- Responsive navigation bar with backdrop blur

### Backend Architecture

**Technology Stack:**
- **Express.js** server with TypeScript
- **File-based storage** for user credentials and watch progress
- **Session-based authentication** using in-memory store
- **Local filesystem scanning** for media content discovery

**API Design:**
- RESTful endpoints for authentication (`/api/auth/*`)
- Content discovery endpoints (`/api/content/*`)
- Video streaming endpoint (`/api/stream/:id`)
- Progress tracking endpoint (`/api/progress`)

**Session Management:**
- Cookie-based sessions with 7-day expiration
- In-memory session store (Map-based)
- Session validation middleware for protected routes

### Data Storage Solutions

**Current Implementation (Updated):**
- **Database:** PostgreSQL via Neon Database with Drizzle ORM
  - `users` table: User authentication data
  - `watch_progress` table: Persistent playback positions and completion status
  - `watchlist` table: User's saved content for later viewing
- **Media Files:** Local filesystem at `/Downloads/DhlStream/Movies` and `/Downloads/DhlStream/Series`
- **Subtitle Files:** Scanned alongside video files (.srt, .vtt formats)

**Database Schema:**
- Users table with username/password authentication
- Watch progress tracking with user ID, content ID, current time, duration, and completion status
- Watchlist for saving movies and series to personal lists
- All tables use UUID primary keys and proper foreign key relationships

### Authentication and Authorization

**Authentication Flow:**
- Username/password based authentication
- Password stored in plain text (development setup)
- Session created on successful login with unique session ID
- Session ID stored in HTTP-only cookie
- Protected routes validate session before rendering

**Authorization Pattern:**
- `requireAuth` middleware extracts and validates session from cookies
- Returns 401 Unauthorized for invalid/expired sessions
- Session expiration set to 7 days from creation

**Security Considerations:**
Current implementation is development-focused. Production deployment would require:
- Password hashing (bcrypt/argon2)
- HTTPS-only cookies
- CSRF protection
- Rate limiting on authentication endpoints

### External Dependencies

**Media Content:**
- Local filesystem directories: `/Downloads/DhlStream/Movies` and `/Downloads/DhlStream/Series`
- Video files streamed directly from filesystem
- Application expects specific directory structure for movies vs. series

**UI Component Library:**
- Radix UI primitives for accessible, unstyled components
- Shadcn/ui configuration for customized component variants
- Embla Carousel for content scrolling

**Development Tools:**
- Replit-specific plugins for development (cartographer, dev banner, runtime error overlay)
- Only active in development mode when `REPL_ID` is present

**Database (Configured but Inactive):**
- Neon Database (serverless PostgreSQL) via `@neondatabase/serverless`
- Drizzle ORM for type-safe database queries
- Migration system configured but not currently in use

**Build and Bundling:**
- esbuild for server-side bundling
- Vite for client-side bundling with React plugin
- PostCSS with Tailwind and Autoprefixer

**Type Safety:**
- Shared schema types between client and server via `shared/schema.ts`
- Zod for runtime validation and schema inference
- TypeScript strict mode enabled