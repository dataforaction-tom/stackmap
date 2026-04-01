# Importance & Shadow Tools Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a wizard step where users rate system importance (1-10 slider) and surface shadow/informal tools, with a live bullseye diagram in the sidebar.

**Architecture:** Two new fields on the System type (`importance`, `isShadow`). A new wizard step at position 5 (after systems, before services). A new `BullseyeDiagram` SVG component for the sidebar and review. Tier labels (core/important/peripheral) are derived from score, never stored.

**Tech Stack:** React, TypeScript, Tailwind, Vitest, Zod, Next.js App Router

---

### Task 1: Add `importance` and `isShadow` to System type and schema

**Files:**
- Modify: `src/lib/types.ts:76-94` (System interface)
- Modify: `src/lib/schema.ts:132-146` (SystemSchema)
- Test: `tests/unit/types.test.ts`

**Step 1: Write the failing test**

Add to `tests/unit/types.test.ts`:

```typescript
it('accepts importance and isShadow on a System', () => {
  const system: System = {
    id: 'sys-1',
    name: 'WhatsApp',
    type: 'messaging',
    hosting: 'cloud',
    status: 'active',
    functionIds: [],
    serviceIds: [],
    systemIds: [],
    importance: 7,
    isShadow: true,
  };
  expect(system.importance).toBe(7);
  expect(system.isShadow).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/types.test.ts --reporter=verbose`
Expected: FAIL — `importance` and `isShadow` do not exist on type `System`

**Step 3: Add fields to System interface**

In `src/lib/types.ts`, add after line 93 (`techFreedomScore?: TechFreedomScore;`):

```typescript
  importance?: number;
  isShadow?: boolean;
```

**Step 4: Add fields to Zod schema**

In `src/lib/schema.ts`, add to `SystemSchema` after the `techFreedomScore` line (145):

```typescript
  importance: z.number().min(1).max(10).optional(),
  isShadow: z.boolean().optional(),
```

**Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/types.test.ts --reporter=verbose`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/schema.ts tests/unit/types.test.ts
git commit -m "feat: add importance and isShadow fields to System type"
```

---

### Task 2: Add `getImportanceTier` helper

**Files:**
- Create: `src/lib/importance.ts`
- Test: `tests/unit/importance.test.ts`

**Step 1: Write the failing tests**

Create `tests/unit/importance.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getImportanceTier } from '@/lib/importance';

describe('getImportanceTier', () => {
  it('returns "core" for scores 8-10', () => {
    expect(getImportanceTier(8)).toEqual({ tier: 'core', label: 'Core' });
    expect(getImportanceTier(9)).toEqual({ tier: 'core', label: 'Core' });
    expect(getImportanceTier(10)).toEqual({ tier: 'core', label: 'Core' });
  });

  it('returns "important" for scores 4-7', () => {
    expect(getImportanceTier(4)).toEqual({ tier: 'important', label: 'Important' });
    expect(getImportanceTier(7)).toEqual({ tier: 'important', label: 'Important' });
  });

  it('returns "peripheral" for scores 1-3', () => {
    expect(getImportanceTier(1)).toEqual({ tier: 'peripheral', label: 'Peripheral' });
    expect(getImportanceTier(3)).toEqual({ tier: 'peripheral', label: 'Peripheral' });
  });

  it('returns null for undefined', () => {
    expect(getImportanceTier(undefined)).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/importance.test.ts --reporter=verbose`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

Create `src/lib/importance.ts`:

```typescript
export type ImportanceTierKey = 'core' | 'important' | 'peripheral';

export interface ImportanceTier {
  tier: ImportanceTierKey;
  label: string;
}

export const IMPORTANCE_TIERS: { key: ImportanceTierKey; label: string; min: number; max: number; color: string }[] = [
  { key: 'core', label: 'Core', min: 8, max: 10, color: '#22c55e' },
  { key: 'important', label: 'Important', min: 4, max: 7, color: '#f59e0b' },
  { key: 'peripheral', label: 'Peripheral', min: 1, max: 3, color: '#9ca3af' },
];

export function getImportanceTier(score: number | undefined): ImportanceTier | null {
  if (score === undefined) return null;
  if (score >= 8) return { tier: 'core', label: 'Core' };
  if (score >= 4) return { tier: 'important', label: 'Important' };
  return { tier: 'peripheral', label: 'Peripheral' };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/importance.test.ts --reporter=verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/importance.ts tests/unit/importance.test.ts
git commit -m "feat: add importance tier derivation helper"
```

---

### Task 3: Update stepper to include Importance step (9 → 10 steps)

**Files:**
- Modify: `src/components/wizard/stepper.tsx:11-33`
- Test: `tests/components/wizard/stepper.test.tsx`

**Step 1: Update the stepper test**

In `tests/components/wizard/stepper.test.tsx`, change the two tests that check for 9 steps to expect 10:

```typescript
it('renders 10 steps for function-first path', () => {
  render(<Stepper />);
  const nav = screen.getByRole('navigation', { name: /wizard progress/i });
  const list = nav.querySelector('ol');
  const items = list?.querySelectorAll('li');
  expect(items).toHaveLength(10);
});

it('renders 10 steps for service-first path', () => {
  mockPathname = '/wizard/services';
  render(<Stepper />);
  const nav = screen.getByRole('navigation', { name: /wizard progress/i });
  const list = nav.querySelector('ol');
  const items = list?.querySelectorAll('li');
  expect(items).toHaveLength(10);
});
```

Add a test for the new step:

```typescript
it('includes Importance step as step 5 in function-first path', () => {
  mockPathname = '/wizard/functions/importance';
  render(<Stepper />);
  const step = screen.getByText('Importance');
  expect(step).toBeInTheDocument();
  expect(step).toHaveAttribute('aria-current', 'step');
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/wizard/stepper.test.tsx --reporter=verbose`
Expected: FAIL — still 9 steps, no "Importance" step

**Step 3: Add the Importance step to both paths**

In `src/components/wizard/stepper.tsx`, update `FUNCTION_FIRST_STEPS` (after line 15, the Systems entry):

```typescript
{ label: 'Importance', path: '/wizard/functions/importance' },
```

Update `SERVICE_FIRST_STEPS` (after line 26, the Systems entry):

```typescript
{ label: 'Importance', path: '/wizard/services/importance' },
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/wizard/stepper.test.tsx --reporter=verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/wizard/stepper.tsx tests/components/wizard/stepper.test.tsx
git commit -m "feat: add Importance step to wizard stepper (step 5)"
```

---

### Task 4: Create BullseyeDiagram component

**Files:**
- Create: `src/components/wizard/bullseye-diagram.tsx`
- Test: `tests/components/wizard/bullseye-diagram.test.tsx`

**Step 1: Write the failing tests**

Create `tests/components/wizard/bullseye-diagram.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { BullseyeDiagram } from '@/components/wizard/bullseye-diagram';
import type { System, OrgFunction } from '@/lib/types';

const mockFunctions: OrgFunction[] = [
  { id: 'fn-1', name: 'Finance', type: 'finance', isActive: true },
];

const mockSystems: System[] = [
  {
    id: 'sys-1', name: 'Xero', type: 'finance', hosting: 'cloud',
    status: 'active', functionIds: ['fn-1'], serviceIds: [], importance: 9,
  },
  {
    id: 'sys-2', name: 'Slack', type: 'messaging', hosting: 'cloud',
    status: 'active', functionIds: ['fn-1'], serviceIds: [], importance: 5,
  },
  {
    id: 'sys-3', name: 'Notepad', type: 'other', hosting: 'cloud',
    status: 'active', functionIds: ['fn-1'], serviceIds: [], importance: 2,
  },
  {
    id: 'sys-4', name: 'WhatsApp', type: 'messaging', hosting: 'cloud',
    status: 'active', functionIds: [], serviceIds: [], isShadow: true,
  },
];

describe('BullseyeDiagram', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <BullseyeDiagram systems={mockSystems} functions={mockFunctions} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders an SVG with role img', () => {
    render(<BullseyeDiagram systems={mockSystems} functions={mockFunctions} />);
    const svg = screen.getByRole('img', { name: /importance/i });
    expect(svg).toBeInTheDocument();
  });

  it('renders three ring labels', () => {
    render(<BullseyeDiagram systems={mockSystems} functions={mockFunctions} />);
    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Peripheral')).toBeInTheDocument();
  });

  it('renders system labels', () => {
    render(<BullseyeDiagram systems={mockSystems} functions={mockFunctions} />);
    expect(screen.getByText('Xero')).toBeInTheDocument();
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.getByText('Notepad')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('renders shadow systems with dashed stroke', () => {
    const { container } = render(
      <BullseyeDiagram systems={mockSystems} functions={mockFunctions} />
    );
    // WhatsApp is shadow — its circle should have a dasharray
    const circles = container.querySelectorAll('circle');
    const whatsappCircle = Array.from(circles).find(c => {
      const label = c.nextElementSibling;
      return label?.textContent === 'WhatsApp';
    });
    expect(whatsappCircle?.getAttribute('stroke-dasharray')).toBeTruthy();
  });

  it('handles empty systems array', () => {
    const { container } = render(
      <BullseyeDiagram systems={[]} functions={[]} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/wizard/bullseye-diagram.test.tsx --reporter=verbose`
Expected: FAIL — module not found

**Step 3: Write the BullseyeDiagram component**

Create `src/components/wizard/bullseye-diagram.tsx`. This is a substantial component — key implementation details:

- Props: `systems: System[]`, `functions: OrgFunction[]`
- SVG with `role="img"` and `aria-label="Importance bullseye diagram"`
- Three concentric circles (peripheral outermost, core innermost) with fills: green-100, amber-100, grey-100 and strokes
- Ring labels positioned at the right edge of each ring
- For each system with an importance score:
  - Calculate radial distance: map score 1-10 to distance from centre (10 = centre, 1 = outer edge of peripheral ring)
  - Calculate angle: distribute systems evenly around the circle, grouped by function
  - Draw a filled circle at (cx + r*cos(angle), cy + r*sin(angle)) coloured by function
  - Draw system name as text label next to the dot
  - If `isShadow`, use `strokeDasharray="4 2"` on the circle
- Unscored shadow tools positioned in a ring outside the outer circle
- Dynamic sizing: compute the SVG viewBox based on system count. Base radius ~80px per ring, expand if >6 systems per ring. Minimum viewBox 300x300.

The full component code:

```tsx
'use client';

import type { System, OrgFunction } from '@/lib/types';
import { getImportanceTier } from '@/lib/importance';

const FUNCTION_COLORS: Record<string, string> = {
  finance: '#34d399',
  governance: '#60a5fa',
  people: '#a78bfa',
  fundraising: '#fbbf24',
  communications: '#fb7185',
  service_delivery: '#38bdf8',
  operations: '#a8a29e',
  data_reporting: '#2dd4bf',
  custom: '#63a576',
};

const RING_FILLS = ['#dcfce7', '#fef3c7', '#f3f4f6']; // core, important, peripheral
const RING_STROKES = ['#22c55e', '#f59e0b', '#9ca3af'];
const RING_LABELS = ['Core', 'Important', 'Peripheral'];

interface BullseyeDiagramProps {
  systems: System[];
  functions: OrgFunction[];
}

export function BullseyeDiagram({ systems, functions }: BullseyeDiagramProps) {
  const funcMap = new Map(functions.map(f => [f.id, f]));

  // Separate scored vs unscored shadow systems
  const scored = systems.filter(s => s.importance !== undefined);
  const unscoredShadow = systems.filter(s => s.isShadow && s.importance === undefined);

  // Dynamic sizing
  const baseRingWidth = 50;
  const systemsPerRing = [
    scored.filter(s => (s.importance ?? 0) >= 8).length,
    scored.filter(s => (s.importance ?? 0) >= 4 && (s.importance ?? 0) < 8).length,
    scored.filter(s => (s.importance ?? 0) < 4).length,
  ];
  const maxPerRing = Math.max(...systemsPerRing, 1);
  const ringScale = maxPerRing > 6 ? 1 + (maxPerRing - 6) * 0.15 : 1;
  const ringWidth = baseRingWidth * ringScale;
  const outerRadius = ringWidth * 3;
  const shadowRadius = outerRadius + ringWidth * 0.8;
  const totalRadius = unscoredShadow.length > 0 ? shadowRadius + 30 : outerRadius + 30;
  const size = Math.max(300, totalRadius * 2 + 60);
  const cx = size / 2;
  const cy = size / 2;

  // Map score to distance from centre
  function scoreToRadius(score: number): number {
    // 10 → near centre, 1 → outer edge of peripheral ring
    // core ring: 0 to ringWidth (scores 8-10)
    // important ring: ringWidth to ringWidth*2 (scores 4-7)
    // peripheral ring: ringWidth*2 to ringWidth*3 (scores 1-3)
    if (score >= 8) {
      const t = (10 - score) / 2; // 0 at 10, 1 at 8
      return t * ringWidth;
    }
    if (score >= 4) {
      const t = (7 - score) / 3; // 0 at 7, 1 at 4
      return ringWidth + t * ringWidth;
    }
    const t = (3 - score) / 2; // 0 at 3, 1 at 1
    return ringWidth * 2 + t * ringWidth;
  }

  // Get function color for a system
  function getColor(system: System): string {
    const funcId = system.functionIds[0];
    if (!funcId) return '#63a576';
    const func = funcMap.get(funcId);
    if (!func) return '#63a576';
    return FUNCTION_COLORS[func.type] ?? '#63a576';
  }

  // Distribute systems angularly
  function distributeAngles(items: { id: string }[]): Map<string, number> {
    const angles = new Map<string, number>();
    if (items.length === 0) return angles;
    const step = (2 * Math.PI) / items.length;
    const offset = -Math.PI / 2; // start at top
    items.forEach((item, i) => {
      angles.set(item.id, offset + i * step);
    });
    return angles;
  }

  const scoredAngles = distributeAngles(scored);
  const shadowAngles = distributeAngles(unscoredShadow);

  const DOT_R = 6;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="Importance bullseye diagram"
      className="max-w-full"
    >
      {/* Rings — draw outermost first */}
      {[2, 1, 0].map(i => {
        const r = ringWidth * (i + 1);
        return (
          <circle
            key={`ring-${i}`}
            cx={cx}
            cy={cy}
            r={r}
            fill={RING_FILLS[i]}
            stroke={RING_STROKES[i]}
            strokeWidth={1.5}
          />
        );
      })}

      {/* Ring labels — positioned to the right */}
      {RING_LABELS.map((label, i) => {
        const r = ringWidth * (i + 0.5);
        return (
          <text
            key={`label-${i}`}
            x={cx + ringWidth * (i + 1) - 4}
            y={cy - 4}
            textAnchor="end"
            fontSize={10}
            fill={RING_STROKES[i]}
            fontWeight={600}
          >
            {label}
          </text>
        );
      })}

      {/* Scored systems */}
      {scored.map(system => {
        const angle = scoredAngles.get(system.id) ?? 0;
        const r = scoreToRadius(system.importance!);
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const color = getColor(system);
        const isDashed = system.isShadow;

        return (
          <g key={system.id}>
            <circle
              cx={x}
              cy={y}
              r={DOT_R}
              fill={color}
              stroke={color}
              strokeWidth={isDashed ? 2 : 1}
              strokeDasharray={isDashed ? '4 2' : undefined}
              opacity={0.9}
            />
            <text
              x={x + DOT_R + 3}
              y={y + 3}
              fontSize={9}
              fill="#1c3b27"
            >
              {system.name}
            </text>
            <title>{`${system.name}: ${system.importance}/10 (${getImportanceTier(system.importance)?.label ?? 'Unscored'})`}</title>
          </g>
        );
      })}

      {/* Unscored shadow systems — outside the rings */}
      {unscoredShadow.map(system => {
        const angle = shadowAngles.get(system.id) ?? 0;
        const x = cx + shadowRadius * Math.cos(angle);
        const y = cy + shadowRadius * Math.sin(angle);
        const color = getColor(system);

        return (
          <g key={system.id}>
            <circle
              cx={x}
              cy={y}
              r={DOT_R}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeDasharray="4 2"
              opacity={0.7}
            />
            <text
              x={x + DOT_R + 3}
              y={y + 3}
              fontSize={9}
              fill="#788866"
              fontStyle="italic"
            >
              {system.name}
            </text>
            <title>{`${system.name}: Shadow tool (unscored)`}</title>
          </g>
        );
      })}
    </svg>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/wizard/bullseye-diagram.test.tsx --reporter=verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/wizard/bullseye-diagram.tsx tests/components/wizard/bullseye-diagram.test.tsx
git commit -m "feat: add BullseyeDiagram SVG component"
```

---

### Task 5: Create ImportanceStep page component

**Files:**
- Create: `src/components/wizard/importance-step.tsx`
- Test: `tests/components/wizard/importance-step.test.tsx`

**Step 1: Write the failing tests**

Create `tests/components/wizard/importance-step.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { ImportanceStep } from '@/components/wizard/importance-step';

// Mock useArchitecture
const mockUpdateSystem = vi.fn();
const mockAddSystem = vi.fn().mockReturnValue('new-id');

const mockArchitecture = {
  organisation: { id: 'org-1', name: 'Test Org', type: 'charity' as const, createdAt: '', updatedAt: '' },
  functions: [
    { id: 'fn-1', name: 'Finance', type: 'finance' as const, isActive: true },
    { id: 'fn-2', name: 'Communications', type: 'communications' as const, isActive: true },
  ],
  systems: [
    {
      id: 'sys-1', name: 'Xero', type: 'finance' as const, hosting: 'cloud' as const,
      status: 'active' as const, functionIds: ['fn-1'], serviceIds: [],
    },
    {
      id: 'sys-2', name: 'Mailchimp', type: 'email' as const, hosting: 'cloud' as const,
      status: 'active' as const, functionIds: ['fn-2'], serviceIds: [],
    },
  ],
  services: [],
  dataCategories: [],
  integrations: [],
  owners: [],
  metadata: { version: '1.0.0', exportedAt: '', stackmapVersion: '0.1.0', mappingPath: 'function_first' as const },
};

vi.mock('@/hooks/useArchitecture', () => ({
  useArchitecture: () => ({
    architecture: mockArchitecture,
    isLoading: false,
    updateSystem: mockUpdateSystem,
    addSystem: mockAddSystem,
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/wizard/functions/importance',
}));

describe('ImportanceStep', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<ImportanceStep />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders systems grouped by function', () => {
    render(<ImportanceStep />);
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Communications')).toBeInTheDocument();
    expect(screen.getByText('Xero')).toBeInTheDocument();
    expect(screen.getByText('Mailchimp')).toBeInTheDocument();
  });

  it('renders tier definitions', () => {
    render(<ImportanceStep />);
    expect(screen.getByText(/core/i)).toBeInTheDocument();
    expect(screen.getByText(/operations would stop/i)).toBeInTheDocument();
  });

  it('renders importance sliders for each system', () => {
    render(<ImportanceStep />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2); // Xero and Mailchimp
  });

  it('calls updateSystem when slider changes', () => {
    render(<ImportanceStep />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '8' } });
    expect(mockUpdateSystem).toHaveBeenCalledWith('sys-1', { importance: 8 });
  });

  it('renders shadow tool prompts per function', () => {
    render(<ImportanceStep />);
    expect(screen.getByText(/tools people use informally for Finance/i)).toBeInTheDocument();
    expect(screen.getByText(/tools people use informally for Communications/i)).toBeInTheDocument();
  });

  it('renders add shadow tool buttons', () => {
    render(<ImportanceStep />);
    const buttons = screen.getAllByRole('button', { name: /add shadow tool/i });
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/wizard/importance-step.test.tsx --reporter=verbose`
Expected: FAIL — module not found

**Step 3: Write the ImportanceStep component**

Create `src/components/wizard/importance-step.tsx`. Key structure:

- Uses `useArchitecture()` to get systems, functions, and `updateSystem`
- Groups systems by function (using `functionIds`)
- For each function group:
  - Function heading
  - System cards with slider (`<input type="range" min={1} max={10}>`) and live tier label
  - Slider track coloured with CSS gradient: grey (1-3), amber (4-7), green (8-10)
  - Shadow tool prompt and expandable inline form (name + type dropdown + notes)
- Unlinked systems section at bottom
- General shadow prompt at bottom
- Shadow tool form calls `addSystem({ name, type, hosting: 'unknown', status: 'active', functionIds: [currentFunctionId], serviceIds: [], isShadow: true })`

```tsx
'use client';

import { useState } from 'react';
import { useArchitecture } from '@/hooks/useArchitecture';
import { getImportanceTier, IMPORTANCE_TIERS } from '@/lib/importance';
import type { SystemType } from '@/lib/types';

const SYSTEM_TYPES: { value: SystemType; label: string }[] = [
  { value: 'crm', label: 'CRM' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'HR' },
  { value: 'case_management', label: 'Case management' },
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email / marketing' },
  { value: 'document_management', label: 'Documents' },
  { value: 'database', label: 'Database' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'messaging', label: 'Messaging' },
  { value: 'other', label: 'Other' },
];

const TIER_COLORS: Record<string, string> = {
  core: 'text-green-700 bg-green-100',
  important: 'text-amber-700 bg-amber-100',
  peripheral: 'text-stone-600 bg-stone-100',
};

interface ShadowFormState {
  name: string;
  type: SystemType;
  notes: string;
}

const emptyShadowForm: ShadowFormState = { name: '', type: 'other', notes: '' };

export function ImportanceStep() {
  const { architecture, updateSystem, addSystem } = useArchitecture();
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  const [shadowForms, setShadowForms] = useState<Record<string, ShadowFormState>>({});
  const [tierDefsOpen, setTierDefsOpen] = useState(true);

  if (!architecture) return null;

  const { functions, systems } = architecture;

  // Group systems by function
  const systemsByFunction = new Map<string, typeof systems>();
  for (const fn of functions) {
    systemsByFunction.set(
      fn.id,
      systems.filter(s => s.functionIds.includes(fn.id) && !s.isShadow),
    );
  }

  // Unlinked (non-shadow) systems
  const linkedIds = new Set(functions.flatMap(fn => systemsByFunction.get(fn.id)?.map(s => s.id) ?? []));
  const unlinked = systems.filter(s => !linkedIds.has(s.id) && !s.isShadow);

  // Shadow systems grouped by function
  const shadowByFunction = new Map<string, typeof systems>();
  for (const fn of functions) {
    shadowByFunction.set(fn.id, systems.filter(s => s.functionIds.includes(fn.id) && s.isShadow));
  }
  const unlinkedShadow = systems.filter(s => s.isShadow && s.functionIds.length === 0);

  function handleSliderChange(systemId: string, value: number) {
    updateSystem(systemId, { importance: value });
  }

  function toggleShadowForm(key: string) {
    setExpandedForms(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    if (!shadowForms[key]) {
      setShadowForms(prev => ({ ...prev, [key]: { ...emptyShadowForm } }));
    }
  }

  function handleShadowSubmit(functionId: string, formKey: string) {
    const form = shadowForms[formKey];
    if (!form?.name.trim()) return;
    addSystem({
      name: form.name.trim(),
      type: form.type,
      hosting: 'unknown',
      status: 'active',
      functionIds: functionId ? [functionId] : [],
      serviceIds: [],
      notes: form.notes || undefined,
      isShadow: true,
    });
    setShadowForms(prev => ({ ...prev, [formKey]: { ...emptyShadowForm } }));
    setExpandedForms(prev => {
      const next = new Set(prev);
      next.delete(formKey);
      return next;
    });
  }

  function renderShadowForm(functionId: string, formKey: string) {
    if (!expandedForms.has(formKey)) return null;
    const form = shadowForms[formKey] ?? emptyShadowForm;
    return (
      <div className="mt-2 p-3 border border-dashed border-surface-300 rounded-lg space-y-2 bg-surface-50">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tool name"
            value={form.name}
            onChange={e => setShadowForms(prev => ({
              ...prev, [formKey]: { ...prev[formKey], name: e.target.value },
            }))}
            className="flex-1 px-3 py-1.5 text-sm border border-surface-300 rounded-lg"
            aria-label="Shadow tool name"
          />
          <select
            value={form.type}
            onChange={e => setShadowForms(prev => ({
              ...prev, [formKey]: { ...prev[formKey], type: e.target.value as SystemType },
            }))}
            className="px-3 py-1.5 text-sm border border-surface-300 rounded-lg"
            aria-label="Shadow tool type"
          >
            {SYSTEM_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={e => setShadowForms(prev => ({
            ...prev, [formKey]: { ...prev[formKey], notes: e.target.value },
          }))}
          className="w-full px-3 py-1.5 text-sm border border-surface-300 rounded-lg"
          aria-label="Shadow tool notes"
        />
        <button
          type="button"
          onClick={() => handleShadowSubmit(functionId, formKey)}
          disabled={!form.name.trim()}
          className="btn-primary text-sm"
        >
          Add
        </button>
      </div>
    );
  }

  function renderSystemCard(system: typeof systems[0]) {
    const tier = getImportanceTier(system.importance);
    return (
      <div
        key={system.id}
        className={`p-3 rounded-lg border ${system.isShadow ? 'border-dashed border-surface-400' : 'border-surface-200'} bg-white space-y-2`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-primary-900">{system.name}</span>
          <div className="flex items-center gap-2">
            {system.isShadow && (
              <span className="text-xs bg-surface-200 text-surface-600 rounded px-1.5 py-0.5">Shadow</span>
            )}
            {tier && (
              <span className={`text-xs rounded px-1.5 py-0.5 font-medium ${TIER_COLORS[tier.tier]}`}>
                {tier.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={10}
            value={system.importance ?? 5}
            onChange={e => handleSliderChange(system.id, parseInt(e.target.value, 10))}
            className="flex-1 accent-primary-600"
            aria-label={`Importance of ${system.name}`}
            style={{
              background: `linear-gradient(to right, #d1d5db 0%, #d1d5db 30%, #fbbf24 30%, #fbbf24 70%, #22c55e 70%, #22c55e 100%)`,
            }}
          />
          <span className="text-sm font-mono w-6 text-right text-primary-700">
            {system.importance ?? 5}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 py-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900">
          How important is each tool?
        </h1>
        <p className="text-primary-600 mt-1">
          Rate how critical each system is to your organisation. This helps prioritise investment and understand risk.
        </p>
      </div>

      {/* Tier definitions */}
      <button
        type="button"
        onClick={() => setTierDefsOpen(!tierDefsOpen)}
        className="text-sm text-primary-600 underline underline-offset-2"
        aria-expanded={tierDefsOpen}
      >
        {tierDefsOpen ? 'Hide' : 'Show'} importance levels
      </button>
      {tierDefsOpen && (
        <div className="grid gap-2 sm:grid-cols-3" role="list" aria-label="Importance tier definitions">
          {IMPORTANCE_TIERS.map(t => (
            <div key={t.key} className="p-3 rounded-lg border border-surface-200 bg-surface-50" role="listitem">
              <p className="font-semibold text-sm" style={{ color: t.color }}>{t.label} ({t.min}-{t.max})</p>
              <p className="text-xs text-primary-600 mt-0.5">
                {t.key === 'core' && 'Operations would stop without this tool'}
                {t.key === 'important' && 'Valuable but you could work around its loss temporarily'}
                {t.key === 'peripheral' && 'Nice to have, easy to replace or drop'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Systems grouped by function */}
      {functions.filter(fn => fn.isActive).map(fn => {
        const fnSystems = systemsByFunction.get(fn.id) ?? [];
        const fnShadow = shadowByFunction.get(fn.id) ?? [];
        const formKey = `shadow-${fn.id}`;
        return (
          <section key={fn.id} className="space-y-3">
            <h2 className="font-display font-semibold text-primary-800 text-lg">{fn.name}</h2>
            {fnSystems.length === 0 && fnShadow.length === 0 && (
              <p className="text-sm text-primary-400 italic">No systems mapped to this function</p>
            )}
            {fnSystems.map(renderSystemCard)}
            {fnShadow.map(renderSystemCard)}
            <p className="text-sm text-primary-500 italic">
              Are there tools people use informally for {fn.name}?
            </p>
            <button
              type="button"
              onClick={() => toggleShadowForm(formKey)}
              className="btn-secondary text-sm"
              aria-label={`Add shadow tool for ${fn.name}`}
            >
              {expandedForms.has(formKey) ? 'Cancel' : 'Add shadow tool'}
            </button>
            {renderShadowForm(fn.id, formKey)}
          </section>
        );
      })}

      {/* Unlinked systems */}
      {unlinked.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-semibold text-primary-800 text-lg">Other systems</h2>
          {unlinked.map(renderSystemCard)}
        </section>
      )}

      {/* Unlinked shadow */}
      {unlinkedShadow.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-semibold text-primary-800 text-lg">Shadow tools (general)</h2>
          {unlinkedShadow.map(renderSystemCard)}
        </section>
      )}

      {/* General shadow prompt */}
      <section className="space-y-2">
        <p className="text-sm text-primary-500 italic">
          Any other tools people use that are not part of the official setup?
        </p>
        <button
          type="button"
          onClick={() => toggleShadowForm('shadow-general')}
          className="btn-secondary text-sm"
          aria-label="Add shadow tool"
        >
          {expandedForms.has('shadow-general') ? 'Cancel' : 'Add shadow tool'}
        </button>
        {renderShadowForm('', 'shadow-general')}
      </section>
    </div>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/wizard/importance-step.test.tsx --reporter=verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/wizard/importance-step.tsx tests/components/wizard/importance-step.test.tsx
git commit -m "feat: add ImportanceStep wizard component with sliders and shadow tool forms"
```

---

### Task 6: Wire up wizard route pages

**Files:**
- Create: `src/app/wizard/functions/importance/page.tsx`
- Create: `src/app/wizard/services/importance/page.tsx`

**Step 1: Create the function-first route page**

Create `src/app/wizard/functions/importance/page.tsx`:

```tsx
'use client';

import { ImportanceStep } from '@/components/wizard/importance-step';

export default function ImportancePage() {
  return <ImportanceStep />;
}
```

**Step 2: Create the service-first route page**

Create `src/app/wizard/services/importance/page.tsx`:

```tsx
'use client';

import { ImportanceStep } from '@/components/wizard/importance-step';

export default function ImportancePage() {
  return <ImportanceStep />;
}
```

**Step 3: Verify the pages render**

Run: `npx vitest run tests/components/wizard/importance-step.test.tsx --reporter=verbose`
Expected: PASS (component tests already cover rendering)

**Step 4: Commit**

```bash
git add src/app/wizard/functions/importance/page.tsx src/app/wizard/services/importance/page.tsx
git commit -m "feat: add importance wizard route pages for both paths"
```

---

### Task 7: Wire BullseyeDiagram into the sidebar

**Files:**
- Modify: `src/components/wizard/live-map-sidebar.tsx`
- Test: `tests/components/wizard/live-map-sidebar.test.tsx`

**Step 1: Update the test**

Add to `tests/components/wizard/live-map-sidebar.test.tsx`:

```typescript
it('shows bullseye diagram on the importance step', () => {
  mockPathname = '/wizard/functions/importance';
  render(
    <ArchitectureProvider>
      <LiveMapSidebar />
    </ArchitectureProvider>
  );
  // The sidebar should contain the bullseye rather than the mini-map
  // when on the importance path
  // (exact assertion depends on the existing test setup — look for
  // the bullseye img role or absence of mini-map)
});
```

Note: Adapt this test to match the existing test setup in `live-map-sidebar.test.tsx`. Check how `useArchitecture` and `usePathname` are mocked. The key assertion is that on `/wizard/functions/importance` or `/wizard/services/importance`, the sidebar renders `BullseyeDiagram` instead of `MiniMap`.

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/wizard/live-map-sidebar.test.tsx --reporter=verbose`
Expected: FAIL

**Step 3: Update LiveMapSidebar**

In `src/components/wizard/live-map-sidebar.tsx`:

1. Import `usePathname` from `next/navigation` (if not already imported)
2. Import `BullseyeDiagram` from `./bullseye-diagram`
3. In the render, check if `pathname` includes `/importance`:
   - If yes, render `<BullseyeDiagram systems={architecture.systems} functions={architecture.functions} />`
   - If no, render the existing `<MiniMap />` and `<MapStats />`

The conditional goes where `MiniMap` is currently rendered inside the panel.

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/wizard/live-map-sidebar.test.tsx --reporter=verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/wizard/live-map-sidebar.tsx tests/components/wizard/live-map-sidebar.test.tsx
git commit -m "feat: show bullseye diagram in sidebar on importance step"
```

---

### Task 8: Add importance and shadow sections to review summary

**Files:**
- Modify: `src/components/wizard/review-summary.tsx`
- Test: `tests/components/wizard/review-summary.test.tsx`

**Step 1: Update the test**

Add tests to `tests/components/wizard/review-summary.test.tsx`. You'll need to add `importance` and `isShadow` fields to the mock systems used in that file:

```typescript
it('renders importance overview section', () => {
  // Add importance to existing mock systems
  // Render ReviewSummary
  // Assert: "core", "important", "peripheral" counts visible
  // Assert: bullseye diagram rendered (role="img")
});

it('renders shadow tools section separately', () => {
  // Add a shadow system to mock
  // Render ReviewSummary
  // Assert: "Shadow & Informal Tools" heading visible
  // Assert: shadow system name visible
});

it('shows formalisation callout for high-importance shadow tools', () => {
  // Add shadow system with importance: 9
  // Assert: text about "consider formalising" visible
});
```

Note: Check `tests/components/wizard/review-summary.test.tsx` for the existing mock pattern (how `useArchitecture` is mocked) and follow the same pattern.

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/wizard/review-summary.test.tsx --reporter=verbose`
Expected: FAIL

**Step 3: Add sections to ReviewSummary**

In `src/components/wizard/review-summary.tsx`, add two new sections. Place them after the "Cost Overview" section (around line 534) and before "Potential overlaps":

1. Import `BullseyeDiagram` and `getImportanceTier`
2. Compute stats: `coreSystems = systems.filter(s => !s.isShadow && (s.importance ?? 0) >= 8)`; similarly for important, peripheral
3. Compute: `shadowSystems = systems.filter(s => s.isShadow)`; `highImportanceShadow = shadowSystems.filter(s => (s.importance ?? 0) >= 8)`

**Importance Overview section:**
```tsx
{systems.some(s => s.importance !== undefined) && (
  <section className="bg-surface-100 border border-surface-300 rounded-lg p-4 sm:p-6 space-y-4" data-testid="importance-overview">
    <h2 className="font-display font-semibold text-primary-900 text-lg">
      Importance Overview
    </h2>
    <div className="w-full max-w-sm mx-auto">
      <BullseyeDiagram systems={systems} functions={functions} />
    </div>
    <div className="flex flex-wrap gap-3 text-sm">
      <span className="text-green-700">{coreCount} core</span>
      <span className="text-amber-700">{importantCount} important</span>
      <span className="text-stone-600">{peripheralCount} peripheral</span>
      {shadowCount > 0 && <span className="text-primary-500">{shadowCount} shadow</span>}
    </div>
    {highImportanceShadow.length > 0 && (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        {highImportanceShadow.map(s => s.name).join(', ')}
        {highImportanceShadow.length === 1 ? ' is' : ' are'} classified as shadow but scored as core — consider formalising {highImportanceShadow.length === 1 ? 'it' : 'them'}.
      </div>
    )}
  </section>
)}
```

**Shadow Tools section:**
```tsx
{shadowSystems.length > 0 && (
  <section className="bg-surface-100 border border-surface-300 rounded-lg p-4 sm:p-6 space-y-3" data-testid="shadow-tools">
    <h2 className="font-display font-semibold text-primary-900 text-lg">
      Shadow &amp; Informal Tools
    </h2>
    <ul className="space-y-2" role="list">
      {shadowSystems.map(s => (
        <li key={s.id} className="flex items-center justify-between text-sm border-b border-surface-200 pb-2">
          <div>
            <span className="font-medium text-primary-800">{s.name}</span>
            <span className="text-primary-500 ml-2">{formatType(s.type)}</span>
          </div>
          {s.importance !== undefined && (
            <span className={`text-xs rounded px-1.5 py-0.5 font-medium ${
              TIER_COLORS[getImportanceTier(s.importance)?.tier ?? ''] ?? ''
            }`}>
              {s.importance}/10
            </span>
          )}
        </li>
      ))}
    </ul>
  </section>
)}
```

Note: You'll need to add `TIER_COLORS` to this file (or import from importance.ts) and import `getImportanceTier`.

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/wizard/review-summary.test.tsx --reporter=verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/wizard/review-summary.tsx tests/components/wizard/review-summary.test.tsx
git commit -m "feat: add importance overview and shadow tools sections to review"
```

---

### Task 9: Update Markdown export

**Files:**
- Modify: `src/lib/export/markdown.ts`
- Test: `tests/unit/markdown-export.test.ts` (check if exists, otherwise create)

**Step 1: Write the failing test**

Add or create test:

```typescript
it('includes importance tier table in markdown export', () => {
  const arch = createTestArchitecture();
  arch.systems[0].importance = 9;
  arch.systems.push({
    id: 'shadow-1', name: 'WhatsApp', type: 'messaging', hosting: 'unknown',
    status: 'active', functionIds: [], serviceIds: [], isShadow: true, importance: 3,
  });
  const md = generateMarkdownExport(arch);
  expect(md).toContain('## Importance');
  expect(md).toContain('Core');
  expect(md).toContain('## Shadow & Informal Tools');
  expect(md).toContain('WhatsApp');
});
```

Note: Check if `tests/unit/markdown-export.test.ts` exists. If not, create it with a `createTestArchitecture()` helper based on the patterns in other test files.

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/markdown-export.test.ts --reporter=verbose`
Expected: FAIL — no "Importance" section in output

**Step 3: Update generateMarkdownExport**

In `src/lib/export/markdown.ts`, after the cost section, add:

```typescript
// Importance overview
const scoredSystems = arch.systems.filter(s => !s.isShadow && s.importance !== undefined);
if (scoredSystems.length > 0) {
  lines.push('', '## Importance', '');
  lines.push('| System | Score | Tier |');
  lines.push('|--------|-------|------|');
  const sorted = [...scoredSystems].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
  for (const s of sorted) {
    const tier = s.importance! >= 8 ? 'Core' : s.importance! >= 4 ? 'Important' : 'Peripheral';
    lines.push(`| ${s.name} | ${s.importance}/10 | ${tier} |`);
  }
}

// Shadow tools
const shadowSystems = arch.systems.filter(s => s.isShadow);
if (shadowSystems.length > 0) {
  lines.push('', '## Shadow & Informal Tools', '');
  lines.push('| Tool | Type | Importance |');
  lines.push('|------|------|------------|');
  for (const s of shadowSystems) {
    const score = s.importance !== undefined ? `${s.importance}/10` : 'Unscored';
    lines.push(`| ${s.name} | ${formatType(s.type)} | ${score} |`);
  }
}
```

Import `getImportanceTier` if you prefer to use it instead of inline logic.

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/markdown-export.test.ts --reporter=verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/export/markdown.ts tests/unit/markdown-export.test.ts
git commit -m "feat: add importance and shadow tools tables to Markdown export"
```

---

### Task 10: Exclude shadow tools from Mermaid diagrams

**Files:**
- Modify: `src/lib/diagram/mermaid.ts`
- Test: `tests/unit/mermaid.test.ts`

**Step 1: Write the failing test**

Add to `tests/unit/mermaid.test.ts`:

```typescript
it('excludes shadow systems from architecture diagram', () => {
  const arch = createTestArchitecture();
  arch.systems.push({
    id: 'shadow-1', name: 'WhatsApp', type: 'messaging', hosting: 'cloud',
    status: 'active', functionIds: ['fn-1'], serviceIds: [], isShadow: true,
  });
  const mermaid = generateMermaidDiagram(arch);
  expect(mermaid).not.toContain('WhatsApp');
});
```

Note: Check the existing test file for the `createTestArchitecture` helper or mock pattern, and use the same approach. Also check whether `generateMermaidDiagram` already filters systems in some way.

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/mermaid.test.ts --reporter=verbose`
Expected: FAIL — WhatsApp appears in diagram output

**Step 3: Filter shadow systems in each diagram function**

In `src/lib/diagram/mermaid.ts`, at the top of each of the 5 `generate*Diagram` functions, filter out shadow systems:

```typescript
const systems = arch.systems.filter(s => !s.isShadow);
```

Use this local `systems` instead of `arch.systems` throughout each function. This is a one-line change in each of the 5 functions.

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/mermaid.test.ts --reporter=verbose`
Expected: PASS

**Step 5: Run all tests to check nothing broke**

Run: `npx vitest run --reporter=verbose`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add src/lib/diagram/mermaid.ts tests/unit/mermaid.test.ts
git commit -m "fix: exclude shadow systems from Mermaid diagrams"
```

---

### Task 11: Final integration check

**Step 1: Run full test suite**

Run: `npm run test`
Expected: All tests pass

**Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No new errors (pre-existing test errors are acceptable)

**Step 3: Run lint**

Run: `npm run lint`
Expected: No new lint errors

**Step 4: Manual smoke test**

Run: `npm run dev`
1. Navigate to `/wizard`, choose function-first
2. Add an org and some functions
3. Add systems
4. Navigate to the importance step — verify sliders, tier labels, shadow form all work
5. Check sidebar shows bullseye updating live
6. Add a shadow tool, optionally give it a score
7. Continue to review — verify importance overview and shadow tools sections appear
8. Export as markdown — verify importance and shadow tables present
9. View diagram — verify shadow tools don't appear

**Step 5: Commit any fixes from smoke testing**
