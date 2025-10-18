# Digital Transformation Planning System - Web Application

**A professional, offline-first web application for digital transformation planning**

## Design System

### Color Palette

**Professional Minimal Theme:**
- **Primary**: Pastel Lilac (#a687c0) - Brand color for accents and interactive elements
- **Neutral**: Black to White spectrum - Core UI colors for text, backgrounds, borders
- **Philosophy**: Client-neutral design that won't clash with any organization's branding

### Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand (upcoming)
- **Storage**: Dexie.js + IndexedDB (upcoming)
- **Routing**: React Router (upcoming)

## Features

✅ **Completed:**
- Professional minimal design system (black/white/pastel lilac)
- Responsive layout with Tailwind CSS
- Tab-based navigation (Home, Projects, About)
- Feature showcase cards
- Color palette preview

🚧 **In Progress:**
- Project management system
- Interview/assessment templates
- Four-corner framework visualization
- Roadmap builder
- Offline-first data storage

## Development

### Prerequisites
- Node.js 22.11.0+ (or 20.19+/22.12+ recommended)
- npm 10.9.0+

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server

Running at: http://localhost:5173/

Hot Module Replacement (HMR) enabled for instant updates.

## Design Principles

1. **Professional**: Clean, minimal design suitable for enterprise consultants
2. **Client-Neutral**: Black/white/lilac palette won't clash with client branding
3. **Accessible**: WCAG 2.1 AA compliance (target)
4. **Offline-First**: All data stored locally, no server required
5. **Privacy-Focused**: No data leaves the browser

## Project Structure

```
app/
├── src/
│   ├── App.tsx           # Main application component
│   ├── index.css         # Tailwind directives & custom styles
│   ├── main.tsx          # React entry point
│   └── components/       # Reusable components (upcoming)
├── public/               # Static assets
├── index.html            # HTML entry point
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies
```

## Tailwind Custom Classes

Predefined utility classes for consistent styling:

- `.btn-primary` - Primary action button (lilac background)
- `.btn-secondary` - Secondary button (white with border)
- `.card` - Content card with border and shadow
- `.input` - Form input with focus ring

## Next Steps

1. Install state management (Zustand)
2. Set up client-side routing (React Router)
3. Implement IndexedDB storage (Dexie.js)
4. Build project creation flow
5. Integrate interview templates from CSV files
6. Create four-corner visualization
7. Build interactive roadmap planner
8. Export functionality (PDF, Excel, etc.)

## Documentation

Full transformation planning documentation available in parent directory:
- `QUICKSTART.md` - 30-minute quick start guide
- `ARCHITECTURE.md` - Technical architecture
- `REQUIREMENTS.md` - System requirements
- `TRANSFORMATION_JOURNEY.md` - Complete transformation guide
- And 12+ more comprehensive planning documents

## License

Internal use for digital transformation consulting.
