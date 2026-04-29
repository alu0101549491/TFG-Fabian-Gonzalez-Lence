# GLOBAL CONTEXT
Project: [Name]
Type: [Landing page / Static website / Documentation / Portfolio]
Purpose: [Brief description of the page's objective]
Target audience: [User profile]

# INPUT ARTIFACTS
## 1. Content Specification
Page: [Page name - E.g.: Home, About, Contact]
Required sections:
1. **[Section name]**: [Content description]
2. **[Section name]**: [Content description]
3. **[Section name]**: [Content description]

## 2. Visual Design
- Mockup/Wireframe: [Attach or describe in detail]
- Inspiration references: [URLs of similar sites]
- General style: [Minimalist / Modern / Corporate / Creative / etc.]

## 3. Design Specifications
### Colors:
- Primary: [#code]
- Secondary: [#code]
- Text: [#code]
- Background: [#code]
- Accents: [#code]

### Typography:
- Main font: [Name] - [Sizes: H1, H2, body]
- Secondary font: [Name] - [Specific use]
- Line height: [value]
- Font weights to use: [400, 600, 700]

### Spacing:
- Spacing system: [E.g.: multiples of 8px]
- Container padding: [values]
- Margin between sections: [values]

### Effects:
- Shadows: [Specifications]
- Transitions: [Duration and type]
- Hover effects: [Description]

## 4. Interactive Behaviors
- Navigation: [Fixed header / Smooth scroll / etc.]
- Animations: [On scroll / On hover / On load]
- Forms: [Validation / Visual feedback]
- Modal/Overlays: [When and how they appear]

# SPECIFIC TASK
Generate the complete page: **[page-name.html]**

## Required structure:
```
<HTML5 semantic structure>
├── <header> - Main navigation
├── <main>
│   ├── <section id="hero"> - Main section
│   ├── <section id="features"> - Features
│   ├── <section id="contact"> - Contact form
│   └── ...
└── <footer> - Footer with legal info
```

## Specific elements to include:
- [ ] Responsive navigation with hamburger menu
- [ ] Hero section with main CTA
- [ ] Content cards/grid
- [ ] Functional contact form
- [ ] Footer with links and social media
- [ ] Other specific elements
	* ...

# CONSTRAINTS AND STANDARDS

## HTML:
- Version: Semantic HTML5
- [ ] Use semantic tags (<header>, <nav>, <main>, <article>, etc.)
- [ ] Unique and descriptive IDs
- [ ] BEM classes for styling (if not using framework)
- [ ] Alt attributes on all images
- [ ] Complete meta tags (viewport, description, og:tags)

## CSS:
- Framework (if applicable): [Tailwind / Bootstrap / Bulma / None]
- Preprocessor: [Sass / Less / None]
- [ ] Mobile-first approach
- [ ] CSS variables for colors and sizes
- [ ] Flexbox/Grid for layouts
- [ ] Avoid !important
- [ ] Comments for complex sections

## Responsiveness:
Mandatory breakpoints:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

Behaviors per device:
- [Description of changes in mobile layout]

## Performance:
- [ ] Optimized images (modern format: WebP)
- [ ] Minified CSS in production
- [ ] Lazy loading of images below the fold
- [ ] Fonts with font-display: swap

## SEO:
- [ ] Descriptive title tag (<60 characters)
- [ ] Meta description (<160 characters)
- [ ] Correct heading hierarchy (unique H1)
- [ ] Semantic URL structure

## Accessibility:
- [ ] Minimum WCAG AA contrast
- [ ] Keyboard navigation
- [ ] ARIA attributes where necessary
- [ ] Labels on inputs
- [ ] Visible focus styles

# DELIVERABLES

## 1. File structure
```
project/
├── index.html
├── css/
│   ├── styles.css (or styles.min.css)
│   └── [other-file].css
├── images/
│   └── [optimized images]
└── assets/
    └── [icons, fonts, etc.]
```

## 2. HTML Code
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Complete meta tags -->
    <!-- Styles -->
</head>
<body>
    <!-- Complete structure -->
</body>
</html>
```

## 3. CSS Code
```css
/* === VARIABLES === */
:root {
    --color-primary: #...;
}

/* === RESET/NORMALIZE === */

/* === LAYOUT === */

/* === COMPONENTS === */

/* === UTILITIES === */

/* === MEDIA QUERIES === */
```

## 5. Documentation
### Required assets:
- [ ] Images: [list with recommended dimensions]
- [ ] Icons: [source or library to use]
- [ ] Fonts: [links to Google Fonts or others]

### Deployment instructions:
- [Steps to upload to production]

## 6. Validation checklist
- [ ] HTML validated in W3C Validator
- [ ] CSS without errors
- [ ] Responsive at all breakpoints
- [ ] Functional links
- [ ] Form with validation
- [ ] Performance: Lighthouse score >90
- [ ] Accessibility: Lighthouse score >90

# OUTPUT FORMAT
[Separate files or clearly delimited code blocks]

**Implementation notes:**
- [Important note 1]
- [Important note 2]

**Libraries/CDNs used:**
- [Library 1]: [URL] - [Purpose]

**Additional customizations suggested:**
- [Suggestion 1]
- [Suggestion 2]