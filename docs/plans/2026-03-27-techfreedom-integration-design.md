# TechFreedom Integration Design

> Date: 2026-03-27
> Status: Approved

## Overview

Integrate TechFreedom risk assessment into Stackmap as an optional feature. When enabled, systems added during the wizard are automatically scored against five risk dimensions using a pre-scored known tools database (fetched from the TechFreedom API with embedded fallback). A dedicated TechFreedom view visualises aggregate risk.

## Approach

**Approach C: Hybrid — pre-scored database + inline override**

- Ship a database of ~27 common tools with pre-scored TechFreedom ratings
- When users add a system, auto-populate risk scores from the database via fuzzy name matching
- Users can override any score manually
- Unknown/custom tools can be manually assessed
- A dedicated TechFreedom view shows heatmap table, radar chart, and summary

## Feature Toggle

Two-tier toggle:

1. **App-level** (`stackmap_config` in localStorage): `techFreedomAvailable: boolean` — admin controls whether the feature is available at all. Default: `true`.
2. **Organisation-level** (`architecture.metadata.techFreedomEnabled: boolean`): when the feature is available, users can disable it per architecture.

The app-level toggle can be set to `false` in deployed environments to hide the feature entirely. When it's `true`, users see the option and can opt out.

## Data Model

### New types

```typescript
interface TechFreedomScore {
  jurisdiction: number;      // 1-5
  continuity: number;        // 1-5
  surveillance: number;      // 1-5
  lockIn: number;            // 1-5
  costExposure: number;      // 1-5
  isAutoScored: boolean;     // true if from database
  overrides?: string[];      // which dimensions the user manually changed
}

interface KnownTool {
  slug: string;
  name: string;
  provider: string;
  category: string;
  score: TechFreedomScore;
  keyRisks: string;
}

interface AppConfig {
  techFreedomAvailable: boolean;
}
```

### Modified types

```typescript
// System gains optional risk score
interface System {
  // ... existing fields ...
  techFreedomScore?: TechFreedomScore;
}

// Architecture metadata gains toggle
interface ArchitectureMetadata {
  // ... existing fields ...
  techFreedomEnabled: boolean;
}
```

### Risk bands

- 1-10: Low
- 11-14: Moderate
- 15-17: High
- 18-25: Critical

## Known Tools Database

### Embedded fallback — `src/lib/techfreedom/tools.ts`

Static array of ~27 tools from TechFreedom with pre-scored risk dimensions.

### API fetch — `src/lib/techfreedom/api.ts`

- Fetches from `api.techfreedom.eu` PocketBase endpoint
- 5-second timeout
- Falls back to embedded data on failure
- Caches in localStorage with 24-hour TTL

### Fuzzy matching — `src/lib/techfreedom/match.ts`

- Case-insensitive substring match on tool name
- Check against provider field
- Returns null if no confident match

### Risk helpers — `src/lib/techfreedom/risk.ts`

- `totalScore(score)` — sum of 5 dimensions
- `riskLevel(total)` — low/moderate/high/critical
- `worstDimension(score)` — highest-scoring dimension
- `aggregateRisk(systems)` — across all scored systems

## Integration Points

### Wizard: Systems step

When TechFreedom is enabled:
- Fuzzy-match system name against known tools database
- If matched: auto-fill score, show risk badge ("Risk: 19/25 — High")
- Expandable "Risk details" disclosure to see/override individual dimensions
- For unknown tools: optional "Assess this tool's risk" to manually score

### Wizard: Review step

When enabled:
- Extra section with risk summary: aggregate score, highest-risk tools, worst dimension
- Risk badges on each system

### TechFreedom View — `/view/techfreedom`

- Heatmap table: systems x 5 dimensions, colour-coded cells, sortable, expandable rows
- SVG radar chart: aggregate risk profile (no Chart.js dependency)
- Summary panel: overall risk category, worst dimension, most critical tool, count by category
- Systems without scores shown as "Not assessed"

### Settings

- Toggle checkbox: "Include TechFreedom risk assessment"
- Brief explainer text
- Only visible when `techFreedomAvailable` is true at app level

## New Files

```
src/lib/techfreedom/
  types.ts          — TechFreedomScore, KnownTool, AppConfig interfaces
  tools.ts          — Embedded known tools database (~27 tools)
  api.ts            — Fetch from TechFreedom API with fallback
  match.ts          — Fuzzy matching system names to known tools
  risk.ts           — Score calculation and risk level helpers
  index.ts          — Barrel exports

src/components/techfreedom/
  risk-badge.tsx    — Compact pill showing score and risk level
  risk-details.tsx  — Expandable 5-dimension score display with overrides
  radar-chart.tsx   — Pure SVG radar chart for aggregate risk

src/components/views/
  techfreedom-view.tsx  — Full TechFreedom analysis view

src/app/view/techfreedom/
  page.tsx          — TechFreedom view page

src/hooks/
  useAppConfig.ts   — Hook for app-level config (techFreedomAvailable)
```

## Modified Files

- `src/lib/types.ts` — Add TechFreedomScore to System, techFreedomEnabled to metadata
- `src/components/wizard/function-systems.tsx` — Add risk matching and badge inline
- `src/components/wizard/review-summary.tsx` — Add risk summary section
- `src/components/layout/header.tsx` — Add TechFreedom view link when enabled
- `src/hooks/useArchitecture.ts` — Handle techFreedomEnabled in blank architecture

## Testing

- TDD for all `src/lib/techfreedom/` functions
- Axe accessibility checks on all new components
- Radar chart: accessible via `role="img"` + `aria-label`
- Heatmap: proper table semantics with `<th scope>`
- Feature toggle: test that components hide/show correctly
