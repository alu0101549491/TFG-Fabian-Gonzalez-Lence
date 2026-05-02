# GLOBAL CONTEXT
**Project:** The Hangman Game - Web Application

**Type:** Single Page Application (SPA) - Interactive Game

**Purpose:** Develop a fully functional web-based implementation of the classic Hangman game where players guess animal names letter by letter before completing a hangman drawing. The application demonstrates modern web development practices using TypeScript, MVC architecture, and Canvas API for graphics.

**Target audience:** 
- General users seeking casual gaming entertainment
- Students learning web development and game logic
- Developers evaluating TypeScript/MVC implementation examples

---

# INPUT ARTIFACTS

## 1. Content Specification

**Page:** index.html (Single Page Application)

**Required sections:**

1. **Header Section**: 
   - Game title: "The Hangman Game"
   - Subtitle: "Guess the animal name!"
   - Uses Bulma hero component with primary color scheme

2. **Message Display Area** (`#message-container`):
   - Dynamic area showing:
     - Attempt counter (e.g., "Attempts: 3/6")
     - Victory message when player wins
     - Defeat message when player loses (showing the correct word)
   - Initially displays attempt counter
   - Must be centered text alignment
   - Minimum height: 100px to prevent layout shifts

3. **Hangman Canvas Section** (`#hangman-canvas`):
   - Canvas element (400x400px) for drawing the progressive hangman states
   - 6 progressive drawing states:
     - State 0: Empty gallows structure (base, post, beam, rope)
     - State 1: Head
     - State 2: Body
     - State 3: Left arm
     - State 4: Right arm
     - State 5: Left leg
     - State 6: Right leg (game over)
   - Centered within its container box
   - Must have white background with border

4. **Word Display Section** (`#word-container`):
   - Dynamic container displaying empty letter boxes initially
   - Each box represents one letter of the secret word
   - Boxes specifications:
     - Width: 50px, Height: 60px (desktop)
     - Width: 40px, Height: 50px (mobile)
     - Border: 2px solid primary color
     - Border-radius: 8px
     - White background
     - Font-size: 2rem (desktop), 1.5rem (mobile)
     - Font-weight: bold
     - Centered content (flex display)
   - Boxes arranged horizontally with flex-wrap for responsive behavior
   - Gap between boxes: 0.5rem

5. **Alphabet Display Section** (`#alphabet-container`):
   - Interactive alphabet buttons (26 letters: A-Z)
   - Button specifications:
     - Width: 45px, Height: 45px (desktop)
     - Width: 40px, Height: 40px (mobile)
     - Font-size: 1.25rem (desktop), 1rem (mobile)
     - Font-weight: bold
     - Border: 2px solid primary color
     - Background: white initially
     - Color: primary color initially
     - Border-radius: 8px
     - Cursor: pointer
     - Transition: all 0.2s
   - Hover effect (enabled buttons only):
     - Background changes to primary color
     - Text color changes to white
     - Transform: translateY(-2px) for lift effect
   - Disabled state (after selection):
     - Opacity: 0.5
     - Cursor: not-allowed
     - No hover effects
   - Arranged with flexbox, wrapped, centered
   - Gap between buttons: 0.5rem

6. **Footer Section**:
   - Simple footer with copyright or attribution
   - Consistent with Bulma styling

---

## 2. Visual Design

**Mockup/Wireframe Description:**
```
┌─────────────────────────────────────────────┐
│          THE HANGMAN GAME (Hero)            │
│         Guess the animal name!              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────┐     │
│  │   Message Container (centered)    │     │
│  │   "Attempts: 0/6"                 │     │
│  └───────────────────────────────────┘     │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │                                   │     │
│  │       Canvas (400x400)            │     │
│  │       Hangman Drawing             │     │
│  │                                   │     │
│  └───────────────────────────────────┘     │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │  [_] [_] [_] [_] [_] [_]         │     │
│  │      Word Letter Boxes            │     │
│  └───────────────────────────────────┘     │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │ [A][B][C][D][E][F][G][H][I]...   │     │
│  │ [J][K][L][M][N][O][P][Q][R]...   │     │
│  │      Alphabet Buttons             │     │
│  └───────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

**Inspiration references:** 
- Clean, minimal game interface similar to word puzzle games
- Academic project aesthetic (Universidad de La Laguna style)
- Reference: Classic Hangman game interfaces with modern web styling

**General style:** Modern academic / Clean educational interface / Interactive game UI

---

## 3. Design Specifications

### Colors:
**Primary color palette (Bulma-based with custom variables):**
- **Primary:** `#3273dc` (Bulma default blue - used for buttons, borders, hero background)
- **Danger:** `#f14668` (Bulma red - used for defeat messages, error states)
- **Success:** `#48c774` (Bulma green - used for victory messages)
- **Text:** `#363636` (Bulma dark gray - main text color)
- **Background:** `#f5f5f5` (Bulma light gray - page background)
- **White:** `#ffffff` (for boxes, canvas background, button backgrounds)
- **Border:** `#3273dc` (matching primary for consistency)

### Typography:
- **Main font:** 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif (system font stack)
  - H1 (Hero title): Use Bulma's `.title` class (default 3rem)
  - H2 (Hero subtitle): Use Bulma's `.subtitle` class (default 1.75rem)
  - Body text: 1rem base
  - Letter boxes: 2rem (desktop), 1.5rem (mobile), font-weight: bold
  - Alphabet buttons: 1.25rem (desktop), 1rem (mobile), font-weight: bold
  - Message text: 1.5rem for victory/defeat, 1.25rem for attempt counter, font-weight: bold

- **Line height:** 1.5 (Bulma default)
- **Font weights to use:** 
  - Normal: 400 (body text)
  - Bold: 700 (letter boxes, buttons, messages, headings)

### Spacing:
- **Spacing system:** Bulma's default spacing (based on 1.5rem rhythm)
- **Container padding:** 
  - Desktop: 2rem on all sides
  - Mobile: 1rem on all sides
- **Margin between sections:** 2rem vertical spacing
- **Gap between letter boxes:** 0.5rem
- **Gap between alphabet buttons:** 0.5rem
- **Internal padding for boxes:** Centered using flexbox (no explicit padding needed)

### Effects:
- **Shadows:** 
  - Letter boxes: None (just border)
  - Bulma boxes: Use Bulma's default `.box` shadow (0 0.5em 1em -0.125em rgba(10,10,10,.1))
  - Canvas container: Use `.box` class for consistent shadow

- **Transitions:**
  - Alphabet buttons: `all 0.2s ease` for smooth hover effects
  - Duration: 200ms for all interactive elements
  - Type: ease or ease-in-out

- **Hover effects:**
  - Alphabet buttons (when enabled):
    - Background: changes from white to primary color (`#3273dc`)
    - Text color: changes from primary to white
    - Transform: `translateY(-2px)` for subtle lift
    - Maintain border
  - Disabled buttons: No hover effect, cursor changes to `not-allowed`

---

## 4. Interactive Behaviors

### Navigation:
- **No traditional navigation** - Single page application
- Hero section acts as header, remains at top
- No scroll-based navigation (content should fit in viewport or naturally scroll)

### Animations:
- **On load:** 
  - Alphabet buttons render immediately, no animation
  - Letter boxes render based on word length
  - Canvas shows initial gallows state
  
- **On interaction:**
  - Letter button click: Immediate disable with opacity change
  - Letter reveal: Direct update of box content (no animation in base version)
  - Hangman drawing: Progressive rendering on canvas with each failed attempt
  - Victory/Defeat message: Immediate display in message container
  - Restart button: Appears when game ends

- **Hover:** 
  - Alphabet buttons show background color change + lift effect
  - Smooth transition (0.2s)

### Forms:
- **No traditional forms** - Game uses button clicks for interaction
- No form validation needed
- All interaction through click events on alphabet buttons

### Modal/Overlays:
- **No modals** - All feedback displayed inline in message container
- Victory message appears in `#message-container`
- Defeat message appears in `#message-container`
- Restart button appears below messages when game ends

---

# SPECIFIC TASK

Generate the complete page: **index.html**

## Required structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Classic Hangman game with animal names - A TypeScript SPA">
  <meta name="author" content="Fabián González Lence">
  <title>The Hangman Game</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
<body>
  <div id="app">
    <section class="hero is-primary">
      <div class="hero-body">
        <h1 class="title has-text-centered">The Hangman Game</h1>
        <p class="subtitle has-text-centered">Guess the animal name!</p>
      </div>
    </section>

    <div class="container">
      <div class="columns is-centered">
        <div class="column is-8">
          <!-- Message Display -->
          <div id="message-container" class="box has-text-centered"></div>

          <!-- Hangman Canvas -->
          <div class="box has-text-centered">
            <canvas id="hangman-canvas" width="400" height="400"></canvas>
          </div>

          <!-- Word Display -->
          <div id="word-container" class="box"></div>

          <!-- Alphabet Display -->
          <div id="alphabet-container" class="box"></div>
        </div>
      </div>
    </div>
  </div>

  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

## Specific elements to include:
- [x] Hero section with game title and subtitle (Bulma hero component)
- [x] Message container for game status, victory/defeat messages
- [x] Canvas element (400x400px) for hangman drawing
- [x] Word container for dynamic letter boxes
- [x] Alphabet container for dynamic letter buttons
- [x] Responsive layout using Bulma columns
- [x] Integration point for TypeScript module (`/src/main.ts`)

### Special requirements:
- **All game elements are dynamically generated by TypeScript** - HTML only provides container structure
- Letter boxes are created by `WordDisplay` class
- Alphabet buttons are created by `AlphabetDisplay` class
- Canvas drawing handled by `HangmanRenderer` class
- Messages handled by `MessageDisplay` class
- HTML must only provide the container divs with specific IDs

---

# CONSTRAINTS AND STANDARDS

## HTML:
- **Version:** HTML5 with semantic elements
- [x] Use semantic tags: `<section>`, `<div>`, `<canvas>`, `<h1>`, `<p>`
- [x] Unique and descriptive IDs:
  - `app` - main application container
  - `message-container` - game messages
  - `hangman-canvas` - canvas for drawing
  - `word-container` - letter boxes container
  - `alphabet-container` - alphabet buttons container
- [x] **CSS framework:** Bulma CSS classes (`.hero`, `.box`, `.container`, `.columns`, `.is-primary`, `.has-text-centered`)
- [x] Complete meta tags:
  - charset="UTF-8"
  - viewport for mobile responsiveness
  - description: "Classic Hangman game with animal names - A TypeScript SPA"
  - author: "Fabián González Lence"
- [x] Canvas element with explicit width/height attributes (400x400)
- [x] Script tag with `type="module"` for ES6 module support

## CSS:
- **Framework:** Bulma CSS (via CDN: `https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css`)
- **Preprocessor:** None (custom CSS in separate file)
- **Custom CSS file:** `/src/styles/main.css`
- [x] CSS variables defined in `:root`:
  ```css
  :root {
    --primary-color: #3273dc;
    --danger-color: #f14668;
    --success-color: #48c774;
    --text-color: #363636;
    --background-color: #f5f5f5;
  }
  ```
- [x] Mobile-first approach (base styles for mobile, media queries for desktop)
- [x] Flexbox for layouts (word boxes, alphabet buttons)
- [x] **No Grid needed** - Bulma columns handle main layout
- [x] Avoid `!important`
- [x] Comments for each major section

**Required custom CSS classes:**
- `.letter-box` - styling for individual word letter boxes
- `.letter-button` - styling for alphabet buttons
- `.victory-message` - green text for victory
- `.defeat-message` - red text for defeat
- `.attempt-counter` - styling for attempt counter
- `.restart-button` - styling for restart button

## Responsiveness:

**Mandatory breakpoints:**
- **Mobile:** 320px - 767px
  - Single column layout
  - Smaller letter boxes (40x40px)
  - Smaller alphabet buttons (40x40px)
  - Canvas scales to 100% width with max-width: 400px
  - Reduced font sizes
  - Padding: 1rem

- **Tablet:** 768px - 1023px
  - Same as desktop (centered layout works well)
  - Bulma `.column.is-8` provides good tablet layout

- **Desktop:** 1024px+
  - Centered layout with max-width
  - Letter boxes: 50x60px
  - Alphabet buttons: 45x45px
  - Canvas: fixed 400x400px
  - Padding: 2rem

**Behaviors per device:**
- **Mobile changes:**
  - Letter boxes wrap more frequently (smaller width)
  - Alphabet buttons in multiple rows with wrapping
  - Canvas responsive but maintains aspect ratio
  - Reduced font sizes for all text elements
  - Tighter spacing (gap: 0.5rem maintained but smaller elements)

**Media query structure:**
```css
/* Mobile-first base styles */

@media (max-width: 768px) {
  /* Mobile specific overrides */
  #app { padding: 1rem; }
  .letter-box { width: 40px; height: 50px; font-size: 1.5rem; }
  .letter-button { width: 40px; height: 40px; font-size: 1rem; }
  #hangman-canvas { width: 100%; max-width: 400px; height: auto; }
}
```

## Performance:
- [x] **No images required** - Canvas-based drawing only
- [x] Minified CSS from Bulma CDN
- [x] TypeScript compiled to optimized JavaScript by Vite
- [x] No lazy loading needed (SPA, all content above fold)
- [x] **Fonts:** System font stack (no web fonts needed):
  - 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
  - No font-display needed (system fonts)

## SEO:
- [x] Title tag: `<title>The Hangman Game</title>` (21 characters, under 60)
- [x] Meta description: `<meta name="description" content="Classic Hangman game with animal names - A TypeScript SPA">` (62 characters, under 160)
- [x] Correct heading hierarchy:
  - Single H1: "The Hangman Game" (in hero section)
  - Subtitle as paragraph, not heading
- [x] Language: `<html lang="en">`

## Accessibility:
- [x] **Contrast:** 
  - Primary blue (#3273dc) on white - WCAG AA compliant
  - Dark gray text (#363636) on white background - WCAG AA compliant
  - White text on primary blue (hero) - WCAG AA compliant
  
- [x] **Keyboard navigation:**
  - All alphabet buttons are standard `<button>` elements (keyboard accessible)
  - Disabled buttons properly marked with `disabled` attribute
  - Focus styles visible (Bulma default + custom if needed)

- [x] **ARIA attributes:**
  - Canvas: `<canvas id="hangman-canvas" aria-label="Hangman drawing showing game progress"></canvas>`
  - Message container: `<div id="message-container" aria-live="polite" aria-atomic="true">`
  - Alphabet buttons: `<button aria-label="Letter [X]" aria-pressed="false">`
  - Restart button (when created): `<button class="restart-button" aria-label="Restart game">`

- [x] **Labels:**
  - No traditional form inputs, but button text serves as labels
  - Each button contains visible text (A, B, C, etc.)

- [x] **Focus styles:**
  ```css
  button:focus {
    outline: 2px solid #3273dc;
    outline-offset: 2px;
  }
  ```

---

# DELIVERABLES

## 1. File structure
```
1-TheHangmanGame/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.ts                    # Entry point (imports MVC classes)
│   ├── models/
│   │   ├── game-model.ts         # Game logic (not needed for HTML)
│   │   ├── word-dictionary.ts    # Word management (not needed for HTML)
│   │   └── guess-result.ts       # Enum (not needed for HTML)
│   ├── views/
│   │   ├── game-view.ts          # Main view coordinator (not needed for HTML)
│   │   ├── word-display.ts       # Creates letter boxes dynamically
│   │   ├── alphabet-display.ts   # Creates alphabet buttons dynamically
│   │   ├── hangman-renderer.ts   # Canvas drawing
│   │   └── message-display.ts    # Message and restart button
│   ├── controllers/
│   │   └── game-controller.ts    # Event coordination (not needed for HTML)
│   └── styles/
│       └── main.css              # Custom styles (THIS IS NEEDED)
├── index.html                     # Main HTML file (THIS IS NEEDED)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

**Note:** You only need to generate `index.html` and `src/styles/main.css`. The TypeScript files are handled separately by the development team.

---

## 2. HTML Code

The modification of the base `index.html` sent via this prompt to accoplished all the tasks required.

---

## 3. CSS Code

The full implementation of the `/src/styles/main.css` file.

---

## 4. Documentation

### Required assets:

**Images:**
- [ ] **Favicon** (`public/favicon.ico`): 
  - Recommended: 32x32px or 16x16px ICO format
  - Simple icon representing hangman or letter "H"
  - Can use online favicon generator from simple design

**Icons:**
- [ ] **No external icons needed** - All game elements are text-based or canvas-drawn
- [ ] Optional: Font Awesome or similar if adding social media links to footer

**Fonts:**
- [x] **System font stack** (already specified in CSS):
  - `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
  - No Google Fonts CDN needed
  - Fast loading, no external dependencies

**CDN Dependencies:**
- [x] **Bulma CSS** v1.0.2:
  - URL: `https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css`
  - Purpose: Main CSS framework for layout, hero, boxes, columns
  - Integrity hash: Optional but recommended for production

---

### Deployment instructions:

**Development:**
1. Install Node.js (v18 or higher)
2. Navigate to project directory: `cd 1-TheHangmanGame`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Open browser to `http://localhost:3000`

**Production build:**
1. Build project: `npm run build`
2. Output generated in `dist/` directory
3. Deploy `dist/` folder to hosting service

**Deployment options:**
- **GitHub Pages:**
  1. Push code to GitHub repository
  2. GitHub Actions automatically builds and deploys
  3. Configure repository settings for Pages deployment
  4. Access at `https://[username].github.io/[repo-name]/`

- **Netlify:**
  1. Connect GitHub repository to Netlify
  2. Build command: `npm run build`
  3. Publish directory: `dist`
  4. Auto-deploy on push to main branch

- **Vercel:**
  1. Import project from GitHub
  2. Vercel auto-detects Vite configuration
  3. Auto-deploy on push

---

## 5. Validation checklist

### HTML Validation:
- [ ] Validate HTML at [W3C Validator](https://validator.w3.org/)
- [ ] Check for:
  - Proper DOCTYPE declaration
  - No duplicate IDs
  - Properly nested elements
  - Valid ARIA attributes
  - Semantic HTML usage

### CSS Validation:
- [ ] Validate CSS at [W3C CSS Validator](https://jigsaw.w3.org/css-validator/)
- [ ] Check for:
  - No syntax errors
  - Valid property values
  - Proper vendor prefix usage (if any)

### Responsive Testing:
- [ ] Test at all breakpoints:
  - 320px (smallest mobile)
  - 375px (iPhone SE)
  - 768px (tablet)
  - 1024px (desktop)
  - 1440px (large desktop)
- [ ] Verify in browser dev tools:
  - Chrome DevTools device emulator
  - Firefox Responsive Design Mode
  - Safari Web Inspector

### Functionality:
- [ ] All IDs properly set (`message-container`, `hangman-canvas`, `word-container`, `alphabet-container`)
- [ ] Canvas element renders correctly
- [ ] Bulma classes apply correctly
- [ ] Custom CSS loads without errors
- [ ] TypeScript module loads (check console for errors)

### Performance:
- [ ] Run Lighthouse audit (target scores):
  - Performance: >90
  - Accessibility: >90
  - Best Practices: >90
  - SEO: >90
- [ ] Check for:
  - Fast initial load (Bulma CDN is cached)
  - No render-blocking resources
  - Proper viewport configuration

### Accessibility:
- [ ] Run axe DevTools or WAVE browser extension
- [ ] Check for:
  - Sufficient color contrast (4.5:1 for normal text)
  - Keyboard navigation works
  - ARIA attributes properly used
  - Focus indicators visible
  - Screen reader compatibility

### Browser Compatibility:
- [ ] Test in modern browsers:
  - Chrome (latest 2 versions)
  - Firefox (latest 2 versions)
  - Safari (latest 2 versions)
  - Edge (latest 2 versions)
- [ ] Check for:
  - Canvas API support (all modern browsers)
  - ES6 modules support
  - Flexbox support (all modern browsers)

---

# OUTPUT FORMAT

## Deliverable Files:

### 1. index.html
```html
<!-- Complete HTML code provided in section 2 above -->
```

### 2. src/styles/main.css
```css
/* Complete CSS code provided in section 3 above */
```

---

## Implementation notes:

### Important considerations:

1. **Dynamic Content Generation:**
   - The HTML provides only container structure
   - All game elements (letter boxes, alphabet buttons, messages) are created dynamically by TypeScript classes
   - Do NOT hard-code letter boxes or buttons in HTML

2. **Vite Build System:**
   - The `<script type="module" src="/src/main.ts">` will be processed by Vite
   - Vite handles TypeScript compilation and bundling
   - In development: module hot reloading works automatically
   - In production: bundled and minified automatically

3. **Bulma Integration:**
   - Bulma classes handle: grid layout (`.columns`), spacing (`.box`), hero section (`.hero.is-primary`)
   - Custom CSS only adds game-specific elements
   - Do not override Bulma classes unnecessarily

4. **Canvas Considerations:**
   - Canvas width/height must be set as HTML attributes (not CSS)
   - Canvas uses `width="400" height="400"` attributes
   - CSS can scale canvas proportionally on mobile using `max-width: 100%`

5. **Accessibility:**
   - `aria-live="polite"` on message container ensures screen readers announce updates
   - `aria-label` on canvas describes its purpose
   - Button elements are naturally keyboard accessible

6. **No JavaScript in HTML:**
   - All interactivity handled by TypeScript modules
   - No inline event handlers
   - No inline scripts

---

## Libraries/CDNs used:

1. **Bulma CSS v1.0.2**
   - URL: `https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css`
   - Purpose: Main CSS framework for responsive layout, hero section, boxes, columns
   - License: MIT
   - Why: Lightweight, modern, no JavaScript dependencies, easy to customize

2. **System Fonts (no CDN)**
   - Font stack: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
   - Purpose: Fast-loading, native-looking typography
   - Why: No external font loading, instant rendering, cross-platform

---

## Additional customizations suggested:

### Optional enhancements (not required for base implementation):

1. **Dark Mode Support:**
   - Add CSS variables for dark theme
   - Use `prefers-color-scheme` media query
   - Toggle button in header

2. **Animations:**
   - Add subtle entrance animations for letter reveal
   - Shake animation for wrong guesses
   - Celebration animation for victory

3. **Sound Effects:**
   - Correct guess sound
   - Wrong guess sound
   - Victory fanfare
   - Defeat sound
   - (Requires HTML5 Audio API integration in TypeScript)

4. **Progressive Web App (PWA):**
   - Add manifest.json
   - Add service worker for offline play
   - Add app icons for mobile home screen

5. **Visual Improvements:**
   - Add subtle shadow animations
   - Gradient background options
   - Custom hangman illustrations instead of canvas
   - Particle effects for victory

6. **Additional Game Features (requires TypeScript changes):**
   - Difficulty levels (4, 6, or 8 attempts)
   - Multiple word categories
   - Score tracking with localStorage
   - Timer for speedrun mode
   - Hints system

### Performance Optimizations:

1. **For production:**
   - Use Bulma CSS with only needed components (custom build)
   - Add integrity hash to CDN link
   - Enable compression on hosting service
   - Add caching headers

2. **Advanced:**
   - Lazy load Bulma if needed
   - Critical CSS inline in `<head>`
   - Preconnect to CDN: `<link rel="preconnect" href="https://cdn.jsdelivr.net">`

---

## Quality Assurance Checklist:

**Before submission:**
- [ ] HTML validates without errors
- [ ] CSS validates without errors
- [ ] All IDs are unique and correctly named
- [ ] Responsive design works at all breakpoints
- [ ] Accessibility audit passes (Lighthouse >90)
- [ ] Performance audit passes (Lighthouse >90)
- [ ] Canvas element properly configured
- [ ] Bulma CDN link correct and working
- [ ] Custom CSS file path correct
- [ ] TypeScript module loads successfully
- [ ] No console errors on page load
- [ ] Semantic HTML used appropriately
- [ ] ARIA attributes correctly applied
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation functional
- [ ] Tested in Chrome, Firefox, Safari, Edge
