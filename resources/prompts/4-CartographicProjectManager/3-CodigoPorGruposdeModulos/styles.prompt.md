# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → Infrastructure Layer → **Presentation Layer** (current)

**Current module:** Presentation Layer - Styles (CSS Variables and Main Styles)

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/                        # ✅ Already implemented
│   ├── domain/                             # ✅ Already implemented
│   ├── infrastructure/                     # ✅ Already implemented
│   ├── shared/                             # ✅ Already implemented
│   └── presentation/
│       ├── assets/
│       │   └── styles/
│       │       ├── variables.css           # 🎯 TO IMPLEMENT
│       │       └── main.css                # 🎯 TO IMPLEMENT
│       ├── components/
│       │   └── ...
│       ├── composables/
│       │   └── ...
│       ├── router/
│       │   └── ...
│       ├── stores/
│       │   └── ...
│       ├── views/
│       │   └── ...
│       ├── App.vue
│       └── main.ts
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification - Visual Design (Section 14)

### Color Scheme
The application uses a professional, corporate design inspired by project management tools like Asana, Trello, and Monday.com.

**Project Status Colors (Section 14.1):**
| Status | Color | Hex Code | Usage |
|--------|-------|----------|-------|
| Has pending tasks | Red | #DC2626 | Indicator, badge |
| No pending tasks | Green | #16A34A | Indicator, badge |
| Pending review | Yellow | #CA8A04 | Indicator, badge |
| Finalized | Gray | #6B7280 | Indicator, badge |

**Task Priority Colors (Section 10):**
| Priority | Color | Hex Code |
|----------|-------|----------|
| Urgent | Dark Red | #B91C1C |
| High | Red | #DC2626 |
| Medium | Yellow | #CA8A04 |
| Low | Green | #16A34A |

**Task Status Colors:**
| Status | Color | Hex Code |
|--------|-------|----------|
| Pending | Gray | #6B7280 |
| In Progress | Blue | #2563EB |
| Partial | Amber | #F59E0B |
| Performed | Violet | #8B5CF6 |
| Completed | Emerald | #10B981 |

### Typography (Section 14.2)
- **Primary Font:** Inter (Google Fonts)
- **Fallback:** system-ui, -apple-system, sans-serif
- **Font Sizes:**
  - Extra small: 12px (0.75rem)
  - Small: 14px (0.875rem)
  - Base: 16px (1rem)
  - Large: 18px (1.125rem)
  - Extra large: 20px (1.25rem)
  - 2XL: 24px (1.5rem)
  - 3XL: 30px (1.875rem)
  - 4XL: 36px (2.25rem)
- **Font Weights:**
  - Normal: 400
  - Medium: 500
  - Semibold: 600
  - Bold: 700

### Spacing System (Section 14.2)
Based on 4px grid:
- 0: 0
- 1: 4px (0.25rem)
- 2: 8px (0.5rem)
- 3: 12px (0.75rem)
- 4: 16px (1rem)
- 5: 20px (1.25rem)
- 6: 24px (1.5rem)
- 8: 32px (2rem)
- 10: 40px (2.5rem)
- 12: 48px (3rem)
- 16: 64px (4rem)

### Visual Effects (Section 14.2)
**Shadows:**
- Small: 0 1px 2px rgba(0, 0, 0, 0.05)
- Medium: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- Large: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
- XL: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

**Border Radius:**
- Small: 4px (0.25rem)
- Medium: 6px (0.375rem)
- Large: 8px (0.5rem)
- XL: 12px (0.75rem)
- 2XL: 16px (1rem)
- Full: 9999px

**Transitions:**
- Fast: 150ms
- Normal: 200ms
- Slow: 300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

### Responsive Breakpoints (NFR5)
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
- Large Desktop: > 1280px

### Component Dimensions
- Header height: 64px
- Sidebar width (expanded): 256px
- Sidebar width (collapsed): 64px
- Footer height: 48px
- Card padding: 16px - 24px
- Input height: 40px
- Button height: 36px - 44px

## 2. UI Mockup Structure (Section 14.3)

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (64px)                                                  │
│  ┌─────────┬───────────────────────────────────┬──────────────┐│
│  │  Logo   │  Navigation                       │  User Menu   ││
│  │         │  Projects | Calendar | Backup     │  🔔 👤       ││
│  └─────────┴───────────────────────────────────┴──────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  MAIN CONTENT                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  │  Content Area                                               ││
│  │  (Full width, scrollable)                                   ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 3. Accessibility Requirements (NFR17)

- WCAG 2.1 AA compliance
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Focus indicators visible
- Keyboard navigation support
- Screen reader compatible

---

# SPECIFIC TASK

Implement the CSS styles for the Presentation Layer. This includes CSS custom properties (variables) and the main global styles.

## Files to implement:

### 1. **variables.css**

**Responsibilities:**
- Define all CSS custom properties (variables)
- Organize variables by category
- Support light theme (dark theme optional)
- Enable consistent theming across the application

**CSS Variables to define:**

```css
/**
 * ============================================
 * COLOR SYSTEM
 * ============================================
 */

/* Primary Brand Colors */
--color-primary-50: /* Lightest */
--color-primary-100:
--color-primary-200:
--color-primary-300:
--color-primary-400:
--color-primary-500: /* Base */
--color-primary-600:
--color-primary-700:
--color-primary-800:
--color-primary-900: /* Darkest */

/* Semantic Colors - Success */
--color-success-50:
--color-success-100:
--color-success-500:
--color-success-600:
--color-success-700:

/* Semantic Colors - Warning */
--color-warning-50:
--color-warning-100:
--color-warning-500:
--color-warning-600:
--color-warning-700:

/* Semantic Colors - Error/Danger */
--color-error-50:
--color-error-100:
--color-error-500:
--color-error-600:
--color-error-700:

/* Semantic Colors - Info */
--color-info-50:
--color-info-100:
--color-info-500:
--color-info-600:
--color-info-700:

/* Neutral/Gray Colors */
--color-gray-50:
--color-gray-100:
--color-gray-200:
--color-gray-300:
--color-gray-400:
--color-gray-500:
--color-gray-600:
--color-gray-700:
--color-gray-800:
--color-gray-900:
--color-gray-950:

/* Background Colors */
--color-bg-primary:
--color-bg-secondary:
--color-bg-tertiary:
--color-bg-inverse:
--color-bg-overlay:

/* Text Colors */
--color-text-primary:
--color-text-secondary:
--color-text-tertiary:
--color-text-inverse:
--color-text-link:
--color-text-link-hover:

/* Border Colors */
--color-border-primary:
--color-border-secondary:
--color-border-focus:
--color-border-error:

/* Project Status Colors */
--color-status-active:
--color-status-active-bg:
--color-status-pending:
--color-status-pending-bg:
--color-status-review:
--color-status-review-bg:
--color-status-finalized:
--color-status-finalized-bg:

/* Task Priority Colors */
--color-priority-urgent:
--color-priority-urgent-bg:
--color-priority-high:
--color-priority-high-bg:
--color-priority-medium:
--color-priority-medium-bg:
--color-priority-low:
--color-priority-low-bg:

/* Task Status Colors */
--color-task-pending:
--color-task-pending-bg:
--color-task-in-progress:
--color-task-in-progress-bg:
--color-task-partial:
--color-task-partial-bg:
--color-task-performed:
--color-task-performed-bg:
--color-task-completed:
--color-task-completed-bg:

/**
 * ============================================
 * TYPOGRAPHY
 * ============================================
 */

/* Font Families */
--font-family-sans:
--font-family-mono:

/* Font Sizes */
--font-size-xs:
--font-size-sm:
--font-size-base:
--font-size-lg:
--font-size-xl:
--font-size-2xl:
--font-size-3xl:
--font-size-4xl:

/* Font Weights */
--font-weight-normal:
--font-weight-medium:
--font-weight-semibold:
--font-weight-bold:

/* Line Heights */
--line-height-none:
--line-height-tight:
--line-height-snug:
--line-height-normal:
--line-height-relaxed:
--line-height-loose:

/* Letter Spacing */
--letter-spacing-tighter:
--letter-spacing-tight:
--letter-spacing-normal:
--letter-spacing-wide:
--letter-spacing-wider:

/**
 * ============================================
 * SPACING
 * ============================================
 */

--spacing-0:
--spacing-1:
--spacing-2:
--spacing-3:
--spacing-4:
--spacing-5:
--spacing-6:
--spacing-8:
--spacing-10:
--spacing-12:
--spacing-16:
--spacing-20:
--spacing-24:

/**
 * ============================================
 * SIZING
 * ============================================
 */

/* Component Heights */
--height-input:
--height-input-sm:
--height-input-lg:
--height-button:
--height-button-sm:
--height-button-lg:
--height-header:
--height-footer:

/* Component Widths */
--width-sidebar:
--width-sidebar-collapsed:
--width-modal-sm:
--width-modal-md:
--width-modal-lg:
--width-modal-xl:

/* Container Widths */
--container-sm:
--container-md:
--container-lg:
--container-xl:

/**
 * ============================================
 * BORDERS
 * ============================================
 */

/* Border Widths */
--border-width-0:
--border-width-1:
--border-width-2:
--border-width-4:

/* Border Radius */
--radius-none:
--radius-sm:
--radius-md:
--radius-lg:
--radius-xl:
--radius-2xl:
--radius-full:

/**
 * ============================================
 * SHADOWS
 * ============================================
 */

--shadow-xs:
--shadow-sm:
--shadow-md:
--shadow-lg:
--shadow-xl:
--shadow-2xl:
--shadow-inner:
--shadow-none:

/**
 * ============================================
 * TRANSITIONS
 * ============================================
 */

/* Durations */
--duration-fast:
--duration-normal:
--duration-slow:

/* Easing Functions */
--ease-linear:
--ease-in:
--ease-out:
--ease-in-out:

/* Complete Transitions */
--transition-fast:
--transition-normal:
--transition-slow:
--transition-colors:
--transition-opacity:
--transition-transform:

/**
 * ============================================
 * Z-INDEX
 * ============================================
 */

--z-dropdown:
--z-sticky:
--z-fixed:
--z-modal-backdrop:
--z-modal:
--z-popover:
--z-tooltip:
--z-toast:

/**
 * ============================================
 * BREAKPOINTS (for reference in JS)
 * ============================================
 */

--breakpoint-sm:
--breakpoint-md:
--breakpoint-lg:
--breakpoint-xl:
--breakpoint-2xl:
```

---

### 2. **main.css**

**Responsibilities:**
- Import CSS variables
- Define CSS reset/normalize
- Define global base styles
- Define utility classes
- Define component base styles
- Define responsive utilities
- Define animation keyframes

**Structure:**

```css
/**
 * ============================================
 * IMPORTS
 * ============================================
 */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import './variables.css';

/**
 * ============================================
 * CSS RESET / NORMALIZE
 * ============================================
 */

/* Box sizing, margins, padding reset */
/* Form element normalization */
/* Media element defaults */
/* Table normalization */
/* Accessibility improvements */

/**
 * ============================================
 * BASE STYLES
 * ============================================
 */

/* HTML & Body */
/* Typography defaults */
/* Link styles */
/* List styles */
/* Image defaults */
/* Form element base styles */

/**
 * ============================================
 * LAYOUT UTILITIES
 * ============================================
 */

/* Container */
/* Flexbox utilities */
/* Grid utilities */
/* Spacing utilities */
/* Sizing utilities */

/**
 * ============================================
 * TYPOGRAPHY UTILITIES
 * ============================================
 */

/* Font sizes */
/* Font weights */
/* Text alignment */
/* Text colors */
/* Text decoration */
/* Text overflow */

/**
 * ============================================
 * COLOR UTILITIES
 * ============================================
 */

/* Background colors */
/* Text colors */
/* Border colors */

/**
 * ============================================
 * COMPONENT BASE STYLES
 * ============================================
 */

/* Buttons */
/* Inputs */
/* Cards */
/* Badges */
/* Alerts */
/* Tables */
/* Modals */

/**
 * ============================================
 * STATUS INDICATORS
 * ============================================
 */

/* Project status badges */
/* Task priority badges */
/* Task status badges */

/**
 * ============================================
 * RESPONSIVE UTILITIES
 * ============================================
 */

/* Hide/Show utilities */
/* Responsive spacing */
/* Responsive typography */

/**
 * ============================================
 * ANIMATIONS
 * ============================================
 */

/* Keyframes */
/* Animation utilities */

/**
 * ============================================
 * ACCESSIBILITY
 * ============================================
 */

/* Focus styles */
/* Screen reader utilities */
/* Reduced motion support */
```

---

# DETAILED IMPLEMENTATION REQUIREMENTS

## variables.css Implementation Details:

### Color Palette (Based on Tailwind CSS colors)

```css
:root {
  /* Primary - Blue */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  
  /* Success - Green */
  --color-success-50: #f0fdf4;
  --color-success-100: #dcfce7;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;
  
  /* Warning - Yellow/Amber */
  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;
  
  /* Error - Red */
  --color-error-50: #fef2f2;
  --color-error-100: #fee2e2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;
  
  /* Gray */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;
}
```

### Status Colors Mapping

```css
:root {
  /* Project Status - Semantic */
  --color-status-active: #16a34a;        /* Green - no pending tasks */
  --color-status-active-bg: #f0fdf4;
  --color-status-pending: #dc2626;       /* Red - has pending tasks */
  --color-status-pending-bg: #fef2f2;
  --color-status-review: #ca8a04;        /* Yellow - pending review */
  --color-status-review-bg: #fffbeb;
  --color-status-finalized: #6b7280;     /* Gray - finalized */
  --color-status-finalized-bg: #f9fafb;
  
  /* Task Priority */
  --color-priority-urgent: #b91c1c;
  --color-priority-urgent-bg: #fef2f2;
  --color-priority-high: #dc2626;
  --color-priority-high-bg: #fef2f2;
  --color-priority-medium: #ca8a04;
  --color-priority-medium-bg: #fffbeb;
  --color-priority-low: #16a34a;
  --color-priority-low-bg: #f0fdf4;
  
  /* Task Status */
  --color-task-pending: #6b7280;
  --color-task-pending-bg: #f9fafb;
  --color-task-in-progress: #2563eb;
  --color-task-in-progress-bg: #eff6ff;
  --color-task-partial: #f59e0b;
  --color-task-partial-bg: #fffbeb;
  --color-task-performed: #8b5cf6;
  --color-task-performed-bg: #f5f3ff;
  --color-task-completed: #10b981;
  --color-task-completed-bg: #ecfdf5;
}
```

## main.css Implementation Details:

### CSS Reset (Modern Approach)

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  -moz-tab-size: 4;
  tab-size: 4;
}

body {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Button Styles

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition-colors);
  height: var(--height-button);
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary { /* Primary button styles */ }
.btn-secondary { /* Secondary button styles */ }
.btn-outline { /* Outline button styles */ }
.btn-ghost { /* Ghost button styles */ }
.btn-danger { /* Danger button styles */ }
.btn-sm { /* Small button */ }
.btn-lg { /* Large button */ }
```

### Input Styles

```css
.input {
  display: block;
  width: 100%;
  height: var(--height-input);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: var(--transition-colors);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input:disabled {
  background-color: var(--color-gray-100);
  cursor: not-allowed;
}

.input-error {
  border-color: var(--color-error-500);
}

.input-error:focus {
  box-shadow: 0 0 0 3px var(--color-error-100);
}
```

### Card Styles

```css
.card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card-header {
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-border-primary);
}

.card-body {
  padding: var(--spacing-6);
}

.card-footer {
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-border-primary);
}
```

### Badge/Status Indicator Styles

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border-radius: var(--radius-full);
}

/* Status badges */
.badge-status-active { 
  color: var(--color-status-active);
  background-color: var(--color-status-active-bg);
}

.badge-status-pending {
  color: var(--color-status-pending);
  background-color: var(--color-status-pending-bg);
}

/* Priority badges */
.badge-priority-urgent {
  color: var(--color-priority-urgent);
  background-color: var(--color-priority-urgent-bg);
}

/* Task status badges */
.badge-task-completed {
  color: var(--color-task-completed);
  background-color: var(--color-task-completed-bg);
}
```

### Responsive Utilities

```css
/* Hide on mobile, show on tablet+ */
@media (max-width: 767px) {
  .hidden-mobile { display: none !important; }
}

@media (min-width: 768px) {
  .hidden-tablet { display: none !important; }
}

@media (min-width: 1024px) {
  .hidden-desktop { display: none !important; }
}

/* Responsive container */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

### Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-fade-in { animation: fadeIn var(--duration-normal) var(--ease-out); }
.animate-slide-up { animation: slideInUp var(--duration-normal) var(--ease-out); }
.animate-spin { animation: spin 1s linear infinite; }
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
```

### Accessibility

```css
/* Focus visible for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Remove focus outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --color-border-primary: #000;
    --color-text-secondary: #000;
  }
}
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** CSS3
- **Methodology:** BEM-inspired naming for components
- **Architecture:** CSS Custom Properties for theming
- **Compatibility:** Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)

## Mandatory best practices:
- **CSS Custom Properties:** Use variables for all colors, sizes, and spacing
- **Mobile First:** Base styles for mobile, media queries for larger screens
- **Accessibility:** Focus states, reduced motion, high contrast support
- **Performance:** Minimize specificity, avoid deep nesting
- **Maintainability:** Organized sections with clear comments

## Naming Conventions:
- **Variables:** `--category-name-variant` (e.g., `--color-primary-500`)
- **Classes:** `.component-element-modifier` (e.g., `.btn-primary-lg`)
- **Utilities:** `.property-value` (e.g., `.text-center`, `.mt-4`)

## Browser Support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

# DELIVERABLES

1. **Complete source code** for both files (variables.css + main.css)

2. **For variables.css:**
   - Complete color palette (primary, semantic, gray)
   - All status/priority colors
   - Typography variables
   - Spacing scale
   - Component sizing
   - Border and shadow variables
   - Transition variables
   - Z-index scale

3. **For main.css:**
   - CSS reset/normalize
   - Base element styles
   - Layout utilities (flexbox, grid)
   - Typography utilities
   - Color utilities
   - Component base styles (buttons, inputs, cards, badges)
   - Status indicator styles
   - Responsive utilities
   - Animation keyframes
   - Accessibility utilities

4. **Design considerations:**
   - Consistent visual hierarchy
   - Clear interactive states (hover, focus, active, disabled)
   - Smooth transitions
   - Accessible color contrasts

---

# OUTPUT FORMAT

For each file, provide the complete implementation:

```css
/* src/presentation/assets/styles/variables.css */
[Complete code here]
```

```css
/* src/presentation/assets/styles/main.css */
[Complete code here]
```

**Design decisions made:**
- [Decision 1 and justification]
- [Decision 2 and justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
