# Stackmap

Lightweight architecture mapping for social purpose organisations.

## Quick Reference

- **Stack**: Next.js 14 (App Router), TypeScript, Tailwind, Vitest, Playwright
- **Storage**: SQLite (browser) or GitHub (commits)
- **Diagrams**: Mermaid.js

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run unit + component tests
npm run test:e2e     # Run Playwright tests
npm run lint         # ESLint + Prettier
npm run typecheck    # TypeScript check
```

## Architecture

```
src/
├── app/          # Next.js routes
├── components/   # React components
├── lib/          # Core logic (types, storage, diagram generation)
├── hooks/        # React hooks
└── styles/       # Global styles
```

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types — use `unknown` and narrow
- Prefer interfaces over types for object shapes
- Export types from the file that defines them

### React
- Functional components only
- Custom hooks for shared logic
- Props interfaces named `{Component}Props`
- No default exports for components (named exports only)

### Testing
- TDD workflow: red → green → refactor
- Every component test includes accessibility check (axe-core)
- E2E tests for critical user journeys
- Aim for 80%+ coverage on lib/, 60%+ on components/

### Accessibility
- WCAG 2.1 AA minimum
- Test with keyboard before committing
- Include axe-core check in every component test
- Use semantic HTML elements
- Visible focus indicators
- No information conveyed by colour alone
- Motion respects prefers-reduced-motion

### Styling
- Tailwind utility classes
- No inline styles
- CSS variables for design tokens in globals.css
- Mobile-first responsive design

## Verification

Before marking any task complete:
1. `npm run lint` passes
2. `npm run typecheck` passes
3. `npm run test` passes
4. Manual keyboard navigation check
5. Check accessibility — no axe-core violations

## Working Rules

- Always check for existing patterns before creating new ones
- Prefer small, incremental changes over big rewrites
- If a task will take more than ~50 lines of changes, use plan mode first
- Don't add dependencies without asking
- Don't refactor code that wasn't part of the task
- Don't create files without explaining what and why
- Use /impeccable for all design/UI work
- Use /tdd for all feature development
- Always check accessibility on every component

## State & Progress

See PLAN.md for task tracking, STATE.md for system state.

## Lessons Learned

- Don't skip the failing test step — even for "obvious" code
- Always check keyboard navigation after adding interactive elements
- Mermaid syntax is sensitive to special characters — sanitise node labels
