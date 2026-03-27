# TechFreedom Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add optional TechFreedom risk assessment to Stackmap — auto-scoring systems against 5 risk dimensions (jurisdiction, continuity, surveillance, lock-in, cost exposure) using a known tools database, with a dedicated TechFreedom analysis view.

**Architecture:** Feature-flagged at two levels: app-config in localStorage controls availability, architecture metadata controls per-map opt-out. Known tools fetched from TechFreedom API with embedded JSON fallback. Risk scores stored on each System. New view page renders heatmap table + SVG radar chart.

**Tech Stack:** TypeScript, React, Next.js 14, Tailwind CSS v3, Vitest, Zod v4

---

## Task 1: TechFreedom Types & Risk Helpers (TDD)

**Files:**
- Create: `src/lib/techfreedom/types.ts`
- Create: `src/lib/techfreedom/risk.ts`
- Create: `src/lib/techfreedom/index.ts`
- Test: `tests/unit/techfreedom/risk.test.ts`

**Step 1: Write failing tests**

```typescript
// tests/unit/techfreedom/risk.test.ts
import { describe, it, expect } from 'vitest';
import {
  totalScore,
  riskLevel,
  worstDimension,
  aggregateRisk,
  RISK_DIMENSIONS,
} from '@/lib/techfreedom/risk';
import type { TechFreedomScore } from '@/lib/techfreedom/types';

const highRisk: TechFreedomScore = {
  jurisdiction: 5, continuity: 3, surveillance: 5, lockIn: 4, costExposure: 3,
  isAutoScored: true,
};

const lowRisk: TechFreedomScore = {
  jurisdiction: 1, continuity: 2, surveillance: 1, lockIn: 1, costExposure: 2,
  isAutoScored: false,
};

describe('RISK_DIMENSIONS', () => {
  it('has exactly 5 dimensions', () => {
    expect(RISK_DIMENSIONS).toHaveLength(5);
  });

  it('each dimension has key, label, and description', () => {
    for (const dim of RISK_DIMENSIONS) {
      expect(dim).toHaveProperty('key');
      expect(dim).toHaveProperty('label');
      expect(dim).toHaveProperty('description');
    }
  });
});

describe('totalScore', () => {
  it('sums all 5 dimensions', () => {
    expect(totalScore(highRisk)).toBe(20);
  });

  it('returns correct sum for low risk', () => {
    expect(totalScore(lowRisk)).toBe(7);
  });
});

describe('riskLevel', () => {
  it('returns low for 1-10', () => {
    expect(riskLevel(7)).toBe('low');
    expect(riskLevel(10)).toBe('low');
  });

  it('returns moderate for 11-14', () => {
    expect(riskLevel(11)).toBe('moderate');
    expect(riskLevel(14)).toBe('moderate');
  });

  it('returns high for 15-17', () => {
    expect(riskLevel(15)).toBe('high');
    expect(riskLevel(17)).toBe('high');
  });

  it('returns critical for 18+', () => {
    expect(riskLevel(18)).toBe('critical');
    expect(riskLevel(25)).toBe('critical');
  });
});

describe('worstDimension', () => {
  it('returns the highest-scoring dimension key', () => {
    expect(worstDimension(highRisk)).toBe('jurisdiction');
  });

  it('returns first highest when tied', () => {
    const tied: TechFreedomScore = {
      jurisdiction: 3, continuity: 3, surveillance: 3, lockIn: 3, costExposure: 3,
      isAutoScored: true,
    };
    expect(worstDimension(tied)).toBe('jurisdiction');
  });
});

describe('aggregateRisk', () => {
  it('returns null when no systems have scores', () => {
    const systems = [{ id: '1', name: 'Test', type: 'other' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [] }];
    expect(aggregateRisk(systems)).toBeNull();
  });

  it('calculates averages across scored systems', () => {
    const systems = [
      { id: '1', name: 'A', type: 'other' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [], techFreedomScore: highRisk },
      { id: '2', name: 'B', type: 'other' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [], techFreedomScore: lowRisk },
    ];
    const result = aggregateRisk(systems);
    expect(result).not.toBeNull();
    expect(result!.averageTotal).toBe(13.5);
    expect(result!.systemCount).toBe(2);
    expect(result!.mostCriticalSystem).toBe('A');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/techfreedom/risk.test.ts`
Expected: FAIL — modules not found

**Step 3: Write types**

```typescript
// src/lib/techfreedom/types.ts
export interface TechFreedomScore {
  jurisdiction: number;
  continuity: number;
  surveillance: number;
  lockIn: number;
  costExposure: number;
  isAutoScored: boolean;
  overrides?: string[];
}

export type RiskDimensionKey = 'jurisdiction' | 'continuity' | 'surveillance' | 'lockIn' | 'costExposure';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RiskDimension {
  key: RiskDimensionKey;
  label: string;
  description: string;
}

export interface KnownTool {
  slug: string;
  name: string;
  provider: string;
  category: string;
  score: TechFreedomScore;
  keyRisks: string;
}

export interface AggregateRisk {
  averages: Record<RiskDimensionKey, number>;
  averageTotal: number;
  worstDimension: RiskDimensionKey;
  mostCriticalSystem: string;
  systemCount: number;
  countByLevel: Record<RiskLevel, number>;
}

export interface AppConfig {
  techFreedomAvailable: boolean;
}
```

**Step 4: Write risk helpers**

```typescript
// src/lib/techfreedom/risk.ts
import type { TechFreedomScore, RiskDimensionKey, RiskLevel, RiskDimension, AggregateRisk } from './types';
import type { System } from '@/lib/types';

export const RISK_DIMENSIONS: RiskDimension[] = [
  { key: 'jurisdiction', label: 'Jurisdiction', description: 'Where does your data live, and under whose laws?' },
  { key: 'continuity', label: 'Continuity', description: 'What happens if this platform changes or disappears?' },
  { key: 'surveillance', label: 'Surveillance', description: 'How much does this tool track about you and the people you serve?' },
  { key: 'lockIn', label: 'Lock-in', description: 'How difficult would it be to switch away?' },
  { key: 'costExposure', label: 'Cost Exposure', description: 'How exposed are you to price changes?' },
];

const DIMENSION_KEYS: RiskDimensionKey[] = ['jurisdiction', 'continuity', 'surveillance', 'lockIn', 'costExposure'];

export function totalScore(score: TechFreedomScore): number {
  return DIMENSION_KEYS.reduce((sum, key) => sum + score[key], 0);
}

export function riskLevel(total: number): RiskLevel {
  if (total <= 10) return 'low';
  if (total <= 14) return 'moderate';
  if (total <= 17) return 'high';
  return 'critical';
}

export function worstDimension(score: TechFreedomScore): RiskDimensionKey {
  let worst: RiskDimensionKey = 'jurisdiction';
  let max = 0;
  for (const key of DIMENSION_KEYS) {
    if (score[key] > max) {
      max = score[key];
      worst = key;
    }
  }
  return worst;
}

export function aggregateRisk(systems: System[]): AggregateRisk | null {
  const scored = systems.filter((s): s is System & { techFreedomScore: TechFreedomScore } =>
    s.techFreedomScore !== undefined
  );
  if (scored.length === 0) return null;

  const averages: Record<string, number> = {};
  for (const key of DIMENSION_KEYS) {
    averages[key] = scored.reduce((sum, s) => sum + s.techFreedomScore[key], 0) / scored.length;
  }

  const avgTotal = Object.values(averages).reduce((a, b) => a + b, 0);

  let mostCritical = scored[0];
  for (const s of scored) {
    if (totalScore(s.techFreedomScore) > totalScore(mostCritical.techFreedomScore)) {
      mostCritical = s;
    }
  }

  const countByLevel: Record<RiskLevel, number> = { low: 0, moderate: 0, high: 0, critical: 0 };
  for (const s of scored) {
    countByLevel[riskLevel(totalScore(s.techFreedomScore))]++;
  }

  return {
    averages: averages as Record<RiskDimensionKey, number>,
    averageTotal: avgTotal,
    worstDimension: worstDimension({ ...averages, isAutoScored: false } as TechFreedomScore),
    mostCriticalSystem: mostCritical.name,
    systemCount: scored.length,
    countByLevel,
  };
}
```

**Step 5: Create barrel export**

```typescript
// src/lib/techfreedom/index.ts
export * from './types';
export * from './risk';
```

**Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/unit/techfreedom/risk.test.ts`
Expected: ALL PASS

**Step 7: Commit**

```bash
git add src/lib/techfreedom/ tests/unit/techfreedom/
git commit -m "feat(techfreedom): add types and risk calculation helpers (TDD)"
```

---

## Task 2: Known Tools Database & Fuzzy Matching (TDD)

**Files:**
- Create: `src/lib/techfreedom/tools.ts`
- Create: `src/lib/techfreedom/match.ts`
- Create: `src/lib/techfreedom/api.ts`
- Test: `tests/unit/techfreedom/match.test.ts`

**Step 1: Write failing tests**

```typescript
// tests/unit/techfreedom/match.test.ts
import { describe, it, expect } from 'vitest';
import { findMatchingTool } from '@/lib/techfreedom/match';
import { KNOWN_TOOLS } from '@/lib/techfreedom/tools';

describe('KNOWN_TOOLS', () => {
  it('has at least 20 tools', () => {
    expect(KNOWN_TOOLS.length).toBeGreaterThanOrEqual(20);
  });

  it('each tool has required fields', () => {
    for (const tool of KNOWN_TOOLS) {
      expect(tool.slug).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.provider).toBeTruthy();
      expect(tool.score.jurisdiction).toBeGreaterThanOrEqual(1);
      expect(tool.score.jurisdiction).toBeLessThanOrEqual(5);
    }
  });
});

describe('findMatchingTool', () => {
  it('matches exact name case-insensitively', () => {
    const match = findMatchingTool('xero', KNOWN_TOOLS);
    expect(match).not.toBeNull();
    expect(match!.name).toBe('Xero');
  });

  it('matches partial name', () => {
    const match = findMatchingTool('Microsoft 365', KNOWN_TOOLS);
    expect(match).not.toBeNull();
    expect(match!.slug).toBe('microsoft-365');
  });

  it('matches by provider', () => {
    const match = findMatchingTool('Google Sheets', KNOWN_TOOLS);
    expect(match).not.toBeNull();
  });

  it('returns null for unknown tool', () => {
    expect(findMatchingTool('Totally Unknown App XYZ', KNOWN_TOOLS)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(findMatchingTool('', KNOWN_TOOLS)).toBeNull();
  });

  it('returns null for very short input', () => {
    expect(findMatchingTool('ab', KNOWN_TOOLS)).toBeNull();
  });

  it('matches common abbreviations', () => {
    const match = findMatchingTool('Salesforce', KNOWN_TOOLS);
    expect(match).not.toBeNull();
    expect(match!.slug).toBe('salesforce');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/techfreedom/match.test.ts`
Expected: FAIL

**Step 3: Write known tools database**

Create `src/lib/techfreedom/tools.ts` with ~27 tools from TechFreedom. Scores based on the TechFreedom assessment data. Include common VCSE sector tools: Microsoft 365, Google Workspace, Slack, Zoom, Salesforce, Xero, QuickBooks, Mailchimp, Eventbrite, Canva, Trello, Asana, Airtable, HubSpot, WordPress, Squarespace, Dropbox, OneDrive, Teams, LinkedIn, Meta/Facebook, Twitter/X, Instagram, WhatsApp, Signal, Jitsi Meet, Proton Mail.

**Step 4: Write fuzzy matching**

```typescript
// src/lib/techfreedom/match.ts
import type { KnownTool } from './types';

export function findMatchingTool(input: string, tools: KnownTool[]): KnownTool | null {
  const query = input.trim().toLowerCase();
  if (query.length < 3) return null;

  // Exact name match (case-insensitive)
  const exact = tools.find((t) => t.name.toLowerCase() === query);
  if (exact) return exact;

  // Name contains query or query contains name
  const nameMatch = tools.find(
    (t) => t.name.toLowerCase().includes(query) || query.includes(t.name.toLowerCase())
  );
  if (nameMatch) return nameMatch;

  // Slug match
  const slugMatch = tools.find((t) => t.slug === query.replace(/\s+/g, '-'));
  if (slugMatch) return slugMatch;

  // Provider match (only if query is long enough to be meaningful)
  if (query.length >= 5) {
    const providerMatch = tools.find((t) =>
      query.includes(t.provider.toLowerCase())
    );
    if (providerMatch) return providerMatch;
  }

  return null;
}
```

**Step 5: Write API fetch with fallback**

```typescript
// src/lib/techfreedom/api.ts
import type { KnownTool } from './types';
import { KNOWN_TOOLS } from './tools';

const CACHE_KEY = 'stackmap_techfreedom_tools';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const API_TIMEOUT = 5000;

interface CachedTools {
  tools: KnownTool[];
  fetchedAt: number;
}

export async function fetchKnownTools(): Promise<KnownTool[]> {
  // Check cache first
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedTools = JSON.parse(cached);
        if (Date.now() - parsed.fetchedAt < CACHE_TTL) {
          return parsed.tools;
        }
      }
    } catch {
      // Ignore cache errors
    }
  }

  // Try API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
    const response = await fetch(
      'https://api.techfreedom.eu/api/collections/tools/records?perPage=100',
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`API returned ${response.status}`);

    const data = await response.json();
    const tools: KnownTool[] = data.items.map((item: Record<string, unknown>) => ({
      slug: item.slug as string,
      name: item.name as string,
      provider: item.provider as string,
      category: item.category as string,
      score: {
        jurisdiction: item.jurisdiction as number,
        continuity: item.continuity as number,
        surveillance: item.surveillance as number,
        lockIn: item.lockIn as number,
        costExposure: item.costExposure as number,
        isAutoScored: true,
      },
      keyRisks: item.keyRisks as string ?? '',
    }));

    // Cache the result
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ tools, fetchedAt: Date.now() }));
      } catch {
        // Ignore storage errors
      }
    }

    return tools;
  } catch {
    // Fallback to embedded data
    return KNOWN_TOOLS;
  }
}
```

**Step 6: Update barrel export**

Add to `src/lib/techfreedom/index.ts`:
```typescript
export { KNOWN_TOOLS } from './tools';
export { findMatchingTool } from './match';
export { fetchKnownTools } from './api';
```

**Step 7: Run tests**

Run: `npx vitest run tests/unit/techfreedom/`
Expected: ALL PASS

**Step 8: Commit**

```bash
git add src/lib/techfreedom/ tests/unit/techfreedom/
git commit -m "feat(techfreedom): add known tools database, fuzzy matching, and API fetch"
```

---

## Task 3: Update Core Types & Schema

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/schema.ts`
- Modify: `src/hooks/useArchitecture.ts`
- Test: `tests/unit/types.test.ts` (add cases)

**Step 1: Add TechFreedomScore to System type**

In `src/lib/types.ts`, import from techfreedom and add to System:

```typescript
import type { TechFreedomScore } from '@/lib/techfreedom/types';

// Add to System interface (after cost?):
techFreedomScore?: TechFreedomScore;

// Add to metadata in Architecture interface:
techFreedomEnabled: boolean;
```

**Step 2: Update Zod schema**

In `src/lib/schema.ts`, add TechFreedomScore schema and update SystemSchema and ArchitectureSchema.

**Step 3: Update useArchitecture hook**

In `src/hooks/useArchitecture.ts`, update `createBlankArchitecture` to include `techFreedomEnabled: false` in metadata.

**Step 4: Add AppConfig hook**

Create `src/hooks/useAppConfig.ts`:

```typescript
'use client';
import { useState, useEffect, useCallback } from 'react';
import type { AppConfig } from '@/lib/techfreedom/types';

const CONFIG_KEY = 'stackmap_config';
const DEFAULT_CONFIG: AppConfig = { techFreedomAvailable: true };

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) setConfig(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const updateConfig = useCallback((updates: Partial<AppConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return { config, updateConfig };
}
```

**Step 5: Update existing tests**

Ensure existing tests still pass — the new fields are optional so they should. Add a test case for techFreedomEnabled in metadata.

**Step 6: Run full test suite**

Run: `npx vitest run`
Expected: ALL PASS

**Step 7: Commit**

```bash
git add src/lib/types.ts src/lib/schema.ts src/hooks/useArchitecture.ts src/hooks/useAppConfig.ts tests/
git commit -m "feat(techfreedom): add TechFreedomScore to System type and app config hook"
```

---

## Task 4: TechFreedom UI Components (TDD)

**Files:**
- Create: `src/components/techfreedom/risk-badge.tsx`
- Create: `src/components/techfreedom/risk-details.tsx`
- Create: `src/components/techfreedom/radar-chart.tsx`
- Test: `tests/components/techfreedom/risk-badge.test.tsx`
- Test: `tests/components/techfreedom/risk-details.test.tsx`
- Test: `tests/components/techfreedom/radar-chart.test.tsx`

**Step 1: Write failing tests for RiskBadge**

Test renders score and risk level text, correct colour per level, has no axe violations.

**Step 2: Implement RiskBadge**

Compact pill component: `<span>` with colour classes based on risk level (green for low, amber for moderate, orange for high, red for critical). Shows "14/25 Moderate". Uses `aria-label` for screen readers.

**Step 3: Write failing tests for RiskDetails**

Test renders 5 dimensions with scores, shows "Auto-scored" label when isAutoScored is true, calls onChange when user overrides a score, has no axe violations.

**Step 4: Implement RiskDetails**

`<details>/<summary>` pattern. Grid of 5 dimensions, each with label, score as `<select>` (1-5), colour-coded background. Shows "Auto-scored from TechFreedom database" or "Manually assessed".

**Step 5: Write failing tests for RadarChart**

Test renders SVG element, has role="img" and aria-label, renders 5 axis labels, has no axe violations.

**Step 6: Implement RadarChart**

Pure SVG pentagon radar chart. 5 axes at 72-degree intervals. Filled polygon for the scores. Axis labels positioned outside. `role="img"` with descriptive `aria-label`. Respects `prefers-reduced-motion`. Colour uses primary palette.

**Step 7: Run tests**

Run: `npx vitest run tests/components/techfreedom/`
Expected: ALL PASS

**Step 8: Commit**

```bash
git add src/components/techfreedom/ tests/components/techfreedom/
git commit -m "feat(techfreedom): add RiskBadge, RiskDetails, and RadarChart components"
```

---

## Task 5: Integrate Into Wizard — Systems Step

**Files:**
- Modify: `src/components/wizard/function-systems.tsx`
- Test: `tests/components/wizard/function-systems.test.tsx` (add cases)

**Step 1: Add risk matching to systems form**

When TechFreedom is enabled (`architecture.metadata.techFreedomEnabled`):
- After user enters a system name (on blur or after typing pause), call `findMatchingTool()`
- If matched: show RiskBadge next to the system name in the "Added systems" list, auto-populate `techFreedomScore` on the system data
- Add a RiskDetails disclosure below matched systems
- For unknown tools: show small "Assess risk" link that opens a RiskDetails with all scores at 3 (neutral)

**Step 2: Pass techFreedomScore through to addSystem**

When `handleContinue` saves systems, include the `techFreedomScore` field if present.

**Step 3: Add test cases**

Test that when `techFreedomEnabled: true` in architecture metadata, adding a known tool name shows a risk badge. Test that unknown tools don't show a badge. Test that techFreedomScore is passed to addSystem.

**Step 4: Run tests**

Run: `npx vitest run tests/components/wizard/function-systems.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/components/wizard/function-systems.tsx tests/components/wizard/function-systems.test.tsx
git commit -m "feat(techfreedom): integrate risk matching into wizard systems step"
```

---

## Task 6: Integrate Into Wizard — Review Step

**Files:**
- Modify: `src/components/wizard/review-summary.tsx`
- Test: `tests/components/wizard/review-summary.test.tsx` (add cases)

**Step 1: Add risk summary section**

When `techFreedomEnabled` and at least one system has a score:
- Show a "Technology Risk Summary" section between Functions & Systems and Services
- Use `aggregateRisk()` to compute summary
- Show: overall risk level badge, worst dimension, most critical tool, count by category
- Show RiskBadge next to each system name in the systems list

**Step 2: Add test cases**

Test section appears only when enabled and systems have scores. Test section is absent when disabled.

**Step 3: Run tests**

Run: `npx vitest run tests/components/wizard/review-summary.test.tsx`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add src/components/wizard/review-summary.tsx tests/components/wizard/review-summary.test.tsx
git commit -m "feat(techfreedom): add risk summary to review step"
```

---

## Task 7: TechFreedom View Page

**Files:**
- Create: `src/components/views/techfreedom-view.tsx`
- Create: `src/app/view/techfreedom/page.tsx`
- Test: `tests/components/views/techfreedom-view.test.tsx`

**Step 1: Write failing tests**

Test: renders heading, shows heatmap table with system rows, shows radar chart, shows summary panel, sorts by total descending, shows "Not assessed" for unscored systems, has no axe violations.

**Step 2: Implement TechFreedomView**

Full page component with:
- Heading: "Technology Risk Assessment"
- Summary panel (top): aggregate risk badge, worst dimension, most critical tool, counts
- Radar chart: SVG pentagon showing aggregate risk profile
- Heatmap table: `<table>` with proper `<thead>/<th scope="col">`, one row per system, 5 dimension columns + total + risk level. Cells colour-coded. Sortable by clicking headers. Expandable rows for keyRisks.
- Empty state: "No systems have been assessed yet. Enable TechFreedom in the wizard to get started."

**Step 3: Create page wrapper**

```typescript
// src/app/view/techfreedom/page.tsx
'use client';
import { TechFreedomView } from '@/components/views/techfreedom-view';
import { useArchitecture, ArchitectureProvider } from '@/hooks/useArchitecture';

function TechFreedomPageContent() {
  const { architecture, isLoading } = useArchitecture();
  return <TechFreedomView architecture={architecture} isLoading={isLoading} />;
}

export default function TechFreedomPage() {
  return (
    <ArchitectureProvider>
      <TechFreedomPageContent />
    </ArchitectureProvider>
  );
}
```

**Step 4: Run tests**

Run: `npx vitest run tests/components/views/techfreedom-view.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/components/views/techfreedom-view.tsx src/app/view/techfreedom/ tests/components/views/
git commit -m "feat(techfreedom): add TechFreedom analysis view with heatmap and radar"
```

---

## Task 8: Feature Toggle & Navigation

**Files:**
- Modify: `src/components/layout/header.tsx`
- Modify: `src/app/wizard/layout.tsx`
- Create: `src/components/techfreedom/toggle.tsx`

**Step 1: Add TechFreedom toggle component**

A small toggle that appears in the wizard layout when `techFreedomAvailable` is true. Checkbox: "Include TechFreedom risk assessment" with brief explainer. Toggles `architecture.metadata.techFreedomEnabled`.

**Step 2: Add toggle to wizard layout**

Below the stepper, show the toggle component. Read `useAppConfig()` to check availability.

**Step 3: Add TechFreedom link to header**

In the mobile nav, add a "Risk Assessment" link to `/view/techfreedom` (only visible when techFreedomAvailable is true). On desktop, add it next to the "Start mapping" CTA.

**Step 4: Verify build**

Run: `npm run build`
Expected: Builds successfully with the new `/view/techfreedom` route

**Step 5: Run full test suite**

Run: `npx vitest run`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/components/techfreedom/toggle.tsx src/components/layout/header.tsx src/app/wizard/layout.tsx
git commit -m "feat(techfreedom): add feature toggle and navigation"
```

---

## Task 9: Final Verification

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: ALL PASS

**Step 2: Run build**

Run: `npm run build`
Expected: Clean build with `/view/techfreedom` route included

**Step 3: Manual testing checklist**

- [ ] With techFreedomAvailable=true, toggle appears in wizard
- [ ] Enabling toggle shows risk badges when adding known systems (Xero, Salesforce, etc.)
- [ ] Unknown systems don't show risk badges
- [ ] Review step shows risk summary section
- [ ] TechFreedom view shows heatmap and radar chart
- [ ] Disabling toggle hides all risk UI
- [ ] Data persists via localStorage across pages
- [ ] Keyboard navigation works throughout new components

**Step 4: Update PLAN.md**

Mark TechFreedom integration as complete in the project plan.

**Step 5: Commit**

```bash
git add PLAN.md
git commit -m "feat(techfreedom): complete integration — mark done in plan"
```
