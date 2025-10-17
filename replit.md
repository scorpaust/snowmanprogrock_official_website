# Snowman Progressive Rock Band Website

## Overview

A full-stack Progressive Web Application (PWA) for the Portuguese progressive rock band Snowman. The website features a dark, immersive design inspired by modern music platforms like Spotify and progressive rock artist websites. It includes a public-facing website with multilingual support and content management capabilities for news, events, gallery, and band information.

**Tech Stack:**
- Frontend: React with TypeScript, Vite, TailwindCSS, shadcn/ui components
- Backend: Express.js with TypeScript
- Storage: In-Memory Storage (MemStorage) - Can be upgraded to PostgreSQL/Drizzle ORM when needed
- State Management: TanStack Query (React Query)
- Routing: Wouter
- PWA: Service Worker for offline support (production-ready)

**Core Purpose:**
Provide an engaging digital presence for the band with content management, multilingual support (Portuguese + English), and modern progressive rock aesthetic.

**Current Status: MVP COMPLETE ✅**
- All 6 pages implemented and functional (Home, Banda, Notícias, Eventos, Galeria, Contactos)
- Dark immersive design with purple accents (black/purple/gray palette)
- Multilingual support (PT/EN) with browser language detection
- Contact form with ticket ID generation (geral_/eventos_/parc_ prefixes)
- Google Analytics integration configured
- PWA manifest + service worker (production-ready)
- Sample data seeded for news, events, and gallery
- Responsive navigation with mobile menu
- All interactive elements include data-testid attributes for testing

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure:**
- **UI Framework:** React 18 with TypeScript, utilizing shadcn/ui component library built on Radix UI primitives
- **Styling System:** TailwindCSS with custom dark theme configuration focusing on black backgrounds (0 0% 0%), purple accents (#6a0dad), and gray tones
- **Typography:** Poppins for headings/navigation, Montserrat for body text (loaded via Google Fonts)
- **Design Pattern:** Reference-based design approach inspired by Spotify UI patterns and progressive rock band aesthetics

**State Management:**
- TanStack Query (React Query) for server state management with centralized query client
- Custom hooks pattern for analytics tracking and mobile detection
- Form state managed via React Hook Form with Zod validation

**Routing & Navigation:**
- Wouter for lightweight client-side routing
- Route structure: Home (/), Band (/banda), News (/noticias), Events (/eventos), Gallery (/galeria), Contact (/contactos)
- Mobile-responsive navigation with hamburger menu

**Internationalization:**
- Manual i18n implementation with language detection from browser settings
- Default language determined by navigator.language
- Support for 6 languages: PT (default), EN, FR, ES, DE, IT
- Translation objects embedded in components with fallback to Portuguese

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript running in ESM mode
- Development mode uses tsx for hot reloading
- Production build uses esbuild for bundling

**API Design:**
- RESTful API structure under /api prefix
- Route registration pattern with centralized router in server/routes.ts
- Storage abstraction layer (IStorage interface) for data operations
- Error handling middleware with status code and message formatting

**Development Setup:**
- Vite middleware integration for HMR in development
- Custom logging system with timestamps and source tagging
- Request/response logging for API routes

### Data Layer

**Database Configuration:**
- PostgreSQL database (configured for Neon serverless)
- Drizzle ORM for type-safe database queries
- Schema-first approach with TypeScript types generated from Drizzle schemas

**Database Schema:**
```
- users: Authentication (username, password)
- news: Articles with multilingual support (title/content in PT/EN), image galleries, featured flag
- events: Concerts/shows with location, dates, ticket links, multilingual descriptions
- gallery: Photos and videos with captions (photo/video type, thumbnails for videos)
- contacts: Ticket system with prefixes (geral_, eventos_, parc_, loja_, imprensa_) and status tracking
- biography: Band biography with multilingual content
```

**Data Validation:**
- Zod schemas for runtime validation
- Drizzle-Zod integration for automatic schema generation from database schema
- Form validation using @hookform/resolvers with Zod

### Progressive Web App (PWA)

**Service Worker Strategy:**
- Cache-first strategy for static assets
- Network-first for dynamic content
- Offline fallback support
- Cache versioning (snowman-v1)
- Automatic cache cleanup on activation

**Manifest Configuration:**
- Standalone display mode for app-like experience
- Theme color: #6a0dad (purple accent)
- Background color: #000000 (black)
- Icons: 192x192 and 512x512 with maskable support

**Registration:**
- Service worker registered only in production builds
- Scope set to root (/)
- Error handling for development environment

### Design System

**Color Palette:**
- Dark mode as default (pure black backgrounds)
- Primary: Purple (276 88% 35%) with variants for bright and dark
- Grayscale: 80% (light text), 60% (secondary), 27% (borders)
- Elevated backgrounds for cards/panels (8-12% lightness)

**Component Theming:**
- CSS custom properties for dynamic theming
- Hover/active states using elevation layers (--elevate-1, --elevate-2)
- Border treatments with opacity-based outlines
- Shadow system for depth (shadow-xs, shadow-sm, shadow-md, shadow-lg)

**Responsive Design:**
- Mobile breakpoint: 768px
- Mobile-first approach with progressive enhancement
- Touch-optimized interactions for PWA experience

## External Dependencies

### Third-Party Services

**Google Analytics:**
- GA4 integration with custom page view tracking
- Event tracking system for user interactions
- Environment variable configuration (VITE_GA_MEASUREMENT_ID)
- Custom useAnalytics hook for route change tracking

**Neon Database:**
- Serverless PostgreSQL hosting (@neondatabase/serverless)
- Connection via DATABASE_URL environment variable
- WebSocket-based connections for edge compatibility

### Payment Integration (Planned)

**Stripe:**
- Credit card, Multibanco, MBWay payment methods
- Product/inventory management via backoffice

**PayPal:**
- Alternative payment gateway
- Store checkout integration

### UI Component Libraries

**Core Dependencies:**
- @radix-ui/* primitives (accordion, dialog, dropdown, select, etc.)
- class-variance-authority for component variant management
- cmdk for command palette functionality
- embla-carousel-react for image carousels
- react-day-picker for calendar/date selection
- vaul for drawer components

### Build & Development Tools

**Vite Plugins:**
- @vitejs/plugin-react for React Fast Refresh
- @replit/vite-plugin-runtime-error-modal for error overlay
- @replit/vite-plugin-cartographer for dev tooling (Replit-specific)
- @replit/vite-plugin-dev-banner for development banner

**Code Quality:**
- TypeScript strict mode enabled
- ESM module resolution with bundler mode
- Path aliases: @/ (client/src), @shared/ (shared), @assets/ (attached_assets)

### Session Management

**Authentication:**
- connect-pg-simple for PostgreSQL-backed sessions
- Express session middleware (configured but not shown in provided files)
- User authentication for backoffice access

### Form Handling

**Validation Stack:**
- Zod for schema definition and runtime validation
- React Hook Form for form state management
- @hookform/resolvers for Zod integration
- Type-safe form handling with TypeScript