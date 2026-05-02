# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Type:** Single Page Application (SPA) - React Web Application

**Purpose:** Develop an interactive music player web application that allows users to play songs, manage local playlists, control playback through an intuitive interface, and view complete track information (title, artist, cover). The application features persistent playlist storage, responsive design, and follows modern React + TypeScript best practices.

**Target audience:** 
- Music enthusiasts seeking a simple local music player
- Developers learning React, TypeScript, and modern web development
- Users who prefer offline/local music playback without streaming service dependencies
- Students and professionals requiring a lightweight audio player for personal collections

---

# INPUT ARTIFACTS

## 1. Content Specification

**Page:** index.html (React SPA Entry Point)

**Application Structure (React Components):**

1. **App Component (Root)**:
   - Main application container
   - Renders header with application title "Music Web Player"
   - Contains Player component as main content

2. **Player Component (Container)**:
   - Central orchestrator component managing all state
   - Contains HTML5 `<audio>` element (hidden, controlled via ref)
   - Integrates: TrackInfo, Controls, ProgressBar, and Playlist components
   - Uses custom hooks: `useAudioPlayer` and `usePlaylist`

3. **TrackInfo Component**:
   - Displays current song cover art (square image, responsive sizing)
   - Shows song title (large, bold font)
   - Shows artist name (medium font, secondary color)

4. **Controls Component**:
   - Previous button (◄ icon)
   - Play/Pause button (▶/❚❚ icon, larger, primary color, circular)
   - Next button (► icon)
   - All buttons should be keyboard accessible

5. **ProgressBar Component**:
   - Interactive horizontal progress bar
   - Shows elapsed time (MM:SS format, left side)
   - Shows total duration (MM:SS format, right side)
   - Clickable bar for seeking to specific positions
   - Visual fill showing playback progress

6. **Playlist Component**:
   - Scrollable list of songs (max-height with overflow)
   - Each item shows: thumbnail, title, artist, delete button
   - Currently playing song highlighted
   - Click on song to play it
   - Includes AddSongForm component at the bottom

7. **AddSongForm Component**:
   - Form with 4 input fields: Title, Artist, Cover URL, Audio URL
   - Submit button to add song
   - Form validation (all fields required, valid URLs)
   - Success feedback after adding song

## 2. Visual Design

**Mockup/Wireframe Description:**

**Desktop Layout (1024px+):**
```
┌─────────────────────────────────────────────────┐
│          MUSIC WEB PLAYER (Header)              │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│   [Cover Image]  │   PLAYLIST                   │
│   300x300px      │   ┌────────────────────────┐ │
│                  │   │ ♫ Song 1 - Artist 1 [×]│ │
│   Song Title     │   │ ♫ Song 2 - Artist 2 [×]│ │
│   Artist Name    │   │ ♫ Song 3 - Artist 3 [×]│ │
│                  │   └────────────────────────┘ │
│   [◄] [▶] [►]   │                              │
│   ████████░░░░   │   ADD NEW SONG               │
│   2:45 / 4:20    │   [Title input]              │
│                  │   [Artist input]             │
│                  │   [Cover URL input]          │
│                  │   [Audio URL input]          │
│                  │   [Add Song Button]          │
└──────────────────┴──────────────────────────────┘
```

**Mobile Layout (320px - 767px):**
```
┌────────────────────┐
│  MUSIC WEB PLAYER  │
├────────────────────┤
│                    │
│   [Cover Image]    │
│   (full width)     │
│                    │
│   Song Title       │
│   Artist Name      │
│                    │
│   ████████░░░░     │
│   2:45 / 4:20      │
│                    │
│  [◄]  [▶]  [►]    │
├────────────────────┤
│  PLAYLIST ▼        │
│  ♫ Song 1 [×]      │
│  ♫ Song 2 [×]      │
├────────────────────┤
│  ADD SONG ▼        │
│  [Form fields]     │
└────────────────────┘
```

**Inspiration references:**
- Spotify Web Player (clean, modern interface)
- Apple Music (minimalist design, focus on album art)
- YouTube Music (intuitive controls, clear typography)

**General style:** Modern, minimalist music player with dark theme as default. Clean interfaces with focus on album artwork and readability. Smooth transitions and hover effects for professional feel.

## 3. Design Specifications

### Colors:

**Dark Theme (Default):**
- **Primary:** `#3b82f6` (Bright Blue - playback controls, active states, primary buttons)
- **Secondary:** `#60a5fa` (Light Blue - hover states, secondary elements)
- **Background:** `#1a1a1a` (Very Dark Gray - main background)
- **Surface:** `#2a2a2a` (Dark Gray - cards, containers)
- **Text Primary:** `#ffffff` (White - main text, headings)
- **Text Secondary:** `#a0a0a0` (Light Gray - secondary text, descriptions)
- **Border:** `#333333` (Medium Dark Gray - borders, dividers)
- **Progress Inactive:** `#333333` (Progress bar background)
- **Progress Active:** `#3b82f6` (Progress bar fill)
- **Error:** `#ef4444` (Red - error messages, delete buttons)
- **Success:** `#10b981` (Green - success messages)

**Light Theme Alternative:**
- **Background:** `#f5f5f5` (Light Gray)
- **Surface:** `#ffffff` (White)
- **Text Primary:** `#1a1a1a` (Very Dark Gray)
- **Text Secondary:** `#666666` (Medium Gray)
- **Border:** `#e0e0e0` (Light Gray)
- **Progress Inactive:** `#e0e0e0`

### Typography:

**Font Stack:** `Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

**Sizes and Weights:**
- **H1 (App Title):** 32px (mobile: 24px), weight 700, line-height 1.2
- **H2 (Song Title):** 24px (mobile: 20px), weight 600, line-height 1.2
- **H3 (Section Headers):** 20px (mobile: 18px), weight 600, line-height 1.3
- **Body/Artist Name:** 18px (mobile: 16px), weight 400, line-height 1.5
- **Small/Playlist Items:** 16px (mobile: 14px), weight 400, line-height 1.5
- **Time Display:** 14px (mobile: 12px), weight 500, line-height 1.4

**Font Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Line Heights:** 
- Headings: 1.2
- Body text: 1.5
- Compact text: 1.4

### Spacing:

**Spacing System:** Based on 8px increments (8, 16, 24, 32, 48, 64px)

**Spacing Variables:**
- `--spacing-xs`: 8px (tight spacing, icons)
- `--spacing-sm`: 16px (component internal padding)
- `--spacing-md`: 24px (between related elements)
- `--spacing-lg`: 32px (between sections)
- `--spacing-xl`: 48px (major sections)
- `--spacing-2xl`: 64px (page margins)

**Component-Specific Spacing:**
- **Container padding:** 24px (mobile), 32px (tablet), 48px (desktop)
- **Card padding:** 16px internal
- **Button padding:** 12px vertical, 24px horizontal
- **Input padding:** 12px vertical, 16px horizontal
- **Section margins:** 32px between major sections
- **Element gaps:** 16px between related items

**Specific Measurements:**
- Cover art: 300x300px (desktop), 200x200px (mobile)
- Playlist item thumbnail: 48x48px
- Progress bar height: 6px
- Button min-height: 44px (touch-friendly)

### Effects:

**Shadows:**
- **Small (sm):** `0 2px 4px rgba(0, 0, 0, 0.1)` - subtle depth for inputs
- **Medium (md):** `0 4px 6px rgba(0, 0, 0, 0.1)` - cards, buttons
- **Large (lg):** `0 10px 25px rgba(0, 0, 0, 0.15)` - elevated elements, modals
- **Dark theme adjustment:** Increase opacity to `rgba(0, 0, 0, 0.3)` for better visibility

**Transitions:**
- **Fast:** 150ms ease-in-out (small interactions, button hover)
- **Normal:** 200ms ease-in-out (standard transitions, color changes)
- **Slow:** 300ms ease-in-out (layout changes, cover art transitions)
- **Properties to animate:** background-color, color, transform, opacity, box-shadow

**Hover Effects:**
- **Buttons:** Scale to 1.05, brighten color by 10%, add subtle shadow
- **Playlist items:** Background color change to `rgba(255, 255, 255, 0.05)`, left border accent
- **Progress bar:** Cursor changes to pointer, slight scale on thumb (if visible)
- **Controls:** Color transition to secondary color, scale to 1.1
- **Delete button:** Color changes to error red, scale to 1.1

**Focus States:**
- **Outline:** 2px solid primary color
- **Offset:** 2px
- **Border radius:** Inherit from element

**Loading States:**
- Skeleton loading for cover art (pulsing gray rectangle)
- Spinner for form submission (rotating circle icon)

## 4. Interactive Behaviors

### Navigation:
- **Desktop:** Fixed header at top with application title, remains visible on scroll
- **Mobile:** Sticky header at top, collapsible sections for playlist and add song form
- **Smooth scrolling:** Enabled for all internal navigation (if any sections added)
- **Keyboard shortcuts:**
  - `Space`: Play/Pause
  - `Arrow Right`: Next song
  - `Arrow Left`: Previous song
  - `Tab`: Navigate between interactive elements

### Animations:

**On Load:**
- Cover art fades in (opacity 0 → 1, 300ms)
- Playlist items stagger fade-in (delay 50ms between items)
- Controls slide up from bottom (transform translateY(20px) → 0, 300ms)

**On Song Change:**
- Cover art: Fade out current (150ms) → Fade in new (150ms)
- Track info: Cross-fade effect (200ms)
- Playlist: Highlight currently playing item (background color transition 200ms)

**On Hover:**
- All buttons: Scale transform and color change (150ms ease-in-out)
- Playlist items: Background color slide-in from left (200ms)
- Progress bar: Cursor changes, slight scale on interaction area

**On Interaction:**
- Button press: Scale down to 0.95 then back (100ms)
- Form submit: Button shows spinner, success message slides in from top
- Delete song: Item fades out with slide-out animation (200ms)

**Progress Bar Animation:**
- Real-time updates using `requestAnimationFrame` for smooth 60fps updates
- Fill animates with linear transition (100ms for smooth appearance)

### Forms (Add Song Form):

**Validation:**
- **Real-time validation:** Show error message below field on blur if invalid
- **Required fields:** Title, Artist, Cover URL, Audio URL (all must be filled)
- **URL validation:** Cover and Audio URLs must be valid HTTP/HTTPS URLs
- **Format validation:** Audio URL should end with `.mp3`, `.wav`, `.ogg`, or `.m4a`
- **Error styling:** Red border on invalid field, error icon, error message in red text

**Visual Feedback:**
- **Focus state:** Blue border, subtle shadow, label moves/shrinks (if using floating labels)
- **Success state:** Green checkmark icon appears, form clears after 500ms
- **Error state:** Red border, error icon, shake animation (200ms)
- **Disabled state:** Reduced opacity (0.5), cursor not-allowed

**Submission:**
1. User clicks "Add Song" button
2. Form validates all fields
3. If valid: Button shows loading spinner, form data submitted
4. Success: Green toast notification "Song added successfully" (auto-dismiss 3s), form resets
5. If error: Red toast notification with error message, form stays populated for correction

### Modal/Overlays:

**Error Notifications (Toast):**
- **Trigger:** Audio file fails to load, network error, validation failure
- **Position:** Top-right corner (desktop), top center (mobile)
- **Appearance:** Slide in from right (desktop) or top (mobile), 300ms
- **Duration:** 5 seconds auto-dismiss, or manual close with X button
- **Style:** Error background (#ef4444), white text, close icon
- **Content:** Clear, non-technical error message with action suggestion

**Success Notifications (Toast):**
- **Trigger:** Song added successfully, playlist saved
- **Position:** Top-right corner (desktop), top center (mobile)
- **Appearance:** Slide in from right, 300ms
- **Duration:** 3 seconds auto-dismiss
- **Style:** Success background (#10b981), white text

**Delete Confirmation:**
- **Trigger:** User clicks delete button on playlist item
- **Type:** Inline confirmation (no modal) - button shows confirmation state
- **Flow:** First click → "Confirm?" text, Second click within 3s → Delete, After 3s → Revert to trash icon
- **Alternative:** Small modal overlay with "Are you sure?" and Yes/No buttons (optional, use inline for better UX)

**No JavaScript Warning:**
- `<noscript>` element displays centered message: "You need to enable JavaScript to run this application."
- Styled with padding, border, background color to be clearly visible

---

# SPECIFIC TASK

Generate the **complete HTML entry point (index.html)** and **global CSS styling (src/styles/main.css)** for the Music Web Player React SPA.

**CRITICAL:** This HTML file must serve as the entry point for the React application following the architecture defined in `2-MusicWebPlayer/` structure. The file must:
1. Provide proper meta tags for SEO and social sharing
2. Include root div (`#root`) where React will mount
3. Link to Vite's module script (`/src/main.tsx`)
4. Define CSS custom properties (variables) for theming
5. Include global styles and resets
6. Be production-ready with all accessibility and performance optimizations

## Required structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Meta tags (charset, viewport, description, Open Graph, Twitter Cards) -->
    <!-- Title -->
    <!-- Favicon links -->
    <!-- Preconnect for fonts/CDNs -->
    <!-- NO CSS file links needed here - Vite handles bundling -->
</head>
<body>
    <div id="root"></div>
    <!-- React mounts here -->
    <noscript>JavaScript required warning</noscript>
    <!-- Vite injects bundled scripts automatically -->
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

## Specific elements to include:

### In index.html:
- [x] Complete HTML5 semantic structure
- [x] Meta charset UTF-8
- [x] Viewport meta for mobile responsiveness
- [x] Meta description for SEO (<160 characters)
- [x] Open Graph tags (og:title, og:description, og:type, og:image)
- [x] Twitter Card tags
- [x] Canonical URL meta tag
- [x] Theme color meta tag (#1a1a1a for dark theme)
- [x] Title tag: "Music Web Player - Your Personal Audio Player" (<60 chars)
- [x] Favicon links (ICO format minimum)
- [x] Preconnect to Google Fonts (if using external fonts)
- [x] Root div with id="root"
- [x] Noscript warning message
- [x] Module script tag pointing to /src/main.tsx

### In src/styles/main.css:
- [x] CSS custom properties (variables) for all colors, spacing, typography
- [x] Dark theme as default, light theme as media query alternative
- [x] CSS reset/normalize (box-sizing, margin, padding reset)
- [x] Global styles (html, body, #root)
- [x] Typography base styles
- [x] Utility classes (visually-hidden, etc.)
- [x] Focus-visible styles for accessibility
- [x] Media queries for responsive breakpoints
- [x] CSS comments for organization

---

# CONSTRAINTS AND STANDARDS

## HTML:

- **Version:** HTML5 (DOCTYPE html)
- [x] **Semantic tags:** Use where appropriate (though React handles most DOM structure)
- [x] **Language attribute:** `lang="en"` on html tag
- [x] **Character encoding:** UTF-8
- [x] **Viewport meta:** `width=device-width, initial-scale=1.0`
- [x] **Unique IDs:** Only `#root` needed for React mount point
- [x] **Alt attributes:** N/A for index.html (handled in React components)
- [x] **Complete meta tags:** Description, Open Graph, Twitter Cards
- [x] **NO inline styles:** All styling via CSS files
- [x] **NO inline scripts:** Only module script for Vite entry
- [x] **Accessibility:** Lang attribute, noscript warning

## CSS:

- **Framework:** None (Custom CSS with CSS Modules for components)
- **Preprocessor:** None (Modern CSS with custom properties)
- **File location:** `src/styles/main.css` (imported in main.tsx)
- [x] **Mobile-first approach:** Base styles for mobile, media queries for larger screens
- [x] **CSS custom properties:** Define all design tokens (colors, spacing, typography) as CSS variables
- [x] **Flexbox/Grid:** Use for layouts (defined in component styles)
- [x] **NO !important:** Avoid unless absolutely necessary for overrides
- [x] **Comments:** Clear section headers and explanations for complex code
- [x] **BEM-like naming:** Used within CSS Modules for components (not in global CSS)
- [x] **Logical properties:** Use `margin-inline`, `padding-block` where appropriate
- [x] **Modern CSS:** Use `clamp()`, `min()`, `max()` for responsive sizing

## Responsiveness:

**Mandatory breakpoints:**
- **Mobile:** 320px - 767px
  - Single column layout
  - Cover art: 200x200px
  - Stacked elements (cover → info → controls → progress → playlist)
  - Collapsible playlist section
  - Hamburger menu for add song form (optional)
  - Touch-friendly button sizing (min 44x44px)

- **Tablet:** 768px - 1023px
  - Hybrid layout
  - Cover art: 250x250px
  - Player and playlist start showing side-by-side in landscape
  - Larger touch targets
  - More breathing room in spacing

- **Desktop:** 1024px+
  - Two-column layout (player left, playlist right)
  - Cover art: 300x300px
  - Full feature visibility
  - Hover states active
  - Mouse-optimized interactions

**Responsive behaviors:**
```css
/* Mobile first - base styles */
.player { /* single column */ }

/* Tablet */
@media (min-width: 768px) {
  .player { /* hybrid layout */ }
}

/* Desktop */
@media (min-width: 1024px) {
  .player { /* two-column layout */ }
}
```

## Performance:

- [x] **Vite optimization:** Automatic code splitting, tree shaking, minification
- [x] **CSS bundling:** Vite handles CSS bundling and optimization
- [x] **Font loading:** `font-display: swap` for web fonts
- [x] **Preconnect:** Add preconnect hints for external font sources
- [x] **No render-blocking:** Script tag with `type="module"` is deferred by default
- [x] **Lazy loading:** Images loaded by React components use lazy loading (component level)
- [x] **Minimal index.html:** Keep entry HTML as lean as possible
- [x] **Asset optimization:** Cover images and audio files should be optimized externally

## SEO:

- [x] **Title tag:** "Music Web Player - Your Personal Audio Player" (57 characters)
- [x] **Meta description:** "Interactive web music player with playlist management, playback controls, and track visualization. Built with React and TypeScript." (154 characters)
- [x] **Heading hierarchy:** H1 for app title (in React components, not index.html)
- [x] **Semantic HTML:** Proper use of header, main, nav elements (in React components)
- [x] **Canonical URL:** Include if deployed to specific domain
- [x] **Open Graph tags:** Title, description, type (website), image (preview image)
- [x] **Twitter Cards:** Summary card with title, description, image
- [x] **Robots meta:** Allow indexing (default, or specify if needed)

## Accessibility:

- [x] **WCAG AA contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
  - Primary blue (#3b82f6) on dark background (#1a1a1a): Check contrast
  - White text (#ffffff) on dark background: ✓ Passes
  - Light gray text (#a0a0a0) on dark background: Verify meets AA for small text
- [x] **Keyboard navigation:** Tab order follows logical flow, all interactive elements focusable
- [x] **Focus visible:** Clear focus indicators (2px outline, primary color)
- [x] **ARIA attributes:** Added in React components where needed (buttons, form inputs, live regions)
- [x] **Semantic HTML:** Proper use in React components (button elements, not divs)
- [x] **Labels on inputs:** All form inputs have associated labels (in React components)
- [x] **Skip to content:** Optional skip link for keyboard users (add if needed)
- [x] **Color not only indicator:** Icons accompany color coding (play/pause icons)
- [x] **Text alternatives:** Alt text on images (handled in React components)
- [x] **Screen reader announcements:** Live regions for playback state changes (in React)

---

# DELIVERABLES

## 1. File structure

**Note:** This matches the defined architecture in `2-MusicWebPlayer/`:

```
2-MusicWebPlayer/
├── index.html                    ← TO BE GENERATED
├── public/
│   ├── favicon.ico              ← Reference in index.html
│   ├── cover-placeholder.jpg    ← Default cover image (300x300px)
│   └── songs/                   ← Sample audio files
│       ├── sample-song-1.mp3
│       ├── sample-song-2.mp3
│       └── sample-song-3.mp3
├── src/
│   ├── main.tsx                 ← React entry point (imports main.css)
│   ├── App.tsx                  ← Root React component
│   ├── styles/
│   │   └── main.css             ← TO BE GENERATED (global styles)
│   ├── components/              ← React components (separate CSS Modules)
│   │   ├── Player.tsx
│   │   ├── TrackInfo.tsx
│   │   ├── Controls.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Playlist.tsx
│   │   └── AddSongForm.tsx
│   ├── hooks/                   ← Custom React hooks
│   ├── types/                   ← TypeScript type definitions
│   ├── utils/                   ← Utility functions
│   └── data/                    ← Data providers
├── tests/                       ← Jest test files
├── docs/                        ← Documentation
├── package.json                 ← Dependencies
├── vite.config.ts               ← Vite configuration
├── tsconfig.json                ← TypeScript configuration
└── ... (other config files)
```

## 2. HTML Code (index.html)

**Location:** Root of project (`2-MusicWebPlayer/index.html`)

**Purpose:** Entry point for Vite dev server and production build. Provides:
- SEO meta tags
- React mount point
- Script tag for Vite module entry

**Requirements:**
- Complete meta tags (viewport, description, og:, twitter:)
- Favicon link
- Root div with id="root"
- Noscript warning
- Module script pointing to /src/main.tsx
- NO style tags (CSS handled by Vite)
- NO other script tags (React handles all JS)

## 3. CSS Code (src/styles/main.css)

**Location:** `src/styles/main.css`

**Purpose:** Global styles and CSS variables for the entire application. Imported in `src/main.tsx`.

**Structure:**
```css
/* === CSS CUSTOM PROPERTIES (VARIABLES) === */
:root {
  /* Colors - Light Theme (fallback) */
  --color-primary: #3b82f6;
  --color-secondary: #60a5fa;
  /* ... all design tokens */
}

/* Dark Theme (default via prefers-color-scheme) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1a1a;
    /* ... dark theme overrides */
  }
}

/* === CSS RESET / NORMALIZE === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* === GLOBAL BASE STYLES === */
html { /* base font, smoothing */ }
body { /* font, colors, background */ }
#root { /* layout container */ }

/* === TYPOGRAPHY === */
h1, h2, h3, h4, h5, h6 { /* heading styles */ }
a { /* link styles */ }
button { /* button reset */ }

/* === UTILITY CLASSES === */
.visually-hidden { /* screen reader only */ }

/* === ACCESSIBILITY === */
:focus-visible { /* focus styles */ }

/* === MEDIA QUERIES === */
@media (max-width: 767px) { /* mobile adjustments */ }
@media (min-width: 768px) { /* tablet styles */ }
@media (min-width: 1024px) { /* desktop styles */ }
```

**Requirements:**
- All CSS variables defined in `:root`
- Dark theme as default using `prefers-color-scheme: dark`
- Complete CSS reset
- Global typography styles
- Accessibility focus styles
- Mobile-first responsive breakpoints
- Clear section comments

## 4. Integration Notes

### How these files fit in the architecture:

1. **index.html** → Root entry point
   - Vite dev server serves this file
   - In production, Vite injects optimized bundles into this file
   - React mounts to `<div id="root"></div>`

2. **src/main.tsx** (existing, imports main.css)
   ```typescript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import App from './App';
   import './styles/main.css'; // ← Global styles imported here
   
   const root = document.getElementById('root');
   if (!root) throw new Error('Root element not found');
   
   ReactDOM.createRoot(root).render(
     <React.StrictMode>
       <App />
     </React.StrictMode>
   );
   ```

3. **src/styles/main.css** → Global styles
   - CSS variables available to all components
   - Base styles, resets, utilities
   - Component-specific styles use CSS Modules (separate files)

4. **Component CSS Modules** (not part of this deliverable, but for context):
   - Each component has its own `.module.css` file
   - Example: `src/components/Player.module.css`
   - Imported in component: `import styles from './Player.module.css'`
   - Uses CSS variables from main.css

## 5. Documentation

### Required assets (to be provided by developer):

**Favicon:**
- [ ] `public/favicon.ico` (16x16, 32x32 multi-resolution ICO file)
- [ ] Musical note icon or custom logo
- **Recommendation:** Use a simple eighth note (♪) or headphones icon

**Sample Audio Files:**
- [ ] 5 MP3 files in `public/songs/` directory
- **Format:** MP3, 128-320 kbps
- **Duration:** 2-5 minutes each
- **Source:** Royalty-free music (e.g., Free Music Archive, Incompetech, Bensound)
- **Naming:** `sample-song-1.mp3`, `sample-song-2.mp3`, etc.

**Cover Art Images:**
- [ ] 5 album cover images (300x300px minimum, square, JPG or PNG)
- [ ] 1 placeholder cover image: `public/cover-placeholder.jpg`
- **Format:** JPG (optimized for web, <100KB each)
- **Source:** Royalty-free images or solid color squares with album/artist text
- **Naming:** Match song IDs or use generic names

**Fonts:**
- **Option 1:** Google Fonts (Inter or Roboto)
  - Add preconnect in index.html
  - Import in CSS: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`
- **Option 2:** System font stack (no external dependency)
  - Already defined: `Inter, system-ui, -apple-system, ...`

**Icons:**
- **Option 1:** Unicode symbols (no dependency)
  - Play: ▶ (U+25B6)
  - Pause: ❚❚ (U+275A U+275A) or ⏸ (U+23F8)
  - Previous: ◄ (U+25C4)
  - Next: ► (U+25BA)
  - Delete: × (U+00D7) or 🗑 (U+1F5D1)
- **Option 2:** React Icons library (add dependency)
  - `npm install react-icons`
  - Import: `import { FaPlay, FaPause, ... } from 'react-icons/fa'`

## 6. Validation checklist

**HTML Validation:**
- [ ] HTML validated in [W3C Validator](https://validator.w3.org/)
- [ ] No errors or warnings
- [ ] Proper DOCTYPE declaration
- [ ] Valid lang attribute
- [ ] All required meta tags present

**CSS Validation:**
- [ ] CSS validated (though vendor prefixes may show warnings)
- [ ] No syntax errors
- [ ] All custom properties properly defined
- [ ] Media queries in correct order (mobile-first)

**TypeScript Compilation:**
- [ ] No TypeScript errors: `npm run build`
- [ ] Strict mode enabled in tsconfig.json
- [ ] All types properly defined

**Code Quality:**
- [ ] ESLint passing: `npm run lint`
- [ ] No console errors in browser
- [ ] Proper code formatting

**Responsiveness:**
- [ ] Test at 320px (mobile minimum)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px (desktop)
- [ ] Test at 1440px+ (large desktop)
- [ ] All breakpoints work correctly
- [ ] No horizontal scroll at any size

**Functionality:**
- [ ] React app mounts correctly
- [ ] No JavaScript errors in console
- [ ] All components render properly
- [ ] Audio playback works
- [ ] Playlist management works
- [ ] Form validation works
- [ ] Keyboard navigation works

**Performance:**
- [ ] Lighthouse Performance score >90
- [ ] First Contentful Paint <2s
- [ ] Time to Interactive <3s
- [ ] No render-blocking resources
- [ ] Assets properly optimized

**Accessibility:**
- [ ] Lighthouse Accessibility score >90
- [ ] Keyboard navigation works (Tab, Space, Arrows)
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA (check with [Contrast Checker](https://webaim.org/resources/contrastchecker/))
- [ ] Screen reader compatible (test with NVDA/JAWS)
- [ ] No ARIA violations
- [ ] All interactive elements accessible

**SEO:**
- [ ] Title tag present and optimized
- [ ] Meta description present and optimized
- [ ] Open Graph tags complete
- [ ] Canonical URL set (if deployed)
- [ ] Lighthouse SEO score >90
- [ ] Sitemap generated (optional for SPA)

**Cross-Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Device Testing:**
- [ ] iPhone (small screen)
- [ ] Android phone (various sizes)
- [ ] iPad / Android tablet
- [ ] Desktop monitors (1080p, 1440p, 4K)

---

# OUTPUT FORMAT

The output should provide **two separate, complete files** with clear delimiters:

## File 1: index.html
```html
<!DOCTYPE html>
<!-- Complete HTML code here -->
</html>
```

## File 2: src/styles/main.css
```css
/* Complete CSS code here */
```

---

# IMPLEMENTATION NOTES

**Critical Integration Points:**

1. **Vite Module Resolution:**
   - Script tag must use `type="module"` and point to `/src/main.tsx`
   - Vite automatically resolves TypeScript and React JSX
   - In development, Vite serves files with HMR
   - In production, Vite bundles and injects hashed filenames

2. **CSS Import Chain:**
   - `index.html` → `<script src="/src/main.tsx">` → `import './styles/main.css'`
   - Vite bundles CSS with JavaScript in development
   - In production, Vite extracts CSS to separate file for caching

3. **Asset Paths:**
   - Public folder assets referenced with absolute paths: `/favicon.ico`, `/songs/...`
   - Vite serves `public/` folder contents at root in both dev and production
   - No need to import assets from public folder in code

4. **React Mount Point:**
   - Must have `<div id="root"></div>` in body
   - React's `createRoot()` targets this element
   - All React content renders inside this div

5. **CSS Variables Usage:**
   - Define all variables in `main.css` `:root` selector
   - Components reference variables: `background-color: var(--color-primary)`
   - Enables easy theming and consistency across components

6. **Dark Theme Strategy:**
   - Default styles in `:root` can be light or dark
   - Use `@media (prefers-color-scheme: dark)` to override for dark theme
   - Respect user's system preference automatically
   - Optional: Add manual theme toggle in React (future enhancement)

**Important Considerations:**

- **No External Dependencies in HTML:** All styles and scripts handled by Vite bundler
- **No Inline Styles:** Keep index.html clean, all styling via CSS files
- **Mobile-First CSS:** Base styles target mobile, progressively enhance for larger screens
- **Accessibility First:** Focus styles, semantic HTML, ARIA where needed (in React components)
- **Performance:** Keep index.html minimal, let Vite optimize bundles
- **SEO Ready:** Complete meta tags even though it's a SPA (helps with social sharing)

**Common Pitfalls to Avoid:**

- ❌ Don't add `<link rel="stylesheet">` tags - Vite handles CSS bundling
- ❌ Don't add multiple script tags - Vite injects optimized bundles automatically
- ❌ Don't use absolute paths to src files in HTML - use relative: `/src/main.tsx`
- ❌ Don't forget `type="module"` on script tag - required for ES modules
- ❌ Don't use `!important` in CSS unless absolutely necessary
- ❌ Don't define component-specific styles in main.css - use CSS Modules per component

---

# LIBRARIES/CDNS USED

**None required in index.html** - All dependencies managed via npm and bundled by Vite:

1. **React 18.2+** (npm package)
   - Purpose: UI library
   - Bundled by Vite, not loaded from CDN

2. **Vite 5+** (build tool)
   - Purpose: Dev server, HMR, production bundling
   - Dev dependency, not shipped to browser

3. **TypeScript 5+** (npm package)
   - Purpose: Type checking and compilation
   - Compiles to JavaScript, not shipped to browser

4. **Google Fonts** (optional external resource)
   - URL: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`
   - Purpose: Web font loading (if not using system fonts)
   - Preconnect for performance: `<link rel="preconnect" href="https://fonts.googleapis.com">`

**Note:** Modern approach avoids CDNs in favor of npm packages bundled with Vite for better:
- Performance (bundling, tree-shaking, code splitting)
- Reliability (no external dependencies failing)
- Developer experience (version management, TypeScript types)
- Offline development

---

# ADDITIONAL CUSTOMIZATIONS SUGGESTED

**Future Enhancements (not in current scope, but prepare structure for):**

1. **Theme Switcher:**
   - Add manual dark/light theme toggle button
   - Store preference in localStorage
   - Add `data-theme` attribute to `<html>` tag
   - CSS: `[data-theme="light"] { /* override variables */ }`

2. **Keyboard Shortcuts Display:**
   - Add modal showing available keyboard shortcuts
   - Trigger with `?` key or help button
   - List: Space (play/pause), Arrows (next/prev), etc.

3. **Volume Control:**
   - Add volume slider component
   - Use HTML5 Audio API `volume` property
   - Store volume preference in localStorage
   - Visual feedback with speaker icon states

4. **Audio Visualization:**
   - Integrate Web Audio API for visualizations
   - Canvas element for waveform or frequency bars
   - Real-time animation synced with playback
   - Optional: Add toggle to show/hide visualizer

5. **Playlist Import/Export:**
   - Export playlist as JSON file
   - Import JSON playlist file
   - Share playlist with others
   - Validate imported data structure

6. **Search and Filter:**
   - Search input in playlist section
   - Filter songs by title or artist
   - Highlight matches in playlist
   - Clear search button

7. **Drag and Drop Reordering:**
   - Make playlist items draggable
   - Reorder songs via drag-and-drop
   - Visual feedback during drag
   - Persist new order to localStorage

8. **Lyrics Display:**
   - Add lyrics panel (synchronized or static)
   - Load lyrics from external API or local files
   - Auto-scroll synced with playback
   - Toggle lyrics visibility

9. **Social Sharing:**
   - Share currently playing song
   - Generate shareable link with timestamp
   - Social media integration (Twitter, Facebook)
   - Copy link to clipboard

10. **Progressive Web App (PWA):**
    - Add manifest.json for PWA support
    - Service worker for offline functionality
    - Install prompt for home screen
    - Cache audio files for offline playback

11. **Analytics Integration:**
    - Track playback events (play, pause, skip)
    - Monitor most played songs
    - User engagement metrics
    - Privacy-respectful implementation

12. **Internationalization (i18n):**
    - Multi-language support
    - Translation files for UI strings
    - Language selector in settings
    - Localized time formats

**Preparation Steps:**

- Structure CSS variables for easy theming
- Keep components modular and decoupled
- Use semantic HTML for better extensibility
- Document component props and interfaces thoroughly
- Write comprehensive tests for core functionality
- Keep bundle size minimal for future additions
