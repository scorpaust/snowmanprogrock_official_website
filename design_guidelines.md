# Design Guidelines: Snowman Progressive Rock Band Website

## Design Approach

**Selected Approach**: Reference-Based Design with Dark Immersive Aesthetic

**Primary References**: 
- **Spotify** for modern music UI patterns and typography
- **Tool/Daft Punk** artist websites for dark, immersive progressive rock aesthetic
- **Awwwards-winning band sites** for creative layouts and visual impact

**Design Philosophy**: Create a dark, atmospheric digital experience that mirrors progressive rock's complexity and artistry. The design should feel like stepping into the band's sonic universe - bold, unconventional, and visually arresting.

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary** (default experience):
- **Background Base**: 0 0% 0% (pure black)
- **Background Elevated**: 0 0% 8% (near-black for cards/panels)
- **Background Subtle**: 0 0% 12% (hover states, borders)
- **Primary Purple**: 276 88% 35% (deep vibrant purple #6a0dad)
- **Purple Bright**: 276 88% 50% (accent highlights)
- **Purple Dark**: 276 88% 25% (subtle purple tints)
- **Gray Light**: 0 0% 80% (primary text on dark)
- **Gray Medium**: 0 0% 60% (secondary text)
- **Gray Dark**: 0 0% 27% (borders, dividers)

**Accent Usage**:
- Purple reserved for CTAs, active states, and brand moments
- Avoid purple overuse - let black dominate with purple as striking contrast
- Use gradient overlays sparingly: black to transparent over images

### B. Typography

**Font Stack**:
- **Primary**: 'Poppins', sans-serif (headings, navigation, bold statements)
- **Secondary**: 'Montserrat', sans-serif (body text, descriptions)
- Load via Google Fonts CDN

**Type Scale**:
- **Hero Display**: text-6xl to text-8xl (96-128px), font-bold, tracking-tight
- **Section Headings**: text-4xl to text-5xl (48-60px), font-semibold
- **Subheadings**: text-2xl to text-3xl (30-36px), font-medium
- **Body Large**: text-lg (18px), font-normal, leading-relaxed
- **Body**: text-base (16px), font-normal, leading-normal
- **Small/Captions**: text-sm (14px), font-light

**Typographic Voice**: 
- All caps for section labels (e.g., "LATEST NEWS", "UPCOMING SHOWS")
- Generous letter-spacing (tracking-wide) for headings
- Tight line-height for display text, relaxed for body

### C. Layout System

**Spacing Primitives**: Use Tailwind units of **4, 8, 12, 16, 24, 32**
- Micro spacing: p-4, gap-4 (16px)
- Component spacing: p-8, py-12 (32-48px)
- Section spacing: py-16, py-24, py-32 (64-128px)
- Generous negative space is essential for dark aesthetic

**Grid System**:
- **Container**: max-w-7xl (1280px) for main content
- **Full-bleed sections**: w-full for immersive moments
- **Asymmetric layouts**: Mix 60/40 splits, diagonal divisions, overlapping elements
- **Gallery grids**: Masonry-style or Pinterest-like staggered layouts

**Responsive Breakpoints**:
- Mobile: stack to single column, reduce hero text, maintain impact
- Tablet: 2-column max, introduce side-by-side content
- Desktop: Full creative freedom, 3-4 columns for galleries

### D. Component Library

**Navigation**:
- Fixed top navigation with blur backdrop (backdrop-blur-md bg-black/80)
- Logo left, menu items right with purple underline on active/hover
- Mobile: Full-screen overlay menu with fade-in animation
- Language switcher: flag icons top-right corner

**Hero Section** (Home):
- Full-viewport height (min-h-screen) with large band image background
- Dark gradient overlay (bg-gradient-to-b from-black/60 via-black/40 to-black)
- Large hero text with glitch/distortion effect on band name
- Primary CTA button: purple with blur backdrop if over image
- Scroll indicator at bottom (animated chevron or "Scroll" text)

**Cards** (News, Events):
- Dark elevated background (bg-gray-900/50 backdrop-blur)
- Thin purple border on hover (border-purple-600/50)
- Image top, content below with date badge (purple background)
- No shadows - use borders and backdrop blur for depth

**Buttons**:
- **Primary**: bg-purple-600 hover:bg-purple-700, px-8 py-4, rounded-sm (slight rounding)
- **Outline** (on images): border-2 border-white/80 text-white backdrop-blur-md hover:bg-white/10
- **Text Links**: underline decoration-purple-600 decoration-2 underline-offset-4

**Forms** (Contact):
- Dark input fields: bg-gray-900 border-gray-700 focus:border-purple-600
- Label above input, small helper text below
- Multi-mode selector: tab-style buttons with purple active state
- Ticket ID display: monospace font, purple highlight

**Gallery**:
- Masonry grid layout (Tailwind columns or custom grid)
- Lightbox overlay: full-screen with dark backdrop
- Video thumbnails with play icon overlay
- Lazy loading for performance

**Data Displays**:
- Event cards: Date column (purple background) + details column
- News list: Thumbnail + headline + excerpt in horizontal layout
- Biography: Single column max-w-prose with pull quotes in purple

### E. Animations

**Subtle Motion Only**:
- Page transitions: fade-in on route change (300ms)
- Scroll reveals: elements fade up on viewport entry (intersection observer)
- Hover states: scale-105 for cards, color shifts for buttons
- Menu: slide-in from right on mobile (400ms ease)
- **No**: parallax scrolling, excessive scroll-jacking, auto-playing carousels

---

## Page-Specific Guidelines

### Home Page
**Layout**:
1. **Hero**: Full-screen band photo with diagonal text overlay, purple accent line
2. **Latest News**: 2-column featured + 3-card grid of recent posts
3. **Upcoming Shows**: Timeline-style event list with purple markers
4. **Featured Gallery**: Horizontal scroll carousel of recent photos
5. **Newsletter/Social CTA**: Centered with purple gradient background

### Banda / Biografia
- Large band photo top (not full-screen, 60vh)
- Biography text in single column (max-w-3xl) with drop cap
- Member profiles: Grid of circular photos with name overlays on hover
- Discography preview: Album covers in horizontal scroll with purple glow on hover

### Notícias (News)
- Filter tabs: All / Releases / Tours / Media (purple active state)
- Card grid (2-3 columns desktop, 1 mobile)
- Featured news: larger card at top, full-width on mobile
- Load more button at bottom (not infinite scroll)

### Eventos (Events)
- Calendar view option + list view toggle
- Each event card: Date badge (purple), venue, city, ticket link (outline button)
- Past events: grayed out, smaller, collapsible section
- Empty state: "No upcoming shows" with tour inquiry CTA

### Galeria
- Tab switcher: Photos | Videos
- Masonry grid for photos (3-4 columns desktop)
- Video grid with thumbnails (2-3 columns)
- Lightbox: dark overlay, close button top-right, arrow navigation

### Contactos
- Two-column layout: Form left (60%), info right (40%)
- Mode selector buttons: General | Event Booking | Partnerships
- Contact info: email, phone, social links with icons (Heroicons)
- Map embed: dark-styled Google Maps (if location available)

---

## Images

**Hero Image (Home)**:
- Large, high-impact band performance photo or atmospheric album artwork
- High contrast, slightly desaturated to work with purple overlay
- Minimum 1920x1080, optimized WebP format

**Section Images**:
- **Banda**: Full-band portrait, candid studio shots
- **News Cards**: Related imagery (album covers, tour posters, press photos)
- **Events**: Venue photos or previous show captures
- **Gallery**: Professional concert photography, behind-the-scenes, promo shoots

**Image Treatment**:
- Slight grain overlay for texture (film aesthetic)
- Purple color grade on hover for interactive elements
- Dark vignette on corners for focus

---

## Accessibility & Performance

- Maintain WCAG AA contrast ratios (gray-light text on black = 14.8:1)
- Focus states: 2px purple ring (ring-2 ring-purple-600)
- Skip to content link for keyboard navigation
- Semantic HTML: proper heading hierarchy, ARIA labels
- Lazy load images below fold
- Preload hero image and critical fonts
- Service worker for offline fallback page

---

## Brand Voice in UI

- Microcopy: Bold, confident, no jargon ("Join the journey" not "Subscribe")
- Error messages: Friendly with personality ("Oops, that didn't work. Try again?")
- Success states: Purple checkmark with affirmative copy
- Loading states: Animated purple pulse, never generic spinners

---

**Critical Success Factors**:
1. Dark aesthetic must feel premium, not incomplete - use strategic lighting via gradients and borders
2. Purple is the signature accent - use decisively but sparingly for maximum impact  
3. Typography hierarchy creates rhythm - vary scales dramatically between sections
4. White space is active space - let darkness breathe around content
5. Every interaction should feel intentional and crafted, never generic