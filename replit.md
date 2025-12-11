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

**Current Status: Backoffice System + Enhanced Features ✅**
- All 6 frontoffice pages implemented (Home, Banda, Notícias, Eventos, Galeria, Contactos)
- **Complete backoffice authentication system** with secure login/logout, session management
- **Admin dashboard** with statistics cards and sidebar navigation (Notícias, Eventos, Galeria, Produtos, Biografia, Membros, Utilizadores)
- **Band member management system** with multilingual roles (PT/EN/FR/ES/DE), image upload, display order, and active status
- Dark immersive design with purple accents (black/purple/gray palette)
- **Full multilingual support (PT, EN, FR, ES, DE)** with automatic browser language detection and dropdown selector
- **5-category contact form** (Geral, Eventos, Parcerias, Loja, Imprensa) with conditional fields and ticket ID generation
- E-commerce with Stripe integration (cards, Multibanco, MB WAY, PayPal)
- Google Analytics integration configured
- PWA manifest + service worker (production-ready)
- Admin credentials: admin / snowman2024 (email: snowmanprogrock@gmail.com)
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
- **Support for 5 languages: Portuguese (PT), English (EN), French (FR), Spanish (ES), German (DE)**
- Language selector dropdown in navigation
- Default language determined by navigator.language with PT fallback
- Complete UI translations including contact form categories and fields
- Date localization using proper locale strings (pt-PT, en-US, fr-FR, es-ES, de-DE)
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
- users: Backoffice authentication (username, email, password, role: admin/editor, isActive)
- user_profiles: Frontoffice customer accounts (email, password, name, address, phone, etc.)
- news: Articles with multilingual support (title/content in PT/EN), image galleries, featured flag
- events: Concerts/shows with location, dates, ticket links, multilingual descriptions
- gallery: Photos and videos with captions (photo/video type, thumbnails for videos)
- contacts: Ticket system with prefixes (geral_, eventos_, parc_, loja_, imprensa_) and status tracking
- biography: Band biography with multilingual content
- band_members: Band members with multilingual roles (name, role PT/EN/FR/ES/DE, image, displayOrder, isActive)
- categories: Product categories (name PT/EN, slug, description)
- products: Store products (name, description, price in cents, type, stock, images)
- orders: Customer orders (linked to user_profile if authenticated, order details, payment info)
- order_items: Items in each order
- comments: User comments on news and products (pending approval by admin)
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

### Object Storage & File Upload System

**Replit Object Storage Integration:**
- Google Cloud Storage bucket (replit-objstore-27e035e7-69a4-4c39-ba1e-7660c7ae7352)
- Environment variables: DEFAULT_OBJECT_STORAGE_BUCKET_ID, PUBLIC_OBJECT_SEARCH_PATHS, PRIVATE_OBJECT_DIR
- Bucket configured with private directory (.private/) for user uploads
- Public directory for static assets served directly

**File Upload Architecture:**
- **Frontend:** ObjectUploader component using Uppy v4 Dashboard (@uppy/core, @uppy/dashboard, @uppy/react)
- **Backend:** ObjectStorageService class (server/objectStorage.ts) with presigned URL generation
- **Flow:** Client requests presigned URL → uploads directly to GCS → normalizes path via API → stores /objects/uploads/{uuid} in database
- **Security:** All upload endpoints protected with requireAuth middleware
- **Path Normalization:** Automatic conversion of GCS signed URLs to /objects/{entityId} format for database storage

**Upload Features:**
- Drag-and-drop file selection with preview
- Progress tracking and error handling
- Support for images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, OGG)
- Automatic thumbnail generation for videos
- Direct PC upload capability (no URL-only limitation)

**API Endpoints:**
- POST /api/objects/upload - Generate presigned URL for file upload (requireAuth)
- POST /api/objects/normalize-path - Convert GCS URL to /objects/{id} format (requireAuth)
- GET /objects/:id - Serve uploaded files with proper content-type headers

**Current Integration:**
- Gallery Management: Full upload support for main images and video thumbnails
- Next: Extend to Products, News, Events, Biography admin forms

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

### E-Commerce & Payment Integration

**Store Features:**
- Product catalog with categories (Physical Products, Digital Products, Merchandise)
- Product detail pages with image galleries
- Shopping cart with localStorage persistence
- Multi-step checkout flow with customer information collection
- Order management with status tracking (pending, paid, shipped, cancelled)

**Stripe Integration (Production-Ready):**
- Full Payment Element implementation with automatic payment method detection
- Payment methods for Portugal: Cards (Visa, Mastercard, Amex), Multibanco, MB WAY
- PayPal support available when enabled in Stripe Dashboard
- Correct EUR to cents conversion for all payment intents
- Payment confirmation flow with order status updates
- Webhook support for payment status changes (requires STRIPE_WEBHOOK_SECRET)
- Test mode support with test cards (4242 4242 4242 4242)

**Payment Configuration:**
- Backend: Automatic payment methods enabled with redirect support (allow_redirects: 'always')
- Frontend: PaymentElement with tabs layout for better UX
- Environment variables: STRIPE_SECRET_KEY, VITE_STRIPE_PUBLIC_KEY, STRIPE_WEBHOOK_SECRET
- Documentation: See STRIPE_SETUP.md for detailed setup instructions

**Known Considerations:**
- Payment methods availability depends on Stripe Dashboard configuration
- Multibanco and MB WAY must be explicitly enabled in Stripe account settings
- PayPal integration via Stripe requires business account verification
- All amounts are stored in EUR and converted to cents (Math.round(amount * 100)) before creating payment intents

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