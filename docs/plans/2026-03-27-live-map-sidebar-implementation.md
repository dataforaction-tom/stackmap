# Live Map Sidebar — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a persistent, step-aware sidebar to the wizard that shows a live mini-map of the architecture as it builds, with animated stats and contextual tips.

**Architecture:** Responsive sidebar component in wizard layout — fixed panel on desktop (lg+), toggle overlay on tablet (md), floating pill on mobile. Custom SVG mini-map grows as entities are added. Pure function generates contextual tips per wizard step. All data from useArchitecture() context.

**Tech Stack:** TypeScript, React, Next.js 14, Tailwind CSS v3, custom SVG, Vitest

---

## Task 1: Contextual Tips Logic (TDD)

**Files:**
- Create: `src/components/wizard/tips.ts`
- Test: `tests/unit/tips.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/tips.test.ts
import { describe, it, expect } from 'vitest';
import { getTip } from '@/components/wizard/tips';
import type { Architecture } from '@/lib/types';

const blank: Architecture = {
  organisation: { id: '1', name: '', type: 'charity', createdAt: '', updatedAt: '' },
  functions: [],
  services: [],
  systems: [],
  dataCategories: [],
  integrations: [],
  owners: [],
  metadata: { version: '1', exportedAt: '', stackmapVersion: '0.1.0', mappingPath: 'function_first', techFreedomEnabled: false },
};

describe('getTip', () => {
  // Functions step
  it('returns start prompt when no functions selected', () => {
    const tip = getTip('/wizard/functions', blank);
    expect(tip).toMatch(/select/i);
  });

  it('returns encouragement when 1-3 functions selected', () => {
    const arch = { ...blank, functions: [
      { id: '1', name: 'Finance', type: 'finance' as const, isActive: true },
    ]};
    const tip = getTip('/wizard/functions', arch);
    expect(tip).toMatch(/most organisations/i);
  });

  it('returns good coverage when 6+ functions', () => {
    const fns = Array.from({ length: 6 }, (_, i) => ({
      id: String(i), name: `Fn${i}`, type: 'finance' as const, isActive: true,
    }));
    const arch = { ...blank, functions: fns };
    const tip = getTip('/wizard/functions', arch);
    expect(tip).toMatch(/coverage/i);
  });

  // Systems step
  it('returns prompt when systems step has no systems', () => {
    const tip = getTip('/wizard/functions/systems', blank);
    expect(tip).toMatch(/software/i);
  });

  it('mentions spreadsheets when few systems added', () => {
    const arch = { ...blank, systems: [
      { id: '1', name: 'Xero', type: 'finance' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [] },
    ]};
    const tip = getTip('/wizard/functions/systems', arch);
    expect(tip).toMatch(/spreadsheet/i);
  });

  // Services step
  it('returns optional message for services', () => {
    const tip = getTip('/wizard/functions/services', blank);
    expect(tip).toMatch(/optional/i);
  });

  // Data step
  it('mentions personal data on data step', () => {
    const tip = getTip('/wizard/functions/data', blank);
    expect(tip).toMatch(/personal data/i);
  });

  // Integrations step
  it('normalises few integrations', () => {
    const tip = getTip('/wizard/functions/integrations', blank);
    expect(tip).toMatch(/normal/i);
  });

  // Owners step
  it('shows unassigned count when systems lack owners', () => {
    const arch = { ...blank, systems: [
      { id: '1', name: 'Xero', type: 'finance' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [] },
      { id: '2', name: 'Slack', type: 'messaging' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [] },
    ]};
    const tip = getTip('/wizard/functions/owners', arch);
    expect(tip).toMatch(/2 systems/i);
  });

  it('congratulates when all systems have owners', () => {
    const arch = { ...blank, systems: [
      { id: '1', name: 'Xero', type: 'finance' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [], ownerId: 'o1' },
    ], owners: [{ id: 'o1', name: 'Sarah', isExternal: false }]};
    const tip = getTip('/wizard/functions/owners', arch);
    expect(tip).toMatch(/owner/i);
  });

  // Review step
  it('returns summary for review step', () => {
    const arch = { ...blank, functions: [
      { id: '1', name: 'Finance', type: 'finance' as const, isActive: true },
    ], systems: [
      { id: '1', name: 'Xero', type: 'finance' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: ['1'], serviceIds: [] },
    ]};
    const tip = getTip('/wizard/functions/review', arch);
    expect(tip.length).toBeGreaterThan(0);
  });

  // Unknown path
  it('returns empty for unknown paths', () => {
    expect(getTip('/unknown', blank)).toBe('');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/tips.test.ts`
Expected: FAIL — module not found

**Step 3: Implement tips**

```typescript
// src/components/wizard/tips.ts
import type { Architecture } from '@/lib/types';

export function getTip(pathname: string, arch: Architecture): string {
  const { functions, systems, services, integrations, owners, dataCategories } = arch;

  // Functions step
  if (pathname === '/wizard/functions' || pathname === '/wizard/functions/') {
    if (functions.length === 0) return 'Start by selecting the functions your organisation performs.';
    if (functions.length <= 3) return 'Good start. Most organisations select 5\u20136 functions.';
    if (functions.length >= 6) return 'Great coverage. Continue when you\u2019re happy with your selection.';
    return `${functions.length} functions selected so far.`;
  }

  // Systems step
  if (pathname.startsWith('/wizard/functions/systems')) {
    if (systems.length === 0) return 'What software does your team use? Add the tools you rely on.';
    if (systems.length <= 3) return 'Don\u2019t forget spreadsheets and manual processes \u2014 they count too.';
    return `${systems.length} systems mapped across your functions.`;
  }

  // Services step
  if (pathname.startsWith('/wizard/functions/services')) {
    if (services.length === 0) return 'Services are optional \u2014 skip this if your organisation doesn\u2019t think in those terms.';
    return `${services.length} service${services.length === 1 ? '' : 's'} mapped.`;
  }

  // Data step
  if (pathname.startsWith('/wizard/functions/data')) {
    if (dataCategories.length === 0) return 'Flag anything containing personal data \u2014 it helps identify compliance priorities.';
    const personal = dataCategories.filter((d) => d.containsPersonalData).length;
    if (personal > 0) return `${personal} data categor${personal === 1 ? 'y' : 'ies'} flagged as containing personal data.`;
    return `${dataCategories.length} data categor${dataCategories.length === 1 ? 'y' : 'ies'} mapped.`;
  }

  // Integrations step
  if (pathname.startsWith('/wizard/functions/integrations')) {
    if (integrations.length === 0) return 'Many small organisations have few integrations \u2014 that\u2019s perfectly normal.';
    const manual = integrations.filter((i) => i.type === 'manual').length;
    if (manual > 0) return `${manual} manual integration${manual === 1 ? '' : 's'} \u2014 these are often the highest-risk areas.`;
    return `${integrations.length} integration${integrations.length === 1 ? '' : 's'} mapped.`;
  }

  // Owners step
  if (pathname.startsWith('/wizard/functions/owners')) {
    const unowned = systems.filter((s) => !s.ownerId).length;
    if (unowned > 0) return `${unowned} system${unowned === 1 ? '' : 's'} still need${unowned === 1 ? 's' : ''} an owner.`;
    if (systems.length > 0) return 'Every system has an owner \u2014 that\u2019s great accountability.';
    return 'Assign an owner to each system so responsibilities are clear.';
  }

  // Review step
  if (pathname.startsWith('/wizard/functions/review')) {
    const parts = [];
    if (functions.length > 0) parts.push(`${functions.length} function${functions.length === 1 ? '' : 's'}`);
    if (systems.length > 0) parts.push(`${systems.length} system${systems.length === 1 ? '' : 's'}`);
    if (integrations.length > 0) parts.push(`${integrations.length} integration${integrations.length === 1 ? '' : 's'}`);
    return parts.length > 0 ? `Your map: ${parts.join(', ')}.` : '';
  }

  return '';
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/tips.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/components/wizard/tips.ts tests/unit/tips.test.ts
git commit -m "feat(live-map): add contextual tips logic (TDD)"
```

---

## Task 2: MapStats Component (TDD)

**Files:**
- Create: `src/components/wizard/map-stats.tsx`
- Test: `tests/components/wizard/map-stats.test.tsx`

**Step 1: Write failing tests**

Tests should check:
- axe accessibility (no violations)
- Renders function count when functions exist
- Renders system count when systems exist
- Renders integration count when integrations exist
- Renders owner count when owners exist
- Does not render zero counts (only non-zero)
- Has `aria-live="polite"` on the container
- Shows "No items yet" when architecture is completely empty

Mock `useArchitecture` to provide test data.

**Step 2: Run tests, confirm fail**

Run: `npx vitest run tests/components/wizard/map-stats.test.tsx`

**Step 3: Implement MapStats**

```typescript
// src/components/wizard/map-stats.tsx
'use client';

import { useArchitecture } from '@/hooks/useArchitecture';

export function MapStats() {
  const { architecture } = useArchitecture();
  if (!architecture) return null;

  const { functions, systems, integrations, owners } = architecture;

  const stats = [
    { label: 'function', count: functions.length, icon: '▪' },
    { label: 'system', count: systems.length, icon: '●' },
    { label: 'integration', count: integrations.length, icon: '⟷' },
    { label: 'owner', count: owners.length, icon: '◉' },
  ].filter((s) => s.count > 0);

  return (
    <div aria-live="polite" aria-label="Architecture summary" className="space-y-1">
      {stats.length === 0 ? (
        <p className="text-sm text-primary-400">No items yet</p>
      ) : (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-primary-700 list-none p-0 m-0">
          {stats.map((s) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-primary-400 text-xs">{s.icon}</span>
              <span className="font-medium tabular-nums">{s.count}</span>
              <span>{s.count === 1 ? s.label : `${s.label}s`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Step 4: Run tests, confirm pass**

Run: `npx vitest run tests/components/wizard/map-stats.test.tsx`

**Step 5: Commit**

```bash
git add src/components/wizard/map-stats.tsx tests/components/wizard/map-stats.test.tsx
git commit -m "feat(live-map): add MapStats component (TDD)"
```

---

## Task 3: ContextualTip Component (TDD)

**Files:**
- Create: `src/components/wizard/contextual-tip.tsx`
- Test: `tests/components/wizard/contextual-tip.test.tsx`

**Step 1: Write failing tests**

Tests should check:
- axe accessibility (no violations)
- Shows correct tip text for functions step
- Shows correct tip text for systems step
- Shows nothing when getTip returns empty string
- Uses the architecture from context
- Reads pathname from next/navigation

Mock `useArchitecture`, `usePathname`, and verify the correct tip text appears.

**Step 2: Run tests, confirm fail**

**Step 3: Implement ContextualTip**

```typescript
// src/components/wizard/contextual-tip.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useArchitecture } from '@/hooks/useArchitecture';
import { getTip } from './tips';

export function ContextualTip() {
  const pathname = usePathname();
  const { architecture } = useArchitecture();

  if (!architecture) return null;

  const tip = getTip(pathname, architecture);
  if (!tip) return null;

  return (
    <p className="text-sm text-primary-600 leading-relaxed" role="status">
      {tip}
    </p>
  );
}
```

**Step 4: Run tests, confirm pass**

**Step 5: Commit**

```bash
git add src/components/wizard/contextual-tip.tsx tests/components/wizard/contextual-tip.test.tsx
git commit -m "feat(live-map): add ContextualTip component (TDD)"
```

---

## Task 4: MiniMap SVG Component (TDD)

**Files:**
- Create: `src/components/wizard/mini-map.tsx`
- Test: `tests/components/wizard/mini-map.test.tsx`

**Step 1: Write failing tests**

Tests should check:
- axe accessibility (no violations)
- Renders an SVG element with `role="img"` and `aria-label`
- Renders function blocks when functions exist in architecture
- Renders system nodes when systems exist
- Renders connection lines when integrations exist
- Shows empty state text when architecture has no entities
- Function blocks use colour coding (check class names)

Mock `useArchitecture` with various data states.

**Step 2: Run tests, confirm fail**

**Step 3: Implement MiniMap**

Create `src/components/wizard/mini-map.tsx`:

- `'use client'` component
- Reads from `useArchitecture()` context
- SVG with `viewBox` that adjusts based on entity count
- `role="img"` and descriptive `aria-label`

**Function blocks:** Rounded rectangles positioned in a row at the top. Use the same colour mapping as function-picker.tsx:
```typescript
const FUNCTION_COLORS: Record<string, string> = {
  finance: '#34d399',       // emerald-400
  governance: '#60a5fa',    // blue-400
  people: '#a78bfa',        // violet-400
  fundraising: '#fbbf24',   // amber-400
  communications: '#fb7185', // rose-400
  service_delivery: '#38bdf8', // sky-400
  operations: '#a8a29e',    // stone-400
  data_reporting: '#2dd4bf', // teal-400
  custom: '#63a576',        // primary-400
};
```

**System nodes:** Smaller circles positioned below their parent function, connected by thin lines. Calculate x position based on function index, y position in rows of 3 per function.

**Integration lines:** Curved `<path>` elements between connected system nodes using quadratic bezier.

**Animation:** Wrap elements in `<g>` with CSS transition on opacity and transform. Use `@media (prefers-reduced-motion: reduce)` to disable.

**Empty state:** Centered text "Your map will appear here" in light grey.

**Step 4: Run tests, confirm pass**

**Step 5: Commit**

```bash
git add src/components/wizard/mini-map.tsx tests/components/wizard/mini-map.test.tsx
git commit -m "feat(live-map): add MiniMap SVG component (TDD)"
```

---

## Task 5: LiveMapSidebar Container (TDD)

**Files:**
- Create: `src/components/wizard/live-map-sidebar.tsx`
- Test: `tests/components/wizard/live-map-sidebar.test.tsx`

**Step 1: Write failing tests**

Tests should check:
- axe accessibility (no violations)
- Renders with `role="complementary"` and `aria-label`
- Contains MiniMap, MapStats, and ContextualTip
- Desktop: sidebar is visible (check for the sidebar container class)
- Mobile pill: renders summary text
- Mobile overlay: opens when pill is clicked, has `role="dialog"`, has close button
- Close button dismisses overlay

Mock `useArchitecture`, `usePathname`, and use `matchMedia` mock for responsive behaviour (or test CSS classes directly).

**Step 2: Run tests, confirm fail**

**Step 3: Implement LiveMapSidebar**

```typescript
// src/components/wizard/live-map-sidebar.tsx
'use client';

import { useState } from 'react';
import { useArchitecture } from '@/hooks/useArchitecture';
import { MiniMap } from './mini-map';
import { MapStats } from './map-stats';
import { ContextualTip } from './contextual-tip';
```

Structure:
- **Desktop (lg+):** `<aside>` with `role="complementary"`, sticky positioning, contains all three sub-components stacked vertically. Hidden below lg breakpoint via `hidden lg:block`.
- **Mobile pill:** Fixed at bottom, `lg:hidden`. Shows compact summary text from architecture stats. `onClick` opens the overlay.
- **Mobile overlay:** Full-screen fixed overlay with `role="dialog"`, `aria-modal="true"`, focus trap. Contains all three sub-components. Close button at top-right. Backdrop click closes.

Pill text: compute from architecture — show non-zero counts like "3 functions, 5 systems".

Pill animation: brief scale pulse when architecture changes (use a key or transition). Respect `prefers-reduced-motion`.

**Step 4: Run tests, confirm pass**

**Step 5: Commit**

```bash
git add src/components/wizard/live-map-sidebar.tsx tests/components/wizard/live-map-sidebar.test.tsx
git commit -m "feat(live-map): add LiveMapSidebar container (TDD)"
```

---

## Task 6: Wizard Layout Integration

**Files:**
- Modify: `src/app/wizard/layout.tsx`

**Step 1: Update wizard layout**

Change from single-column to sidebar layout:

```typescript
// src/app/wizard/layout.tsx
'use client';

import { ArchitectureProvider } from '@/hooks/useArchitecture';
import { Stepper } from '@/components/wizard/stepper';
import { TechFreedomToggle } from '@/components/techfreedom/toggle';
import { LiveMapSidebar } from '@/components/wizard/live-map-sidebar';
import type { ReactNode } from 'react';

export default function WizardLayout({ children }: { children: ReactNode }) {
  return (
    <ArchitectureProvider>
      <div className="min-h-screen bg-surface-50">
        <header className="border-b border-surface-200 bg-white/80 backdrop-blur-sm">
          <Stepper />
          <div className="max-w-6xl mx-auto px-4 pb-3">
            <TechFreedomToggle />
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 lg:flex lg:gap-8">
          <main className="flex-1 max-w-3xl">
            {children}
          </main>
          <LiveMapSidebar />
        </div>
      </div>
    </ArchitectureProvider>
  );
}
```

Key changes:
- Outer container widens from `max-w-3xl` to `max-w-6xl`
- `lg:flex lg:gap-8` creates the sidebar layout on desktop
- `main` keeps `max-w-3xl` for content width
- `LiveMapSidebar` sits alongside

**Step 2: Run full test suite**

Run: `npx vitest run`
Expected: ALL PASS

**Step 3: Run build**

Run: `npm run build`
Expected: Clean build

**Step 4: Commit**

```bash
git add src/app/wizard/layout.tsx
git commit -m "feat(live-map): integrate sidebar into wizard layout"
```

---

## Task 7: Final Verification

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: ALL PASS

**Step 2: Run build**

Run: `npm run build`
Expected: Clean build, all routes compile

**Step 3: Manual testing checklist**

- [ ] Desktop (lg+): sidebar visible on right, shows mini-map, stats, tip
- [ ] Mini-map shows function blocks after selecting functions
- [ ] Mini-map shows system nodes after adding systems
- [ ] Stats update as entities are added
- [ ] Tips change per wizard step
- [ ] Tablet (md): sidebar hidden, toggle button works
- [ ] Mobile: floating pill shows at bottom
- [ ] Mobile: tap pill opens overlay with full sidebar content
- [ ] Mobile: close button dismisses overlay
- [ ] Keyboard navigation works through sidebar
- [ ] prefers-reduced-motion: no animations
- [ ] Sidebar doesn't interfere with form interactions

**Step 4: Commit and update PLAN.md**

```bash
git add PLAN.md
git commit -m "feat(live-map): complete live map sidebar feature"
```
