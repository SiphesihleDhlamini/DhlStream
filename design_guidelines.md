# DhlStream Design Guidelines

## Design Approach

**Reference-Based Approach: Premium Streaming Services**

Drawing inspiration from Netflix, Disney+, and HBO Max to create an immersive, content-first streaming experience. The design prioritizes visual discovery through rich imagery and intuitive browsing patterns.

**Key Design Principles:**
- Immersive content discovery with large imagery
- Dark-optimized interface for viewing comfort
- Cinematic presentation with generous image treatments
- Effortless navigation and content browsing

## Core Design Elements

### Typography System

**Font Stack:** Inter (primary UI) + Playfair Display (hero/branding accents)

**Hierarchy:**
- Hero Title: 4xl to 6xl (bold, 900 weight)
- Section Headers: 2xl to 3xl (semibold, 600 weight)
- Content Titles: lg to xl (medium, 500 weight)
- Body Text: base (regular, 400 weight)
- Metadata/Labels: sm to xs (medium, 500 weight)

### Spacing System

**Tailwind Unit Standards:** 2, 4, 6, 8, 12, 16, 24
- Tight spacing: p-2, gap-2 (component internals)
- Standard spacing: p-4, p-6, m-8 (cards, sections)
- Generous spacing: p-12, py-16, py-24 (major sections)

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed position with backdrop blur effect
- Logo left-aligned (h-8 to h-12)
- Primary nav links (Movies, Series, My List)
- Search icon and user profile right-aligned
- Height: h-16 to h-20
- Transparent with subtle border on scroll

### Authentication Components
**Login/Signup Forms:**
- Centered card layout (max-w-md)
- Large input fields (h-12 to h-14)
- Full-width primary buttons
- Minimal form design with focus states
- Toggle between login/signup inline

### Content Display Components

**Hero Section:**
- Full viewport height (min-h-screen)
- Featured content with large backdrop image
- Gradient overlay for text legibility
- Title (4xl-6xl), description (lg), metadata row
- Primary CTA buttons with backdrop blur (Play, More Info)
- Positioned in lower third of viewport (pb-24 to pb-32)

**Content Rows (Horizontal Scrolling):**
- Section title (2xl, semibold) with mb-4
- Horizontal scroll container (snap-x snap-mandatory)
- Card grid with gap-3 to gap-4
- Smooth scrolling with hidden scrollbar

**Movie/Series Cards:**
- Aspect ratio 2:3 (portrait posters)
- Hover scale transform (scale-105)
- Title overlay on hover with gradient
- Rounded corners (rounded-lg)
- Width: w-40 to w-56 (responsive)

**Detail Modal/Page:**
- Large backdrop hero (h-96 to full viewport)
- Gradient overlay for content readability
- Two-column layout below hero (8-column main content, 4-column sidebar)
- Play button prominent (large, backdrop blur)
- Episode list for series (scrollable grid)
- Cast, genre, rating metadata

### Video Player
**Full-Screen Player:**
- Custom controls overlay (bottom positioned)
- Play/pause, timeline scrubber, volume control
- Episode selector for series (next/previous)
- Minimal UI with auto-hide on inactivity
- Backdrop blur on control panel

### Browse/Grid Layout
**Movies/Series Grid View:**
- Responsive grid (grid-cols-2 md:grid-cols-4 lg:grid-cols-6)
- Gap: gap-4 to gap-6
- Same card styling as horizontal rows
- Filter/sort controls at top (sticky)

## Layout Patterns

### Home Page Structure
1. Hero Section (featured content, full viewport)
2. Continue Watching row (if applicable)
3. Multiple content rows by category/genre
4. Each row: 6-10 items visible, horizontal scroll
5. Spacing between rows: py-8 to py-12

### Content Detail Page
1. Hero backdrop section (min-h-screen)
2. Content information grid (below hero)
3. Related content section (similar horizontal rows)
4. Footer

### Browse Page
1. Filter bar (sticky, h-16)
2. Grid layout with infinite scroll
3. Minimal spacing for content density

## Images

**Required Images:**
- **Hero Section:** Large backdrop image (1920x1080 minimum) featuring the main promoted movie/series, positioned as background with gradient overlay
- **Movie Posters:** Portrait orientation (2:3 aspect ratio) for all movie cards, approximately 400x600px
- **Series Posters:** Same portrait format as movies
- **Detail Page Backdrop:** Landscape backdrop images (16:9) for content detail views
- **Thumbnails:** Episode thumbnails for series (16:9), used in episode selectors

**Image Treatment:**
- All images should have subtle rounded corners (rounded-lg)
- Hero/backdrop images require gradient overlays for text legibility
- Hover states on cards include subtle scale transform
- Loading states with skeleton placeholders

## Interaction Patterns

**Navigation Flow:**
- Smooth scroll between sections
- Horizontal scroll for content rows (touch-friendly)
- Modal overlays for quick previews
- Full page transitions for detail views

**Content Discovery:**
- Hover previews with title/metadata overlay
- Click to detail page or play directly
- Add to My List functionality (icon button)

**Playback:**
- Click Play → Full-screen video player
- Resume playback for partially watched content
- Auto-advance to next episode for series

This design creates a premium, content-focused streaming experience that rivals professional platforms while maintaining simplicity for local content browsing.