# Plan

> Last updated: 2026-03-27
> Status: Phase 1-2 complete, TechFreedom integration complete

## Objective

Build Stackmap — a lightweight, open source architecture mapping tool for social purpose organisations. Guided wizard with two entry points (function-first or service-first), local SQLite storage, GitHub storage option, Mermaid diagram views. Optional TechFreedom risk assessment integration.

## Approach

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- TDD throughout (/tdd skill)
- /impeccable for all UI/design work
- Accessibility (WCAG 2.1 AA) checked on every component
- Build in phases, Phase 1 first: foundation + function-first wizard basics

## Phase 1: Foundation

- [x] Set up Next.js project with TypeScript, Tailwind, Vitest, Playwright
- [x] Implement core types and Zod schemas (TDD)
- [x] Build standard functions data and helpers (TDD)
- [x] Build localStorage storage adapter (TDD)
- [x] Create base UI components (accessible, /impeccable design)
- [x] Build wizard shell with stepper and path selector
- [x] Implement function-first Step 1: Function picker
- [x] Implement function-first Step 2: Systems per function
- [x] Basic save/load with localStorage + auto-save

## Phase 2: Complete Wizard

- [ ] Service-first path (all steps)
- [x] Function-first remaining steps (services optional, data, integrations, owners)
- [x] Review summary step
- [x] Mermaid diagram generation (TDD)
- [x] Basic diagram view
- [x] JSON export

## Phase 2.5: TechFreedom Integration

- [x] Core types and risk calculation helpers (TDD)
- [x] Known tools database (~27 tools with pre-scored risk)
- [x] TechFreedom API fetch with embedded fallback
- [x] Fuzzy matching of system names to known tools
- [x] RiskBadge, RiskDetails, RadarChart components (TDD + a11y)
- [x] Inline risk scoring in wizard systems step
- [x] Risk summary in wizard review step
- [x] TechFreedom analysis view (heatmap table + radar chart)
- [x] Two-tier feature toggle (app-level + org-level)
- [x] Navigation integration

## Phase 3: GitHub Storage

- [ ] GitHub OAuth flow
- [ ] GitHub storage adapter (TDD)
- [ ] Repository selection/creation UI
- [ ] Commit on save, version history

## Phase 4: Views & Polish

- [ ] Table view with inline editing
- [ ] Function view, Service view
- [ ] CSV import with column mapping
- [ ] Markdown + image export
- [ ] Mobile responsiveness
- [ ] Performance optimisation

## Phase 5: Examples & Documentation

- [ ] Example architectures for different org types
- [ ] User guide + contributor guide
- [ ] GitHub Pages demo
- [ ] Security review + accessibility audit

## Design Quality Passes

- [x] /impeccable audit — identified 24 issues
- [x] /harden — skip link, contrast fixes, stepper touch targets, wizard forms use UI library, toast SVG icons, double-submit prevention, text overflow
- [x] /bolder — warm forest green palette, Figtree font, asymmetric landing page, colour-coded functions, celebratory review

## Decisions Made

| Decision | Rationale | Date |
|----------|-----------|------|
| Build from spec as-is | Spec is comprehensive and well-defined | 2026-03-27 |
| Remove setup.sh | Not needed for this build | 2026-03-27 |
| /impeccable + /tdd + a11y always | User requirement for quality standards | 2026-03-27 |
| localStorage over SQLite | Simpler for MVP, avoids WASM complexity | 2026-03-27 |
| TechFreedom Approach C | Pre-scored DB + inline override — least effort for non-technical users | 2026-03-27 |
| API + embedded fallback | Resilient data fetching, works offline | 2026-03-27 |
| Two-tier feature toggle | Admin controls availability, users can opt out per architecture | 2026-03-27 |

## Out of Scope (for now)

- LLM assistance for system identification
- Multi-org aggregation
- Hosted version
- Sector presets (one universal flow first)

## Stats

- 335 tests passing (30 test files)
- 14 routes
- 8 base UI components
- 3 TechFreedom components
- 27 known tools in risk database
