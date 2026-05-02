Perfect! Let's move to **Module #11: `src/components/TrackInfo.tsx`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Components Layer - Presentational Components (Track Information Display)

---

# PROJECT FILE STRUCTURE REMINDER

```
2-MusicWebPlayer/
├── src/
│   ├── types/
│   │   ├── song.ts                    ← COMPLETED
│   │   ├── playback-error.ts          ← COMPLETED
│   │   └── validation.ts              ← COMPLETED
│   ├── components/
│   │   ├── Player.tsx
│   │   ├── TrackInfo.tsx              ← CURRENT MODULE
│   │   ├── Controls.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Playlist.tsx
│   │   └── AddSongForm.tsx
│   ├── hooks/
│   │   ├── useAudioPlayer.ts          ← COMPLETED
│   │   ├── usePlaylist.ts             ← COMPLETED
│   │   └── useLocalStorage.ts         ← COMPLETED
│   ├── utils/
│   │   ├── time-formatter.ts          ← COMPLETED
│   │   ├── error-handler.ts           ← COMPLETED
│   │   └── audio-validator.ts         ← COMPLETED
│   ├── data/
│   │   └── playlist-data-provider.ts  ← COMPLETED
│   └── styles/
│       └── main.css
├── index.html
├── package.json
├── tsconfig.json
└── ... (config files)
```

---

# CODE STRUCTURE REMINDER

```typescript
import React from 'react';

/**
 * Props for the TrackInfo component.
 * @category Components
 */
export interface TrackInfoProps {
  /** Song title to display */
  title: string;
  
  /** Artist name to display */
  artist: string;
  
  /** URL to the cover art image */
  cover: string;
}

/**
 * Component that displays current track information including cover art,
 * title, and artist.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const TrackInfo: React.FC<TrackInfoProps> = (props) => {
  // TODO: Implementation
  return (
    <div className="track-info">
      {/* TODO: Render track information */}
    </div>
  );
};
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR6:** Automatic information update when changing songs - when changing songs (via Next/Previous), the following are automatically updated: title, artist, cover, and total duration
- **FR7:** Display current song title - the title of the playing song is clearly displayed in the interface and updates when changing tracks
- **FR8:** Display current song artist - the artist name of the playing song is clearly displayed and updates when changing tracks
- **FR9:** Display current song cover - the cover image of the playing song is prominently displayed and updates when changing tracks

**Relevant Non-Functional Requirements:**
- **NFR3:** Modular code with separate React components - code is organized into reusable components (TrackInfo is one of them)
- **NFR5:** Static typing with TypeScript in all components
- **NFR6:** Intuitive and accessible interface - UI is easy to use with clear labels
- **NFR7:** Legible typography and contrasting colors - texts have minimum size of 14px, sufficient contrast

**UI Design Specifications (from Section 12):**
- **Desktop:** Cover image 300x300px (square)
- **Mobile:** Cover image 200x200px (square)
- **Song title:** 20-24px, weight 600
- **Artist name:** 16-18px, weight 400
- **Typography:** Inter, Roboto or system-ui
- **Colors:** Primary text on dark background, secondary text for artist

## 2. Class Diagram (Relevant Section)

```typescript
class TrackInfo {
    +props: TrackInfoProps
    +render(): JSX.Element
}

class TrackInfoProps {
    +title: string
    +artist: string
    +cover: string
}
```

**Relationships:**
- Used by: `Player` component (renders TrackInfo with current song data)
- Presentational component: No state, no logic, only displays props
- Pure component: Same props → same output

## 3. Use Case Diagram (Relevant Use Cases)

- **View Song Information:** User sees current song title, artist, and cover art
- **View Cover Art:** User sees album artwork prominently displayed
- **Automatic Update:** When song changes, all displayed information updates immediately

---

# SPECIFIC TASK

Implement the React component: **`src/components/TrackInfo.tsx`**

## Responsibilities:

1. **Display song cover art** prominently with proper sizing and loading states
2. **Display song title** with appropriate typography and styling
3. **Display artist name** with secondary text styling
4. **Handle missing/broken images** with fallback placeholder
5. **Provide semantic HTML** for accessibility
6. **Responsive design** that adapts to different screen sizes
7. **Pure presentational component** with no internal state or logic

## Component Structure:

### **TrackInfo Component**

A pure presentational component that displays current track metadata.

- **Description:** Displays the cover art, title, and artist of the currently playing song
- **Type:** Functional Component (React.FC)
- **Props:** TrackInfoProps interface
- **State:** None (stateless)
- **Returns:** JSX.Element

---

## Props Interface:

### **TrackInfoProps**

```typescript
/**
 * Props for the TrackInfo component
 */
interface TrackInfoProps {
  /**
   * Song title to display
   * @example "Bohemian Rhapsody"
   */
  title: string;
  
  /**
   * Artist name to display
   * @example "Queen"
   */
  artist: string;
  
  /**
   * URL to the cover art image
   * Should be square (1:1 aspect ratio)
   * @example "https://example.com/covers/queen-bohemian.jpg"
   */
  cover: string;
}
```

---

## Component Implementation Details:

### **JSX Structure:**

```jsx
<div className="track-info">
  <img 
    src={props.cover}
    alt={`${props.title} by ${props.artist}`}
    className="track-info__cover"
    onError={handleImageError}
  />
  <div className="track-info__details">
    <h2 className="track-info__title">{props.title}</h2>
    <p className="track-info__artist">{props.artist}</p>
  </div>
</div>
```

### **Key Elements:**

1. **Container div (`track-info`):**
   - Wraps entire component
   - Handles layout (flexbox for desktop side-by-side, column for mobile)
   - Provides spacing and alignment

2. **Cover image:**
   - `src`: props.cover
   - `alt`: Descriptive alt text combining title and artist
   - `className`: For styling (responsive sizing)
   - `onError`: Handler for broken images
   - Loading state: Consider lazy loading for performance
   - Aspect ratio: Square (1:1) enforced via CSS

3. **Details container:**
   - Groups title and artist
   - Provides text alignment and spacing

4. **Title (h2):**
   - Semantic heading element
   - Large, bold text (20-24px, weight 600)
   - Primary text color
   - May need text truncation for very long titles

5. **Artist (p):**
   - Paragraph or span element
   - Medium text (16-18px, weight 400)
   - Secondary text color (lighter than title)
   - May need text truncation for very long names

---

## Functionality Requirements:

### 1. **Image Error Handling**

Handle broken or missing cover images gracefully.

```typescript
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = '/covers/default-cover.jpg'; // Fallback image
  e.currentTarget.alt = 'Default album cover';
};
```

**Requirements:**
- Fallback to placeholder image if cover fails to load
- Placeholder should be visually appropriate (generic music icon)
- Don't break layout if image missing
- Alt text should update to indicate placeholder

### 2. **Accessibility Features**

- **Alt text:** Descriptive alt text on image ("`${title} by ${artist}` album cover")
- **Semantic HTML:** Use proper heading hierarchy (h2 for title)
- **Text contrast:** Ensure WCAG AA compliance for text colors
- **Focus states:** Not needed (no interactive elements)
- **Screen reader:** All text content is accessible

### 3. **Responsive Behavior**

- **Desktop (1024px+):**
  - Cover: 300x300px
  - Horizontal layout (cover left, text right)
  - Text aligned left

- **Tablet (768px-1023px):**
  - Cover: 250x250px
  - Horizontal or vertical layout depending on orientation
  - Text aligned center or left

- **Mobile (320px-767px):**
  - Cover: 200x200px
  - Vertical layout (cover top, text bottom)
  - Text aligned center
  - Full width of container

### 4. **Text Overflow Handling**

For very long titles or artist names:
- Use CSS `text-overflow: ellipsis`
- Or allow wrapping with `overflow-wrap: break-word`
- Ensure text doesn't break layout
- Consider max lines with `-webkit-line-clamp`

---

## Styling Approach:

**Note:** This component will have a separate CSS Module file (`TrackInfo.module.css`) or use CSS-in-JS. For now, define class names using BEM-like convention.

### **CSS Classes:**

```css
.track-info {
  /* Container styles */
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  /* Responsive: column on mobile, row on desktop */
}

.track-info__cover {
  /* Cover image styles */
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  /* Responsive: 200px on mobile */
}

.track-info__details {
  /* Text container styles */
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.track-info__title {
  /* Title styles */
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  /* Text overflow handling */
}

.track-info__artist {
  /* Artist styles */
  font-size: 18px;
  font-weight: 400;
  color: var(--color-text-secondary);
  margin: 0;
  /* Text overflow handling */
}

@media (max-width: 767px) {
  .track-info {
    flex-direction: column;
    text-align: center;
  }
  
  .track-info__cover {
    width: 200px;
    height: 200px;
  }
}
```

---

## Edge Cases to Handle:

1. **Empty/null props:**
   - Display "Unknown Title" / "Unknown Artist" if empty
   - Display placeholder image if cover empty

2. **Very long text:**
   - Title or artist name exceeds container width
   - Use ellipsis or word wrapping
   - Prevent layout breaking

3. **Special characters in text:**
   - Unicode characters, emojis in title/artist
   - HTML entities should be rendered correctly (React handles this)

4. **Image loading states:**
   - Consider showing skeleton/spinner while loading
   - Smooth transition when image loads (optional enhancement)

5. **Broken image URL:**
   - onError handler sets fallback image
   - Prevent showing broken image icon

6. **Null/undefined cover:**
   - Use placeholder image by default
   - Handle in component or provide default in props

---

## Dependencies:

- **React imports:**
  ```typescript
  import React from 'react';
  ```
- **Type imports:** None (props defined inline or exported)
- **No hooks:** Pure presentational component
- **No utilities:** No logic to extract

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+ with React 18
- **Code style:** Google TypeScript Style Guide
- **Component type:** Functional component (React.FC)
- **Maximum complexity:** Very low (no logic, just display)
- **Maximum length:** ~50 lines (simple component)

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Only displays track information
  - **Open/Closed:** Easy to extend with additional metadata
- **Input parameter validation:**
  - Provide default props or handle empty values gracefully
- **Robust exception handling:**
  - Handle image load errors
  - Never throw from component
- **No logging needed:** Simple presentational component
- **Comments for complex logic:**
  - Document image error handling
  - Note responsive behavior in comments

## React Best Practices:

- **Pure component:** Same props → same output (no side effects)
- **Prop types:** Use TypeScript interface for type safety
- **Default props:** Consider using default parameter values
- **Accessibility:** Proper alt text, semantic HTML
- **Performance:** React.memo() if re-rendering is expensive (optional)
- **CSS Modules:** Use scoped styles to avoid conflicts

## Documentation:

- **JSDoc on component:**
  - Description of component purpose
  - `@param` for props (or document interface)
  - `@returns` JSX.Element
  - `@example` showing usage
- **JSDoc on props interface:**
  - Document each prop with examples
- **Inline comments:**
  - Explain image error handling
  - Note responsive design decisions

## Accessibility:

- **Alt text:** Descriptive and meaningful
- **Semantic HTML:** h2 for title, p for artist
- **Color contrast:** WCAG AA compliant text colors
- **Focus management:** Not needed (no interactive elements)
- **ARIA attributes:** Not needed for simple display

## Styling:

- **CSS Modules:** Scoped styles prevent conflicts
- **BEM convention:** Clear class naming
- **Responsive:** Mobile-first media queries
- **CSS variables:** Use design tokens from global styles
- **Typography:** Follow design system

---

# DELIVERABLES

## 1. Complete source code of `src/components/TrackInfo.tsx` with:

- Organized imports
- TrackInfoProps interface definition
- Component function definition
- Image error handler
- JSX structure with proper class names
- Complete JSDoc documentation
- Inline comments where needed

## 2. Component documentation:

- Purpose and responsibilities
- Props documentation with examples
- Usage examples showing how Player uses it
- Notes on responsive behavior
- Accessibility features

## 3. Type safety:

- TypeScript interface for props
- Proper typing of event handlers
- No `any` types

## 4. Edge cases handled:

- Empty/null title or artist
- Broken cover image URL
- Very long text content
- Special characters in text
- Missing props (default values)

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: Using h2 for title vs h1 (semantic hierarchy)]
- [Decision 2: Image error handling approach (inline vs separate file)]
- [Decision 3: Whether to use React.memo for optimization]
- [Decision 4: CSS Modules vs inline styles vs styled-components]
- [Decision 5: Default values for missing props]
- [Decision 6: Text truncation strategy (ellipsis vs wrapping)]

**Component design rationale:**
- [Explain pure presentational component approach]
- [Document why no state is needed]
- [Justify semantic HTML choices]

**Accessibility considerations:**
- [Document alt text strategy]
- [Explain heading hierarchy]
- [Note color contrast compliance]

**Possible future improvements:**
- [Improvement 1: Skeleton loading state while image loads]
- [Improvement 2: Smooth fade-in animation when image loads]
- [Improvement 3: Image lazy loading for performance]
- [Improvement 4: Support for multiple cover sizes (srcset)]
- [Improvement 5: Tooltip showing full text on hover for truncated content]
- [Improvement 6: Animated transition when song changes]
- [Improvement 7: Heart/favorite button integrated into TrackInfo]
- [Improvement 8: Share button for current track]
- [Improvement 9: Genre/year display if available in Song type]
- [Improvement 10: Vinyl record rotation animation on cover]

---

**REMINDER:** This is a **pure presentational component** - no state, no side effects, just display props. Focus on clean JSX, proper accessibility, responsive design, and robust error handling for images. Keep it simple and reusable.
