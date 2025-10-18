# Contributing to Digital Transformation Planner

First off, thank you for considering contributing to Digital Transformation Planner! It's people like you that make this tool better for consultants worldwide.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (browser, OS, version)

**Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - Browser: [e.g., Chrome 120]
 - OS: [e.g., Windows 11]
 - Version: [e.g., v1.0.0]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **Include mockups or examples** if applicable

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Simpler issues perfect for beginners
- `help wanted` - Issues where we need community help
- `documentation` - Documentation improvements

---

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Git
- Modern browser

### Setup Steps

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/digital-transformation.git
cd digital-transformation

# 3. Add upstream remote
git remote add upstream https://github.com/dbbuilder/digital-transformation.git

# 4. Install dependencies
cd app
npm install

# 5. Start development server
npm run dev
```

### Staying Up to Date

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your local main
git checkout main
git merge upstream/main
```

---

## Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Build process or tooling changes

### 2. Make Your Changes

- Write code following our [coding standards](#coding-standards)
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add stakeholder export feature"
git commit -m "fix: resolve assessment save issue"
git commit -m "docs: update installation instructions"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Build process or auxiliary tool changes

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

- Go to the repository on GitHub
- Click "New Pull Request"
- Select your branch
- Fill out the PR template
- Submit!

### PR Requirements

- ✅ All tests pass
- ✅ Code follows style guidelines
- ✅ Documentation updated
- ✅ No merge conflicts
- ✅ PR template completed

---

## Coding Standards

### TypeScript

- **Strict mode enabled** - No `any` types without good reason
- **Explicit return types** for functions
- **Interface over type** for object shapes
- **Named exports** preferred over default exports

**Example:**

```typescript
// ✅ Good
export interface Project {
  id: string
  name: string
  createdAt: Date
}

export function createProject(name: string): Project {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date()
  }
}

// ❌ Bad
export default function createProject(name): any {
  return { id: Math.random(), name }
}
```

### React Components

- **Functional components** with hooks
- **Props interfaces** explicitly defined
- **Memo for expensive components**
- **Custom hooks** for reusable logic

**Example:**

```typescript
interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const handleEdit = () => onEdit(project)
  const handleDelete = () => onDelete(project.id)

  return (
    <div className="project-card">
      <h3>{project.name}</h3>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  )
}
```

### Styling

- **Tailwind CSS** utility classes preferred
- **Consistent spacing** using Tailwind scale
- **Responsive design** - mobile-first approach
- **Dark mode support** where applicable

### File Organization

```
src/
├── components/
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectList.tsx
│   │   └── __tests__/
│   │       └── ProjectCard.test.tsx
│   └── shared/
│       ├── Button.tsx
│       └── Input.tsx
├── services/
│   └── ProjectService.ts
├── stores/
│   └── projectStore.ts
├── types/
│   └── project.ts
└── utils/
    └── validation.ts
```

---

## Testing Guidelines

### Unit Tests

- **Test business logic** in services
- **Test utility functions** with edge cases
- **80%+ code coverage** target

```typescript
import { describe, it, expect } from 'vitest'
import { createProject } from './ProjectService'

describe('ProjectService', () => {
  describe('createProject', () => {
    it('should create project with valid name', () => {
      const project = createProject('Test Project')

      expect(project.name).toBe('Test Project')
      expect(project.id).toBeDefined()
      expect(project.createdAt).toBeInstanceOf(Date)
    })

    it('should throw error for empty name', () => {
      expect(() => createProject('')).toThrow('Name is required')
    })
  })
})
```

### Component Tests

- **Test user interactions**
- **Test conditional rendering**
- **Test accessibility**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectCard } from './ProjectCard'

describe('ProjectCard', () => {
  it('should call onEdit when edit button clicked', () => {
    const onEdit = vi.fn()
    const project = { id: '1', name: 'Test', createdAt: new Date() }

    render(<ProjectCard project={project} onEdit={onEdit} onDelete={vi.fn()} />)

    fireEvent.click(screen.getByText('Edit'))

    expect(onEdit).toHaveBeenCalledWith(project)
  })
})
```

### E2E Tests

- **Test critical user flows**
- **Test across browsers**
- **Test offline scenarios**

```typescript
import { test, expect } from '@playwright/test'

test('create new project', async ({ page }) => {
  await page.goto('/')

  await page.click('text=New Project')
  await page.fill('input[name=name]', 'My Test Project')
  await page.selectOption('select[name=path]', 'AI_INCLUDED')
  await page.click('text=Create')

  await expect(page.locator('text=My Test Project')).toBeVisible()
})
```

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E in UI mode
npm run test:e2e -- --ui
```

---

## Documentation

### Code Comments

- **Use JSDoc/TSDoc** for public APIs
- **Explain "why" not "what"**
- **Update comments** when code changes

```typescript
/**
 * Creates a new project with the given configuration.
 *
 * @param config - Project configuration including name and transformation path
 * @returns Newly created project with generated ID
 * @throws {ValidationError} If config is invalid
 *
 * @example
 * ```typescript
 * const project = createProject({
 *   name: 'My Project',
 *   path: 'AI_INCLUDED'
 * })
 * ```
 */
export function createProject(config: ProjectConfig): Project {
  // Implementation
}
```

### README Updates

- Update README when adding new features
- Include screenshots for UI changes
- Update installation steps if dependencies change

### CHANGELOG

- Document all notable changes
- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Update before releasing new version

---

## Questions?

Feel free to:
- Open a [Discussion](https://github.com/dbbuilder/digital-transformation/discussions)
- Join our [Discord](https://discord.gg/digital-transformation) *(coming soon)*
- Email us at contribute@dbbuilder.dev

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- CHANGELOG.md for their contributions
- GitHub contributors page

Thank you for contributing! 🎉
