# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

This is a **Digital Transformation Planning System**—a browser-based, offline-first web application for consultants to guide organizations through full-stack digital transformation. The system supports both **AI-inclusive** and **AI-free** transformation paths using a four-corner methodology.

**Current Status**: Early implementation (Phase 1 - Foundation)
**Target**: Single-page application (SPA) with React, TypeScript, and IndexedDB
**Key Principle**: Offline-first, privacy-preserving, client-side only (no backend in v1.0)

**Implementation Location**: The application code lives in `/app` subdirectory.

---

## Project Structure

```
digital-transformation/
├── app/                           # React application (working directory)
│   ├── src/
│   │   ├── components/            # React components (organized by feature)
│   │   │   ├── projects/          # Project management components
│   │   │   ├── assessments/       # Assessment & interview components
│   │   │   ├── four-corner/       # Four-corner diagram components
│   │   │   └── roadmap/           # Roadmap planning components
│   │   ├── stores/                # Zustand state management
│   │   │   └── useAppStore.ts     # Global app state
│   │   ├── lib/                   # Core libraries
│   │   │   └── database.ts        # Dexie.js database setup
│   │   ├── types/                 # TypeScript interfaces
│   │   │   └── index.ts           # All type definitions
│   │   ├── assets/                # Images, icons, static files
│   │   ├── App.tsx                # Main application component
│   │   ├── main.tsx               # Application entry point
│   │   └── index.css              # Global styles (Tailwind)
│   ├── public/                    # Static files served directly
│   ├── package.json               # Dependencies and scripts
│   ├── vite.config.ts             # Vite build configuration
│   ├── tsconfig.json              # TypeScript configuration
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   └── eslint.config.js           # ESLint configuration
├── data/                          # Interview templates (CSV) and Excel templates
├── docs/                          # Documentation (moved to root-level .md files)
├── REQUIREMENTS.md                # Comprehensive functional/non-functional requirements
├── TODO.md                        # Phased implementation plan (12 phases)
├── FUTURE.md                      # Future roadmap (v2.0+)
├── ARCHITECTURE.md                # Technical architecture and design
├── README.md                      # Project overview
├── CLAUDE.md                      # This file
└── [Additional .md files]         # Various documentation files
```

---

## Core Concepts

### Four-Corner Transformation Model

The system visualizes transformation as four quadrants:

```
┌────────────────────────────┬────────────────────────────┐
│  Future State — UI Layer   │  Current State — UI Layer  │
│  (Vision & Experience)     │  (Existing UX & Workflow)  │
├────────────────────────────┼────────────────────────────┤
│  Future State — Data & AI  │  Current State — Data & AI │
│  (Platform & Intelligence) │  (Databases & Integrations)│
└────────────────────────────┴────────────────────────────┘
```

Transformation progresses diagonally (Future UI ↔ Current Data, Current UI ↔ Future Data) and bridges across five architectural tiers:

1. **UI Tier**: User interface and experience
2. **Mid-Tier/API**: Application logic and services
3. **Data Tier**: Databases and data platforms
4. **Cloud Platform**: Infrastructure and compute
5. **AI/External**: AI services and integrations

### Dual Transformation Paths

- **AI-Free Path**: Deterministic, compliance-focused modernization without AI/ML
- **AI-Included Path**: Leverages AI for automation, prediction, and intelligence (requires data governance)

### Transformation Phases

1. **Discovery & Alignment** (Weeks 1-4): Assess current state, define future vision
2. **Foundation** (Weeks 4-8): Establish cloud baseline, data migration
3. **Modernization** (Weeks 8-16): Implement new APIs, UI components
4. **Intelligence Layer** (Weeks 16-24, AI path only): ML Ops, copilots
5. **Optimization & Governance** (Weeks 24-32): Observability, cost control

---

## Technology Stack

**Frontend** (Currently Implemented):
- React 19.1+ with TypeScript 5.9+
- Vite 7.1+ (build tool, dev server)
- Zustand 5.0+ (state management with persist middleware)
- Tailwind CSS 4.1+ (styling with @tailwindcss/postcss)
- Lucide React 0.468+ (icon library)
- OpenAI API (GPT-4o Mini for AI features)

**Data & Storage** (Currently Implemented):
- Dexie.js 4.2+ (IndexedDB wrapper)
- dexie-react-hooks (React integration)
- Zustand Persist middleware (localStorage for UI state)

**Diagrams & Visualization** (Planned):
- React Flow or D3.js (diagrams)
- Recharts or Chart.js (charts)
- html2canvas (PNG export)
- Custom SVG rendering

**Export/Import** (Currently Implemented):
- PptxGenJS 3.12+ (PowerPoint generation - working)
- html2canvas 1.4+ (PNG/canvas export)
- DOMPurify (HTML sanitization)
- jsPDF (PDF generation) - planned
- SheetJS (Excel generation) - planned

**Offline & PWA** (Planned):
- Workbox (Service Worker)
- Web App Manifest
- Cache API

**Code Quality** (Currently Implemented):
- ESLint 9.36+ with TypeScript ESLint
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh

**Testing** (Not Yet Implemented):
- Vitest (unit tests) - planned
- React Testing Library (component tests) - planned
- Playwright (end-to-end tests) - planned
- axe-core (accessibility tests) - planned

---

## Development Commands

**Working Directory**: All commands are run from the repository root (not the `/app` subdirectory).

```bash
# Development
npm run dev              # Start dev server with hot reload (Vite)
npm run build            # Build for production (TypeScript + Vite)
npm run preview          # Preview production build locally
npm run lint             # Lint code (ESLint)

# Note: Testing infrastructure not yet implemented
# Planned commands for future phases:
# npm test                 # Run unit tests (Vitest)
# npm run test:coverage    # Run tests with coverage report
# npm run test:e2e         # Run end-to-end tests (Playwright)
```

---

## Deployment

The application is configured for both **Netlify** and **Vercel** via:
- `app/netlify.toml` - Netlify configuration with SPA routing and security headers
- `app/vercel.json` - Vercel configuration with rewrites and headers

**Deployment Process**:
1. Push to `main` branch triggers automatic deployment
2. Both platforms build from the `app/` directory
3. Build command: `npm run build`
4. Output directory: `dist/`
5. SPA routing: All routes rewrite to `/index.html`

**Repository**: https://github.com/dbbuilder/digital-transformation.git

**Security Headers** (automatically applied):
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Cache-Control for assets: `public, max-age=31536000, immutable`

---

## Current Implementation State

### Completed Components

**Database Layer** (`app/src/lib/database.ts`):
- Dexie.js database schema v2 with 13 tables (projects, stakeholders, assessments, assessmentResponses, interviewQuestions, roadmaps, roadmapPhases, fourCornerData, documents, exports, syncMetadata, deliverables, workflowSteps)
- Helper functions: `initializeDatabase()`, `getProjectWithDetails()`, `calculateProjectProgress()`, `searchProjects()`, `exportAllData()`, `importData()`, `clearAllData()`
- Sample data initialization with working project for demo
- Database migrations implemented for schema evolution

**State Management** (`app/src/stores/useAppStore.ts`):
- Zustand store with localStorage persistence
- UI state: activeTab, sidebarOpen, modals (createProject, email, export)
- Project context: currentProjectId, project filters (search, status, path)
- Assessment context: selectedPhase, selectedTier
- Persisted fields: currentProjectId, sidebarOpen, activeTab

**Type Definitions** (`app/src/types/index.ts`):
- All core TypeScript interfaces and types
- Enums: TransformationPath, Phase, Tier, ProjectStatus, AssessmentStatus, Priority, RoadmapPhaseStatus, FourCornerQuadrant
- Entities: Project, Stakeholder, Assessment, AssessmentResponse, InterviewQuestion, Roadmap, RoadmapPhase, FourCornerData, Document, Export, SyncMetadata, Deliverable, WorkflowStep

**UI Components** (34+ components):
- `App.tsx`: Main application shell with mobile-optimized navigation, lazy-loaded routes
- `LandingPage.tsx`: Marketing page with DigiForm branding (always shown first)
- `ProjectsPage.tsx`, `ProjectList.tsx`, `ProjectDetail.tsx`: Full project management with mobile-responsive layouts
- `AssessmentsPage.tsx`, `AssessmentList.tsx`, `AssessmentDashboard.tsx`: 5×5 matrix and dashboard views
- `EnhancedInterviewForm.tsx`: AI-powered interview with response refinement and gap detection
- `PathRecommendation.tsx`: AI-driven transformation path analysis
- `DeliverablesView.tsx`: PowerPoint and document generation UI
- `SettingsView.tsx`: API key management and settings
- `EducationHub.tsx`: Documentation and methodology viewer
- `RoadmapTimeline.tsx`: 32-week transformation timeline
- `DevTools.tsx`: Developer utilities (clear data, test AI, etc.)
- Mobile-optimized with proper touch targets (44px) and responsive breakpoints

**AI Integration** (`app/src/services/AIService.ts`):
- OpenAI GPT-4o Mini client for intelligent features
- Assessment response analysis and refinement
- Gap detection across transformation tiers
- Path recommendation engine with readiness scoring
- Configurable via user-supplied API key (stored in IndexedDB)

**Export/Deliverables** (`app/src/services/PowerPointGenerator.ts`):
- Working PowerPoint generation with PptxGenJS
- Executive summary slide decks
- Four-corner diagram slides
- Roadmap timeline visualization
- Assessment results compilation

**CSV Import System** (`app/src/lib/csvImporter.ts`):
- Parses CSV interview templates and imports to IndexedDB
- Seeds 100+ questions across 4 phases (Discovery, Foundation, Modernization, Intelligence)
- Helper functions: `getQuestionsByPhaseTier()`, `getQuestionsByPhase()`, `searchQuestions()`
- Auto-initialized on app startup via `main.tsx`

**Sample Data** (`app/src/services/SampleDataService.ts`):
- Pre-populated demo project: "TechCorp Digital Transformation"
- Complete assessment responses across all tiers
- Stakeholder data, roadmap phases, deliverables
- Allows immediate exploration of features

**Sync System** (Partially Implemented):
- `SyncService.ts`: Supabase sync service (backend integration drafted)
- `SyncManager.tsx`: UI for sync controls (not yet wired to main app)
- Conflict resolution strategies defined
- Offline-first with eventual consistency model

### Recently Completed (2025-10-19)

- Mobile deployment fixes: responsive layouts, touch targets, proper padding
- Removed nested `min-h-screen` containers causing mobile layout issues
- Added `flex-1 sm:flex-none` pattern for mobile tab buttons
- Installed missing `lucide-react` dependency
- Verified production build succeeds (bundle size: ~420KB main chunk)
- Deployed to GitHub with automatic CI/CD to Netlify/Vercel

### In Progress

- Supabase sync UI integration (service written, UI needs wiring)
- Four-corner diagram interactive editor (basic structure exists)
- Workflow wizard for guided transformation planning
- Enhanced deliverables: SOW generation, Excel reports

---

## Key Architecture Patterns

### State Management (Zustand)

All application state lives in Zustand stores with the following slices:

- `ui`: Theme, sidebar, notifications, active project
- `projects`: Project list and current project
- `assessments`: Interview questions and responses
- `architectureStates`: Four-corner diagrams and tier states
- `roadmaps`: Timeline, tasks, milestones
- `deliverables`: Templates and generated documents

**Important**: Use Zustand's persist middleware to auto-save to IndexedDB. Debounce writes to minimize I/O.

### Data Access Layer (Dexie.js)

Database access is direct via Dexie API (no repository pattern currently):

```typescript
import { db } from './lib/database'

// Example: Query projects
const projects = await db.projects.toArray()
const activeProjects = await db.projects.where('status').equals('active').toArray()

// Example: Get project with relations
const project = await db.projects.get(projectId)
const assessments = await db.assessments.where('projectId').equals(projectId).toArray()

// Example: Transactions for multi-table operations
await db.transaction('rw', [db.projects, db.assessments], async () => {
  await db.projects.put(project)
  await db.assessments.bulkPut(assessments)
})
```

**Important**:
- Use Dexie transactions for multi-table operations to maintain consistency
- All tables are defined in `app/src/lib/database.ts` with typed interfaces
- Repository pattern is planned but not yet implemented

### Service Layer

Business logic lives in service classes (in `app/src/services/`):

- `AIService.ts`: OpenAI integration for intelligent features (IMPLEMENTED)
- `PowerPointGenerator.ts`: PptxGenJS-based presentation generation (IMPLEMENTED)
- `SampleDataService.ts`: Demo project initialization (IMPLEMENTED)
- `SyncService.ts`: Supabase sync and conflict resolution (DRAFTED)
- `ProjectService`: Project lifecycle, cloning, export/import (PLANNED)
- `AssessmentService`: Load templates, calculate readiness scores (PLANNED)
- `DiagramService`: Generate and export diagrams (PLANNED)
- `RoadmapService`: Timeline calculations, critical path detection (PLANNED)

**Important**:
- Services should NOT directly access stores—pass data as parameters
- Services should be pure functions that operate on data passed in
- Use Dexie directly for database operations (no repository abstraction layer yet)

### Component Hierarchy

Use **Container/Presenter** pattern:

- **Container components**: Connect to Zustand stores, handle side effects
- **Presenter components**: Pure, receive props, emit events

Use **compound components** for complex UI (e.g., `InterviewForm` composed of `QuestionList`, `ResponseCapture`, `EvidenceUploader`).

Create **custom hooks** for reusable logic:
- `useProject(projectId)`: Load and manage project state
- `useAssessment(assessmentId)`: Load and manage assessment
- `useOnlineStatus()`: Detect online/offline state

---

## Code Style and Best Practices

### TypeScript

- **Strict mode**: Enable all strict TypeScript checks
- **Explicit types**: Avoid `any`; use `unknown` if type is truly unknown
- **Interfaces over types**: Prefer `interface` for object shapes, `type` for unions/intersections
- **Enums for constants**: Use string enums for fixed sets (e.g., `Phase`, `Tier`)

### React Components

- **Functional components**: Use function components with hooks (no class components)
- **Named exports**: Prefer named exports over default exports for better refactoring
- **Props interfaces**: Always define explicit props interfaces
- **Memoization**: Use `useMemo` for expensive calculations, `memo()` for expensive components
- **Code splitting**: Lazy load route-level components with `React.lazy()`

### State Updates

- **Immutability**: Never mutate state directly; use Zustand's `set` with new objects
- **Batch updates**: Combine multiple related state changes in a single `set` call
- **Derived state**: Use selectors for computed values (avoid storing derived data)

### Data Validation

- **Input validation**: Use Zod schemas for all user inputs and imported data
- **Sanitization**: Use DOMPurify for any HTML content
- **File uploads**: Validate MIME types and file sizes before accepting uploads

### Error Handling

- **User-facing errors**: Show friendly error messages via notifications/toasts
- **Console logging**: Log detailed errors to console for debugging
- **Error boundaries**: Wrap major sections in React error boundaries
- **Offline handling**: Gracefully handle offline scenarios with clear messaging

### Performance

- **Virtual scrolling**: Use virtual lists for long lists (react-window or react-virtuoso)
- **Debounce inputs**: Debounce search inputs and auto-save operations
- **Lazy loading**: Load interview templates and content on demand
- **Code splitting**: Split by route and lazy-load heavy components

### Accessibility

- **Semantic HTML**: Use proper HTML elements (button, nav, main, article)
- **ARIA attributes**: Add ARIA labels where semantic HTML isn't sufficient
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
- **Focus management**: Manage focus when opening modals, navigating, etc.
- **Color contrast**: Maintain WCAG 2.1 AA contrast ratios (4.5:1 for text)

---

## Testing Guidelines

### Unit Tests

- **Service layer**: Test all service methods with mocked repositories
- **Utilities**: Test all utility functions with edge cases
- **State logic**: Test Zustand store actions and selectors
- **Target coverage**: 80%+ code coverage

### Component Tests

- **User interactions**: Test button clicks, form submissions, navigation
- **Conditional rendering**: Test all UI states (loading, error, empty, success)
- **Accessibility**: Use `jest-axe` to catch a11y issues

### Integration Tests

- **Data flow**: Test complete workflows (e.g., create project → add assessment → export)
- **Export/import**: Test round-trip export and import of projects
- **Offline mode**: Test that features work without network

### E2E Tests

- **Critical paths**: Test complete user journeys (discovery → roadmap → deliverables)
- **Cross-browser**: Test on Chrome, Firefox, Safari, Edge
- **Offline scenarios**: Test offline mode with Playwright

---

## Common Tasks and Patterns

### Creating a New Module

1. Create component structure in `src/components/[ModuleName]/`
2. Define TypeScript interfaces in `src/models/[moduleName].ts`
3. Create service in `src/services/[ModuleName]Service.ts`
4. Add Zustand slice in `src/stores/[moduleName]Slice.ts`
5. Create repository in `src/db/repositories/[ModuleName]Repository.ts`
6. Add routes in `src/App.tsx`
7. Write tests in `tests/unit/[moduleName]/`

### Adding a New Deliverable Template

1. Define template structure in `src/models/deliverable.ts`
2. Create generator function in `src/services/DeliverableService.ts`
3. Add template to database seed data
4. Implement export logic (PPTX/PDF/Excel/Markdown)
5. Add template preview in UI
6. Test export with sample project data

### Extending the Assessment System

1. Add new CSV template to `data/` directory
2. Create parser in `src/services/AssessmentService.ts`
3. Update `Question` interface if adding new fields
4. Update assessment form UI to handle new question types
5. Update readiness scoring if new criteria added
6. Add tests for new question types

### Implementing a New Diagram Type

1. Define diagram data model in `src/models/diagram.ts`
2. Create diagram builder in `src/services/DiagramService.ts`
3. Implement React component in `src/components/Diagrams/`
4. Add export functionality (SVG, PNG, draw.io)
5. Test rendering with various data shapes
6. Ensure accessibility (SVG roles, ARIA labels)

---

## Data Import/Export Patterns

### Importing CSV Interview Templates

```typescript
// Use Papa Parse or similar
import Papa from 'papaparse'

async function importInterviewTemplate(file: File): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<InterviewRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const questions = results.data.map(row => ({
          id: crypto.randomUUID(),
          phase: row.Phase as Phase,
          track: row.Track as 'BUSINESS' | 'TECHNICAL',
          tier: row.Tier as Tier,
          text: row.Question,
          notes: row['Notes / Evidence'],
          priority: row['Priority (H/M/L)'] as Priority,
          aiReadinessFlag: row['AI Readiness / Applicability']
        }))
        resolve(questions)
      },
      error: reject
    })
  })
}
```

### Exporting Project to JSON

```typescript
async function exportProject(projectId: string): Promise<Blob> {
  const project = await projectRepo.getById(projectId)
  const assessments = await assessmentRepo.getByProjectId(projectId)
  const responses = await responseRepo.getByProjectId(projectId)
  const architectureState = await archStateRepo.getByProjectId(projectId)
  const roadmap = await roadmapRepo.getByProjectId(projectId)
  const deliverables = await deliverableRepo.getByProjectId(projectId)

  const exportData: ProjectExport = {
    version: '1.0.0',
    exportedAt: new Date(),
    project,
    assessments,
    responses,
    architectureState,
    roadmap,
    deliverables
  }

  const json = JSON.stringify(exportData, null, 2)
  return new Blob([json], { type: 'application/json' })
}
```

### Generating PowerPoint Deliverable

```typescript
import PptxGenJS from 'pptxgenjs'

async function generateExecutiveDeck(projectId: string): Promise<Blob> {
  const pptx = new PptxGenJS()
  const project = await projectRepo.getById(projectId)

  // Title slide
  const titleSlide = pptx.addSlide()
  titleSlide.addText(project.name, {
    x: 1, y: 2, w: 8, h: 1,
    fontSize: 32, bold: true, color: '0066CC'
  })

  // Four-corner diagram slide
  const diagramSlide = pptx.addSlide()
  const archState = await archStateRepo.getByProjectId(projectId)
  // ... add diagram elements ...

  // Roadmap timeline slide
  const roadmapSlide = pptx.addSlide()
  const roadmap = await roadmapRepo.getByProjectId(projectId)
  // ... add timeline ...

  const blob = await pptx.write({ outputType: 'blob' })
  return blob as Blob
}
```

---

## Offline Functionality

### Service Worker Registration

```typescript
// src/registerServiceWorker.ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('Service Worker registration failed', err))
  })
}
```

### Detecting Online/Offline Status

```typescript
// Custom hook
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Usage in component
function Header() {
  const isOnline = useOnlineStatus()

  return (
    <header>
      {!isOnline && (
        <div className="offline-banner">
          You are offline. Changes will be saved locally.
        </div>
      )}
    </header>
  )
}
```

---

## Important Constraints

### Privacy and Security

- **No external data transmission**: All data stays in the browser by default
- **No telemetry**: Do not add analytics or tracking
- **No third-party CDNs**: Bundle all dependencies (no CDN links)
- **Optional encryption**: If adding project encryption, make it opt-in

### Browser Compatibility

- **Target browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Polyfills**: Only if absolutely necessary (keep bundle small)
- **Feature detection**: Always check for feature support before using (IndexedDB, Service Worker)

### Mobile Optimization (Critical)

The application MUST be fully functional on mobile devices. Follow these patterns:

**Layout Patterns**:
- Use `flex-col sm:flex-row` for stacked-on-mobile, side-by-side-on-desktop layouts
- Use `w-full sm:w-auto` for buttons that should be full-width on mobile
- Use `flex-1 sm:flex-none` for equal-width mobile tabs
- Use `text-sm sm:text-base` or `text-xl sm:text-2xl` for responsive text sizing
- Use `p-4 sm:p-6` for responsive padding (cards, containers)
- Use `flex-wrap` for badge/chip containers that need to wrap on mobile
- Use `break-words` for long text that might overflow (project names, descriptions)

**Touch Targets**:
- All buttons MUST have `min-height: 44px` (iOS/Android HIG minimum)
- All input fields MUST have `min-height: 44px`
- Use the `.btn-primary` and `.btn-secondary` classes which include proper touch targets
- Tab buttons should use `flex-1 sm:flex-none` for easier mobile tapping

**Component Wrappers**:
- AVOID nested `min-h-screen` containers - use only once at app level in App.tsx
- Child components should NOT include their own `min-h-screen` or wrapper divs with padding
- The App.tsx `<main>` already provides proper padding (`px-4 sm:px-6 lg:px-8`)

**Mobile-Specific CSS** (in `index.css`):
- `-webkit-text-size-adjust: 100%` prevents iOS text scaling
- `-webkit-overflow-scrolling: touch` enables momentum scrolling
- `-webkit-tap-highlight-color: transparent` removes tap highlight
- `overflow-x: hidden` and `max-width: 100vw` prevents horizontal scroll

**Testing Mobile**:
- Always test with Chrome DevTools mobile emulation (iPhone, Pixel, iPad)
- Verify touch targets are easily tappable (44x44px minimum)
- Ensure no horizontal scrolling occurs
- Check that modals and overlays work on small screens

### Performance Targets

- **Initial load**: < 2 seconds on 3G connection
- **Interaction response**: < 200ms for UI interactions
- **Bundle size**: < 500KB gzipped for initial load (currently ~420KB main chunk)
- **Lighthouse score**: 90+ for Performance, Accessibility, Best Practices, SEO
- **Code splitting**: Use lazy loading for route-level components (already implemented)

---

## Documentation Requirements

### Code Documentation

- **TSDoc comments**: Add JSDoc/TSDoc for all public APIs
- **Interface documentation**: Document all interface properties
- **Complex logic**: Add inline comments explaining "why" not "what"

### Component Documentation

- **Props documentation**: Document all props with types and descriptions
- **Usage examples**: Include example usage in component comments
- **Accessibility notes**: Document ARIA usage and keyboard interactions

---

## Working with Existing Templates

### Interview Templates (CSV files in `data/`)

These are the source templates for assessment questions. When modifying:

1. Maintain CSV structure (Phase, Track, Tier, Question, Notes, Priority, AI Readiness)
2. Ensure all tiers are covered (UI, API, Data, Cloud, AI/External)
3. Maintain both Business and Technical tracks
4. Keep questions clear and actionable

### Excel Templates (in `data/`)

These are reference templates for deliverables:

- `Decision_Framework.xlsx`: Path selection scoring
- `Implementation_Roadmap.xlsx`: Timeline planning
- `Execution_Checklist.xlsx`: Task tracking
- `Governance_Reporting_Templates.xlsx`: Reporting formats

When implementing generators, replicate the structure and formatting of these templates.

### Playbooks and Documentation (in `docs/`)

Use these as the knowledge base for educational content:

- `planning.md`: Four-corner framework details
- `ServiceVision_DualPath_Transformation_Playbook.md`: Methodology overview
- `Consultant_Notes_Addendum.md`: Technical implementation standards
- `Change_Management_Plan.md`: Communication framework

---

## Getting Help

### Key Reference Documents

- **Requirements**: See `REQUIREMENTS.md` for all functional/non-functional requirements
- **Implementation Plan**: See `TODO.md` for phased development plan
- **Architecture**: See `ARCHITECTURE.md` for technical design and patterns
- **Future Roadmap**: See `FUTURE.md` for planned enhancements

### Decision-Making

When making architectural or design decisions:

1. Check `ARCHITECTURE.md` for existing patterns
2. Prioritize offline-first and privacy
3. Consider accessibility from the start
4. Keep bundle size minimal
5. Document decisions in code comments or update `ARCHITECTURE.md`

---

## Summary

This is an **offline-first, privacy-focused digital transformation planning tool** built with React, TypeScript, and IndexedDB. The system supports dual transformation paths (AI-included and AI-free) using a four-corner methodology spanning five architectural tiers.

**Key priorities**:
1. Offline functionality (no backend required)
2. Privacy preservation (no external data transmission)
3. Accessibility (WCAG 2.1 AA)
4. Performance (fast load, smooth interactions)
5. Maintainability (clean architecture, comprehensive tests)

When developing features:
- Follow the phased plan in `TODO.md`
- Adhere to patterns in `ARCHITECTURE.md`
- Meet requirements in `REQUIREMENTS.md`
- Write tests for all new code
- Ensure accessibility compliance
- Keep the bundle size minimal

---

---

## Critical Implementation Notes

### Database Initialization

The database auto-initializes with sample data on first run. The initialization happens in `app/src/lib/database.ts` via `initializeDatabase()`. To trigger it, import and call it from `main.tsx` or `App.tsx`:

```typescript
import { initializeDatabase } from './lib/database'

// In main.tsx or App.tsx
initializeDatabase()
```

### Zustand Store Persistence

The app store uses Zustand's `persist` middleware to save state to localStorage. Only specific fields are persisted (see `partialize` config in `useAppStore.ts`). This prevents storing transient UI state like modal open/close states.

### Tailwind CSS Version

The project uses **Tailwind CSS v4** (postcss-based), not v3. Configuration is in `tailwind.config.js` and uses the new `@tailwindcss/postcss` plugin. Custom colors are defined directly in the config:
- Primary palette: Pastel Lilac (#E6D5F2, #D4B8E8, etc.)
- Neutral palette: Black to White scale

### Component Organization

Components are organized by **feature**, not by type:
- `components/projects/` - All project-related components
- `components/assessments/` - All assessment-related components
- `components/four-corner/` - All four-corner diagram components
- `components/roadmap/` - All roadmap-related components

This follows domain-driven design principles for better cohesion.

### TypeScript Configuration

The project uses **three TypeScript config files**:
- `tsconfig.json` - Root config (references app and node configs)
- `tsconfig.app.json` - App source code configuration
- `tsconfig.node.json` - Build tool configuration (Vite)

When adding new files, ensure they're covered by the appropriate config.

---

**Last Updated**: 2025-10-17
**For Questions**: See project documentation or create an issue
