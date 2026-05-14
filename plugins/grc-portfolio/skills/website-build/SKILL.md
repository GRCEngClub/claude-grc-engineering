---
name: website-build
description: Scaffolds a complete React/Vite website project from site-config.json. Generates components, styles, and configuration based on the site type and plan data.
allowed-tools: Bash, Read, Write, Edit, Glob
---

# Website Build Skill

You are running the `/grc-portfolio:build` skill. Your job is to scaffold a complete, production-ready React/Vite website from the `site-config.json` created by `/grc-portfolio:plan`.

## Step 1: Locate and Validate Config

Find `site-config.json`:
- Check `$ARGUMENTS` for a project directory path
- Check the current working directory
- Ask the user if not found

Read it and validate that `status.planComplete === true`. If not, tell the user to run `/grc-portfolio:plan` first.

Read the `siteType` field to determine which components to generate.

## Step 2: Scaffold Project Structure

Create the following structure in the project directory:

```
src/
  main.jsx
  App.jsx
  App.css
  index.css
  components/
    Navbar.jsx
    Hero.jsx
    Footer.jsx
    ContactForm.jsx  (if features.contactForm)
    ... (type-specific components)
  assets/
index.html           (Vite's entry HTML, references /src/main.jsx)
public/
  favicon.svg
package.json
vite.config.js
.env.example
.gitignore
```

## Step 3: Generate package.json

Base it on the toolkit's `examples/package.json` at `$TOOLKIT_DIR/examples/package.json`. Customize:
- Set `name` to the `projectName` from config
- Keep all dependencies the same (react, react-dom, react-router-dom)
- Keep all devDependencies the same

## Step 4: Generate vite.config.js

Copy from `$TOOLKIT_DIR/examples/vite.config.js` as-is. It's already well-configured for AWS deployment.

## Step 5: Generate Components by Site Type

### All Types (shared components):

**Navbar.jsx** -- Navigation bar with:
- Site name/logo on the left
- Navigation links based on `pages` array from config
- Mobile-responsive hamburger menu
- Smooth scroll to sections

**Hero.jsx** -- Full-width hero section with:
- Main heading (name/company/product depending on type)
- Subtitle/tagline
- CTA button(s) based on `design.ctaPreference`
- Background using the color scheme

**Footer.jsx** -- Footer with:
- Copyright notice
- Social links (if available)
- Quick navigation links

**ContactForm.jsx** (if `features.contactForm`):
- Form with name, email, company (optional), message fields
- Submits to `VITE_CONTACT_API_ENDPOINT` env var
- Loading state, success/error feedback
- Basic client-side validation

### Portfolio/Personal Components:
- **About.jsx** -- Professional summary, photo placeholder
- **Skills.jsx** -- Skills organized by category in a grid
- **Projects.jsx** -- Project cards with descriptions, tech tags, links
- **Certifications.jsx** -- Certification badges/list
- **Speaking.jsx** -- Talks, podcasts, articles (if data provided)

### Business Landing Page Components:
- **Services.jsx** -- Service cards with descriptions
- **Testimonials.jsx** -- Testimonial cards with quotes
- **Team.jsx** -- Team member cards
- **Pricing.jsx** -- Pricing tier cards (if data provided)

### SaaS Marketing Components:
- **Features.jsx** -- Feature grid with icons and descriptions
- **Pricing.jsx** -- Pricing comparison table/cards
- **Integrations.jsx** -- Integration logos/grid
- **CTA.jsx** -- Call-to-action section with demo/signup buttons

### Brochure Components:
- **About.jsx** -- Business description
- **Services.jsx** -- Service list
- **Hours.jsx** -- Business hours and location/map placeholder

## Step 6: Generate Styles

### index.css
CSS reset and base styles. Set CSS custom properties based on `design.colorScheme`:

**navy-slate (GRC default):**
```css
--color-primary: #1e3a5f;
--color-primary-dark: #152a45;
--color-secondary: #64748b;
--color-accent: #3b82f6;
--color-bg: #ffffff;
--color-bg-alt: #f8fafc;
--color-text: #1e293b;
--color-text-light: #64748b;
```

**dark-charcoal:**
```css
--color-primary: #818cf8;
--color-primary-dark: #6366f1;
--color-secondary: #94a3b8;
--color-accent: #22d3ee;
--color-bg: #0f172a;
--color-bg-alt: #1e293b;
--color-text: #f1f5f9;
--color-text-light: #94a3b8;
```

**white-teal:**
```css
--color-primary: #0d9488;
--color-primary-dark: #0f766e;
--color-secondary: #64748b;
--color-accent: #06b6d4;
--color-bg: #ffffff;
--color-bg-alt: #f0fdfa;
--color-text: #1e293b;
--color-text-light: #64748b;
```

If `design.colorScheme` is "custom", use `design.primaryColor` and `design.accentColor` from config and derive the rest.

### App.css
Component-level styles. Use the CSS custom properties from index.css. Style should match `design.style`:
- **professional**: Conservative layout, clean typography, authoritative feel
- **bold-modern**: Strong colors, larger typography, prominent shadows
- **clean-minimal**: Lots of whitespace, thin borders, subtle shadows

## Step 7: Generate main.jsx and App.jsx

**main.jsx:**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**App.jsx:**
Import and compose all generated components in order. Use a single-page layout with sections. Include smooth scrolling.

## Step 8: Generate index.html

Write this file at the **project root** (`<projectDir>/index.html`), not under `public/`. Vite resolves the entry HTML from the project root, and `/src/main.jsx` is referenced as an absolute project-root path:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="{{site description from config}}" />
    <title>{{site title from config}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## Step 9: Generate .env.example and .gitignore

**.env.example:**
```
# Contact Form API endpoint (from /grc-portfolio:infra deployment)
VITE_CONTACT_API_ENDPOINT=
```

**.gitignore:**
```
node_modules
dist
.env
.env.local
.DS_Store
*.log
```

## Step 10: Copy Lambda Function (if contact form)

If `features.contactForm` is true, copy `$TOOLKIT_DIR/lambda/contact-form-handler.js` into a `lambda/` directory in the project.

## Step 11: Install and Verify

Run:
```bash
cd <projectDir>
npm install
npm run build
```

If the build fails, fix the errors. Common issues:
- Import paths
- Missing dependencies
- JSX syntax errors

## Step 12: Update Config

Update `site-config.json`:
- Set `status.buildComplete = true`

## Step 13: Summary

Tell the user:
- The project has been scaffolded at `<projectDir>`
- List the files created
- Tell them they can run `npm run dev` to preview locally
- Suggest running `/grc-portfolio:preflight` next to check AWS readiness

## Important Guidelines

- **Populate real content** from site-config.json -- don't use placeholder "Lorem ipsum" text. Use the actual names, descriptions, certifications, frameworks, projects, etc. that the user provided.
- **Make it look good** -- the generated site should be visually polished and production-ready out of the box.
- **Responsive** -- all components must work on mobile, tablet, and desktop.
- **Accessible** -- use semantic HTML, proper heading hierarchy, alt text, aria labels.
- **Keep it simple** -- vanilla React with CSS. No CSS frameworks unless the user specifically requests one.

## Variables

- `$TOOLKIT_DIR` = read from `site-config.json` `toolkitDir` field
- `$ARGUMENTS` = arguments passed after `/build` (expected: project directory path)
