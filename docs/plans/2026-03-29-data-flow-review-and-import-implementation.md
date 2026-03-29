# Data Flow Review & Import Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix service clarity, multi-function system display, data category visibility, and status indicators in the sidebar map, then add JSON and CSV import capabilities.

**Architecture:** Model-first cleanup (type change, schema, UI, map, diagrams) followed by import features built on the clean foundation. All changes are client-side only (browser localStorage). CSV parsing uses PapaParse.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind, Vitest, Zod, Mermaid.js, PapaParse (new)

---

## Task 1: Add `beneficiaries` field to Service type and schema

**Files:**
- Modify: `src/lib/types.ts:52-59`
- Modify: `src/lib/schema.ts:116-123`
- Modify: `tests/unit/cost-estimates.test.ts` (if it references Service schema)

**Step 1: Write failing test**

Create: `tests/unit/schema-service.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ServiceSchema } from '@/lib/schema';

describe('ServiceSchema', () => {
  it('accepts a service with beneficiaries field', () => {
    const result = ServiceSchema.safeParse({
      id: 's1',
      name: 'Youth mentoring',
      description: 'Supports young people',
      status: 'active',
      functionIds: ['f1'],
      systemIds: [],
      beneficiaries: 'Young people aged 16-25',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.beneficiaries).toBe('Young people aged 16-25');
    }
  });

  it('accepts a service without beneficiaries field', () => {
    const result = ServiceSchema.safeParse({
      id: 's1',
      name: 'Food parcels',
      status: 'active',
      functionIds: [],
      systemIds: [],
    });
    expect(result.success).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/schema-service.test.ts`
Expected: FAIL — `beneficiaries` is not in the schema, so `safeParse` strips or rejects it.

**Step 3: Add `beneficiaries` to type and schema**

In `src/lib/types.ts:52-59`, add `beneficiaries?: string` to `Service`:

```typescript
export interface Service {
  id: string;
  name: string;
  description?: string;
  beneficiaries?: string;
  status: 'active' | 'planned' | 'retiring';
  functionIds: string[];
  systemIds: string[];
}
```

In `src/lib/schema.ts:116-123`, add `beneficiaries` to `ServiceSchema`:

```typescript
export const ServiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  beneficiaries: z.string().optional(),
  status: ServiceStatusSchema,
  functionIds: z.array(z.string()),
  systemIds: z.array(z.string()).default([]),
});
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/schema-service.test.ts`
Expected: PASS

**Step 5: Run full test suite**

Run: `npx vitest run`
Expected: All existing tests still pass.

**Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/schema.ts tests/unit/schema-service.test.ts
git commit -m "feat: add beneficiaries field to Service type and schema"
```

---

## Task 2: Update ServiceForm UI for service clarity

**Files:**
- Modify: `src/components/wizard/service-form.tsx`
- Modify: `tests/components/wizard/service-form.test.tsx`

**Step 1: Write failing test**

Add to `tests/components/wizard/service-form.test.tsx`:

```typescript
it('renders beneficiaries input field', () => {
  render(<ServiceForm />);
  // After clicking "Yes, add services"
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /yes, add services/i }));
  expect(screen.getByLabelText(/who is this for/i)).toBeInTheDocument();
});

it('shows updated heading text about what organisation delivers', () => {
  render(<ServiceForm />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/what your organisation delivers/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/wizard/service-form.test.tsx`
Expected: FAIL — heading text and beneficiaries field don't exist yet.

**Step 3: Update ServiceForm component**

In `src/components/wizard/service-form.tsx`:

1. Add `beneficiaries` to `ServiceDraft` interface (line 17):
```typescript
interface ServiceDraft {
  name: string;
  description: string;
  beneficiaries: string;
  status: 'active' | 'planned' | 'retiring';
  functionIds: string[];
  systemIds: string[];
}
```

2. Add `beneficiaries: ''` to `EMPTY_DRAFT` (line 25).

3. Add `beneficiaries: svc.beneficiaries ?? ''` to hydration (line 44 area).

4. Change the initial choice screen heading (line 121) from "Do you want to map specific services?" to:
```
What does your organisation deliver?
```

5. Change subheading (line 125 area) to:
```
Services are the things you do for your beneficiaries or customers — like "Youth mentoring" or "Emergency food parcels". Not software services.
```

6. Change "Yes, add services" button text to "Yes, add what we deliver".

7. Change the form heading (line 166) from "Add your services" to "What your organisation delivers".

8. Change subheading (line 169) to: "Tell us about the programmes and activities you deliver to your beneficiaries or customers."

9. Add the "Who is this for?" field in the form grid (after description, line 244 area):
```tsx
<div className="sm:col-span-2">
  <Input
    id="service-beneficiaries"
    label="Who is this for?"
    helperText="Optional — e.g. young people aged 16-25, local businesses"
    value={draft.beneficiaries}
    onChange={(e) => updateField('beneficiaries', e.target.value)}
    placeholder="e.g. Young people aged 16-25"
  />
</div>
```

10. Update `handleAdd` to include beneficiaries, and `handleContinue` to pass `beneficiaries`.

11. Update the service card list to show beneficiaries when present:
```tsx
{svc.beneficiaries && (
  <span className="text-sm text-primary-500 block">
    For: {svc.beneficiaries}
  </span>
)}
```

12. Change "Skip this step" to "Skip for now".

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/wizard/service-form.test.tsx`
Expected: PASS

**Step 5: Run full test suite + accessibility check**

Run: `npx vitest run`
Expected: All tests pass (including existing axe-core checks on ServiceForm).

**Step 6: Commit**

```bash
git add src/components/wizard/service-form.tsx tests/components/wizard/service-form.test.tsx
git commit -m "feat: clarify services as what org delivers, add beneficiaries field"
```

---

## Task 3: Update contextual tips for services

**Files:**
- Modify: `src/components/wizard/tips.ts:26-34`

**Step 1: Write failing test**

Create or update test for tips:

```typescript
import { describe, it, expect } from 'vitest';
import { getTip } from '@/components/wizard/tips';
import type { Architecture } from '@/lib/types';

// Use a minimal arch fixture
const baseArch: Architecture = { /* ...minimal valid architecture with empty arrays */ };

describe('getTip - services step', () => {
  it('returns guidance about beneficiaries when no services exist', () => {
    const tip = getTip('/wizard/functions/services', baseArch);
    expect(tip).toMatch(/deliver|beneficiar/i);
    expect(tip).not.toMatch(/optional/i);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/tips.test.ts`
Expected: FAIL — current tip says "Services are optional".

**Step 3: Update tip text**

In `src/components/wizard/tips.ts:32`:

Change from:
```typescript
if (services.length === 0) return 'Services are optional \u2014 skip this if your organisation doesn\u2019t think in those terms.';
```
To:
```typescript
if (services.length === 0) return 'What do you deliver to your beneficiaries or customers? Add your programmes and activities here.';
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/tips.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/wizard/tips.ts tests/unit/tips.test.ts
git commit -m "feat: update service tips to reference beneficiaries"
```

---

## Task 4: Show shared systems in mini-map

**Files:**
- Modify: `src/components/wizard/mini-map.tsx`
- Modify: `tests/components/wizard/mini-map.test.tsx`

**Step 1: Write failing test**

Add to mini-map tests:

```typescript
it('renders shared systems in a separate section when system has multiple functionIds', () => {
  // Mock architecture with a system assigned to two functions
  mockArchitecture.functions = [
    { id: 'f1', name: 'Finance', type: 'finance', isActive: true },
    { id: 'f2', name: 'Operations', type: 'operations', isActive: true },
  ];
  mockArchitecture.systems = [
    { id: 's1', name: 'SharedTool', type: 'other', hosting: 'cloud', status: 'active', functionIds: ['f1', 'f2'], serviceIds: [] },
  ];

  render(<MiniMap />);
  // Shared system should have function-colour dots
  const sharedDots = document.querySelectorAll('[data-shared-system-id="s1"] [data-function-dot]');
  expect(sharedDots.length).toBe(2);
});

it('renders single-function systems under their parent function', () => {
  mockArchitecture.functions = [
    { id: 'f1', name: 'Finance', type: 'finance', isActive: true },
  ];
  mockArchitecture.systems = [
    { id: 's1', name: 'Xero', type: 'finance', hosting: 'cloud', status: 'active', functionIds: ['f1'], serviceIds: [] },
  ];

  render(<MiniMap />);
  const node = document.querySelector('[data-system-id="s1"]');
  expect(node).toBeTruthy();
  // Should NOT have shared marker
  const shared = document.querySelector('[data-shared-system-id="s1"]');
  expect(shared).toBeNull();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/wizard/mini-map.test.tsx`
Expected: FAIL — no `data-shared-system-id` attributes exist.

**Step 3: Update computeSystemPositions and rendering**

In `src/components/wizard/mini-map.tsx`:

1. Modify `computeSystemPositions` to separate shared systems (functionIds.length > 1):
   - Single-function systems: placed under their parent function (existing logic)
   - Multi-function systems: placed in a "Shared" row below all single-function systems
   - Return a `Set<string>` of shared system IDs alongside positions

2. Add a "Shared Systems" label row in the SVG when shared systems exist:
```tsx
{sharedSystemIds.size > 0 && (
  <text
    x={20}
    y={sharedRowY - 12}
    fontSize="11"
    fontWeight="600"
    fill="#78716c"
  >
    Shared
  </text>
)}
```

3. For each shared system, render function-colour dots (small 4px circles) beside the system circle:
```tsx
{sys.functionIds.map((fnId, dotIndex) => {
  const fn = functions.find((f) => f.id === fnId);
  const dotColor = fn ? FUNCTION_COLORS[fn.type] ?? FUNCTION_COLORS.custom : '#9ca3af';
  return (
    <circle
      key={fnId}
      data-function-dot={fnId}
      cx={pos.x - SYS_RADIUS + dotIndex * 8 + 4}
      cy={pos.y - SYS_RADIUS - 6}
      r={3}
      fill={dotColor}
    />
  );
})}
```

4. Use `data-shared-system-id` on the `<g>` wrapper for shared systems, `data-system-id` for single-function systems (keeping existing attr).

5. Draw connector lines from EACH parent function to shared systems (not just the first).

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/wizard/mini-map.test.tsx`
Expected: PASS

**Step 5: Run full test suite**

Run: `npx vitest run`
Expected: All pass.

**Step 6: Commit**

```bash
git add src/components/wizard/mini-map.tsx tests/components/wizard/mini-map.test.tsx
git commit -m "feat: display shared systems in separate mini-map row with function dots"
```

---

## Task 5: Add shared systems count to MapStats

**Files:**
- Modify: `src/components/wizard/map-stats.tsx`
- Modify: `tests/components/wizard/map-stats.test.tsx`

**Step 1: Write failing test**

```typescript
it('shows shared systems count when systems belong to multiple functions', () => {
  mockArchitecture.systems = [
    { id: 's1', name: 'Shared', type: 'other', hosting: 'cloud', status: 'active', functionIds: ['f1', 'f2'], serviceIds: [] },
    { id: 's2', name: 'Single', type: 'other', hosting: 'cloud', status: 'active', functionIds: ['f1'], serviceIds: [] },
  ];
  render(<MapStats />);
  expect(screen.getByText(/1/)).toBeInTheDocument();
  expect(screen.getByText(/shared/i)).toBeInTheDocument();
});
```

**Step 2: Run to verify fails, then implement**

Add to `map-stats.tsx` stats array:
```typescript
const sharedCount = systems.filter((s) => s.functionIds.length > 1).length;
// Add to stats array:
{ label: 'shared', count: sharedCount, icon: '\u229a' },
```

**Step 3: Run tests, verify pass, commit**

```bash
git add src/components/wizard/map-stats.tsx tests/components/wizard/map-stats.test.tsx
git commit -m "feat: show shared systems count in map stats"
```

---

## Task 6: Add status indicators to mini-map system nodes

**Files:**
- Modify: `src/components/wizard/mini-map.tsx`
- Modify: `tests/components/wizard/mini-map.test.tsx`

**Step 1: Write failing test**

```typescript
it('renders planned system with dashed stroke', () => {
  mockArchitecture.systems = [
    { id: 's1', name: 'Planned', type: 'other', hosting: 'cloud', status: 'planned', functionIds: ['f1'], serviceIds: [] },
  ];
  render(<MiniMap />);
  const circle = document.querySelector('[data-system-id="s1"] circle');
  expect(circle).toHaveAttribute('stroke-dasharray');
});

it('renders legacy system with grey fill', () => {
  mockArchitecture.systems = [
    { id: 's1', name: 'Legacy', type: 'other', hosting: 'cloud', status: 'legacy', functionIds: ['f1'], serviceIds: [] },
  ];
  render(<MiniMap />);
  const circle = document.querySelector('[data-system-id="s1"] circle');
  expect(circle?.getAttribute('fill')).toBe('#d1d5db');
});

it('renders retiring system with reduced opacity', () => {
  mockArchitecture.systems = [
    { id: 's1', name: 'Old', type: 'other', hosting: 'cloud', status: 'retiring', functionIds: ['f1'], serviceIds: [] },
  ];
  render(<MiniMap />);
  const g = document.querySelector('[data-system-id="s1"]');
  expect(g?.getAttribute('opacity')).toBe('0.5');
});
```

**Step 2: Run to verify fails**

**Step 3: Implement status-based styling**

In the system node rendering section of `mini-map.tsx`, compute style based on `sys.status`:

```typescript
function systemNodeStyle(status: System['status']) {
  switch (status) {
    case 'planned':
      return { fill: '#f3f4f6', stroke: '#9ca3af', strokeDasharray: '4 2', opacity: 0.7 };
    case 'retiring':
      return { fill: '#f3f4f6', stroke: '#9ca3af', strokeDasharray: '4 2', opacity: 0.5 };
    case 'legacy':
      return { fill: '#d1d5db', stroke: '#9ca3af', strokeDasharray: undefined, opacity: 0.6 };
    default: // active
      return { fill: '#f3f4f6', stroke: '#9ca3af', strokeDasharray: undefined, opacity: undefined };
  }
}
```

Apply to `<circle>` and `<g>` elements.

**Step 4: Run tests, verify pass, commit**

```bash
git add src/components/wizard/mini-map.tsx tests/components/wizard/mini-map.test.tsx
git commit -m "feat: add status indicators to mini-map system nodes"
```

---

## Task 7: Add personal data shield icon to mini-map

**Files:**
- Modify: `src/components/wizard/mini-map.tsx`
- Modify: `tests/components/wizard/mini-map.test.tsx`

**Step 1: Write failing test**

```typescript
it('renders shield icon on systems holding personal data', () => {
  mockArchitecture.systems = [
    { id: 's1', name: 'CRM', type: 'crm', hosting: 'cloud', status: 'active', functionIds: ['f1'], serviceIds: [] },
  ];
  mockArchitecture.dataCategories = [
    { id: 'd1', name: 'Client records', sensitivity: 'confidential', containsPersonalData: true, systemIds: ['s1'] },
  ];
  render(<MiniMap />);
  const shield = document.querySelector('[data-system-id="s1"] [data-personal-data]');
  expect(shield).toBeTruthy();
});

it('does not render shield icon on systems without personal data', () => {
  mockArchitecture.systems = [
    { id: 's1', name: 'Website', type: 'website', hosting: 'cloud', status: 'active', functionIds: ['f1'], serviceIds: [] },
  ];
  mockArchitecture.dataCategories = [
    { id: 'd1', name: 'Public content', sensitivity: 'public', containsPersonalData: false, systemIds: ['s1'] },
  ];
  render(<MiniMap />);
  const shield = document.querySelector('[data-system-id="s1"] [data-personal-data]');
  expect(shield).toBeNull();
});
```

**Step 2: Run to verify fails**

**Step 3: Implement**

1. Compute set of system IDs holding personal data:
```typescript
const personalDataSystemIds = new Set(
  dataCategories
    .filter((dc) => dc.containsPersonalData)
    .flatMap((dc) => dc.systemIds)
);
```

2. In system node render, add small shield SVG when system is in the set:
```tsx
{personalDataSystemIds.has(sys.id) && (
  <text
    data-personal-data
    x={pos.x + SYS_RADIUS - 2}
    y={pos.y - SYS_RADIUS + 4}
    fontSize="10"
    fill="#b45309"
    aria-label="Contains personal data"
  >
    &#x1F6E1;
  </text>
)}
```

Note: If the shield emoji doesn't render well in SVG, use a simple SVG path (small lock or shield shape) instead.

**Step 4: Run tests, verify pass, commit**

```bash
git add src/components/wizard/mini-map.tsx tests/components/wizard/mini-map.test.tsx
git commit -m "feat: add personal data shield icon to mini-map systems"
```

---

## Task 8: Add data and status contextual tips

**Files:**
- Modify: `src/components/wizard/tips.ts`
- Modify or create: `tests/unit/tips.test.ts`

**Step 1: Write failing tests**

```typescript
it('returns tip about personal data systems on data step', () => {
  const arch = { ...baseArch, dataCategories: [
    { id: 'd1', name: 'Clients', sensitivity: 'restricted', containsPersonalData: true, systemIds: ['s1'] },
  ]};
  const tip = getTip('/wizard/functions/data', arch);
  expect(tip).toMatch(/personal data/i);
});

it('returns tip about retiring systems on review step', () => {
  const arch = { ...baseArch, systems: [
    { id: 's1', name: 'Old CRM', type: 'crm', hosting: 'cloud', status: 'retiring', functionIds: ['f1'], serviceIds: [] },
  ]};
  const tip = getTip('/wizard/functions/review', arch);
  expect(tip).toMatch(/retiring/i);
});
```

**Step 2: Run to verify fails, then implement**

Add to the review section of `tips.ts`:
```typescript
const retiring = systems.filter((s) => s.status === 'retiring').length;
if (retiring > 0) {
  parts.push(`${retiring} retiring system${retiring === 1 ? '' : 's'} \u2014 have you planned replacements?`);
}
```

Add to data section:
```typescript
const personalSystems = new Set(
  dataCategories.filter((d) => d.containsPersonalData).flatMap((d) => d.systemIds)
);
if (personalSystems.size > 0) {
  return `${personalSystems.size} system${personalSystems.size === 1 ? '' : 's'} hold${personalSystems.size === 1 ? 's' : ''} personal data \u2014 check their security and compliance.`;
}
```

**Step 3: Run tests, verify pass, commit**

```bash
git add src/components/wizard/tips.ts tests/unit/tips.test.ts
git commit -m "feat: add contextual tips for personal data and retiring systems"
```

---

## Task 9: Add data categories section to ReviewSummary

**Files:**
- Modify: `src/components/wizard/review-summary.tsx`
- Modify: `tests/components/wizard/review-summary.test.tsx`

**Step 1: Write failing test**

```typescript
it('renders data categories section with sensitivity badges', () => {
  mockArchitecture.dataCategories = [
    { id: 'd1', name: 'Client records', sensitivity: 'confidential', containsPersonalData: true, systemIds: ['s1'] },
    { id: 'd2', name: 'Public content', sensitivity: 'public', containsPersonalData: false, systemIds: ['s2'] },
  ];
  render(<ReviewSummary />);
  expect(screen.getByRole('heading', { name: /data/i })).toBeInTheDocument();
  expect(screen.getByText('Client records')).toBeInTheDocument();
  expect(screen.getByText(/confidential/i)).toBeInTheDocument();
  expect(screen.getByText(/personal data/i)).toBeInTheDocument();
});
```

**Step 2: Run to verify fails, then implement**

Add a "Data" section to ReviewSummary (after systems section), rendering a table/list:

```tsx
{dataCategories.length > 0 && (
  <section className="space-y-3">
    <h2 className="text-lg font-semibold text-primary-900">Data</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-primary-600 border-b border-surface-200">
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Sensitivity</th>
            <th className="py-2 pr-4">Personal data</th>
            <th className="py-2">Systems</th>
          </tr>
        </thead>
        <tbody>
          {dataCategories.map((dc) => (
            <tr key={dc.id} className="border-b border-surface-100">
              <td className="py-2 pr-4 font-medium text-primary-900">{dc.name}</td>
              <td className="py-2 pr-4">
                <span className={sensitivityColor(dc.sensitivity)}>
                  {dc.sensitivity}
                </span>
              </td>
              <td className="py-2 pr-4">{dc.containsPersonalData ? 'Yes' : 'No'}</td>
              <td className="py-2 text-primary-600">
                {dc.systemIds.map((id) => systems.find((s) => s.id === id)?.name).filter(Boolean).join(', ') || 'None'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)}
```

Add a helper:
```typescript
const SENSITIVITY_COLORS: Record<string, string> = {
  public: 'text-green-700 bg-green-100',
  internal: 'text-blue-700 bg-blue-100',
  confidential: 'text-orange-700 bg-orange-100',
  restricted: 'text-red-700 bg-red-100',
};

function sensitivityColor(level: string): string {
  return `inline-block px-2 py-0.5 rounded text-xs font-medium ${SENSITIVITY_COLORS[level] ?? ''}`;
}
```

**Step 3: Run tests, verify pass, commit**

```bash
git add src/components/wizard/review-summary.tsx tests/components/wizard/review-summary.test.tsx
git commit -m "feat: add data categories section to review summary"
```

---

## Task 10: Add data flow diagram mode

**Files:**
- Modify: `src/lib/diagram/mermaid.ts`
- Modify: `src/components/views/diagram-view.tsx:21`
- Create: `tests/unit/mermaid-data-diagram.test.ts`

**Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { generateDataFlowDiagram } from '@/lib/diagram/mermaid';
import type { Architecture } from '@/lib/types';

describe('generateDataFlowDiagram', () => {
  it('generates Mermaid syntax with data categories as edge labels', () => {
    const arch: Architecture = {
      /* minimal arch with 2 systems, 1 integration, 1 data category */
      systems: [
        { id: 's1', name: 'CRM', type: 'crm', hosting: 'cloud', status: 'active', functionIds: [], serviceIds: [] },
        { id: 's2', name: 'Email', type: 'email', hosting: 'cloud', status: 'active', functionIds: [], serviceIds: [] },
      ],
      dataCategories: [
        { id: 'd1', name: 'Client contacts', sensitivity: 'confidential', containsPersonalData: true, systemIds: ['s1', 's2'] },
      ],
      integrations: [
        { id: 'i1', sourceSystemId: 's1', targetSystemId: 's2', type: 'api', direction: 'one_way', frequency: 'real_time', reliability: 'reliable' },
      ],
      // ...other required fields
    };
    const result = generateDataFlowDiagram(arch);
    expect(result).toContain('graph TB');
    expect(result).toContain('Client contacts');
    expect(result).toContain('s1');
    expect(result).toContain('s2');
  });
});
```

**Step 2: Run to verify fails**

**Step 3: Implement `generateDataFlowDiagram`**

In `src/lib/diagram/mermaid.ts`, add:

```typescript
export function generateDataFlowDiagram(arch: Architecture): string {
  const lines: string[] = ['graph TB'];

  // Systems as nodes
  for (const sys of arch.systems) {
    lines.push(`  ${sys.id}[${sanitiseLabel(sys.name)}]`);
  }

  // Style classes for sensitivity
  lines.push('  classDef public fill:#dcfce7,stroke:#16a34a');
  lines.push('  classDef internal fill:#dbeafe,stroke:#2563eb');
  lines.push('  classDef confidential fill:#ffedd5,stroke:#ea580c');
  lines.push('  classDef restricted fill:#fecaca,stroke:#dc2626');

  // Build map of integration edges to data categories
  const edgeData = new Map<string, string[]>();
  for (const dc of arch.dataCategories) {
    // Find integrations between systems that both hold this category
    for (const intg of arch.integrations) {
      if (dc.systemIds.includes(intg.sourceSystemId) && dc.systemIds.includes(intg.targetSystemId)) {
        const edgeKey = `${intg.sourceSystemId}-${intg.targetSystemId}`;
        const existing = edgeData.get(edgeKey) ?? [];
        existing.push(sanitiseLabel(dc.name));
        edgeData.set(edgeKey, existing);
      }
    }
  }

  // Render edges with data category labels
  for (const intg of arch.integrations) {
    const edgeKey = `${intg.sourceSystemId}-${intg.targetSystemId}`;
    const categories = edgeData.get(edgeKey);
    const label = categories ? categories.join(', ') : integrationLabel(intg.description, intg.type);

    if (intg.direction === 'two_way') {
      lines.push(`  ${intg.sourceSystemId} <-->|${label}| ${intg.targetSystemId}`);
    } else {
      lines.push(`  ${intg.sourceSystemId} -->|${label}| ${intg.targetSystemId}`);
    }
  }

  // Apply sensitivity classes to systems based on highest-sensitivity data they hold
  const systemSensitivity = new Map<string, string>();
  const sensitivityOrder = ['public', 'internal', 'confidential', 'restricted'];
  for (const dc of arch.dataCategories) {
    for (const sysId of dc.systemIds) {
      const current = systemSensitivity.get(sysId);
      if (!current || sensitivityOrder.indexOf(dc.sensitivity) > sensitivityOrder.indexOf(current)) {
        systemSensitivity.set(sysId, dc.sensitivity);
      }
    }
  }
  for (const [sysId, sensitivity] of systemSensitivity) {
    lines.push(`  class ${sysId} ${sensitivity}`);
  }

  return lines.join('\n');
}
```

**Step 4: Add 'data' to DiagramMode**

In `src/components/views/diagram-view.tsx:21`:
```typescript
type DiagramMode = 'full' | 'systems' | 'functions' | 'services' | 'data';
```

Add to `MODE_LABELS`:
```typescript
data: 'Data flow',
```

Add to the `useMemo` switch that generates diagram syntax:
```typescript
case 'data':
  return generateDataFlowDiagram(architecture);
```

Import `generateDataFlowDiagram` from `@/lib/diagram/mermaid`.

**Step 5: Run tests, verify pass, commit**

```bash
git add src/lib/diagram/mermaid.ts src/components/views/diagram-view.tsx tests/unit/mermaid-data-diagram.test.ts
git commit -m "feat: add data flow diagram mode with sensitivity colouring"
```

---

## Task 11: Add Mermaid status styling

**Files:**
- Modify: `src/lib/diagram/mermaid.ts`
- Modify: `tests/unit/mermaid-data-diagram.test.ts` (or create separate test)

**Step 1: Write failing test**

```typescript
it('applies planned class to planned systems in full diagram', () => {
  const arch = { /* ... with a planned system */ };
  const result = generateMermaidDiagram(arch);
  expect(result).toContain('classDef planned');
  expect(result).toContain('class s1 planned');
});
```

**Step 2: Implement status classes**

In `generateMermaidDiagram`, after all nodes/edges, add:

```typescript
// Status styling
lines.push('  classDef planned stroke-dasharray:5 5,opacity:0.7');
lines.push('  classDef retiring stroke-dasharray:5 5,fill:#e5e7eb,opacity:0.5');
lines.push('  classDef legacy fill:#d1d5db,opacity:0.6');

for (const sys of arch.systems) {
  if (sys.status !== 'active') {
    lines.push(`  class ${sys.id} ${sys.status}`);
  }
}
```

Apply same pattern to `generateSystemDiagram` and `generateFunctionDiagram`.

**Step 3: Run tests, verify pass, commit**

```bash
git add src/lib/diagram/mermaid.ts tests/unit/mermaid-status.test.ts
git commit -m "feat: add status-based styling to Mermaid diagrams"
```

---

## Task 12: Add services to mini-map as amber tags

**Files:**
- Modify: `src/components/wizard/mini-map.tsx`
- Modify: `tests/components/wizard/mini-map.test.tsx`

**Step 1: Write failing test**

```typescript
it('renders services as amber tags beneath their parent functions', () => {
  mockArchitecture.functions = [
    { id: 'f1', name: 'Service Delivery', type: 'service_delivery', isActive: true },
  ];
  mockArchitecture.services = [
    { id: 'svc1', name: 'Youth mentoring', status: 'active', functionIds: ['f1'], systemIds: [] },
  ];
  render(<MiniMap />);
  const tag = document.querySelector('[data-service-id="svc1"]');
  expect(tag).toBeTruthy();
  expect(tag?.textContent).toContain('Youth mentoring');
});
```

**Step 2: Run to verify fails, then implement**

Add service tags between function blocks and system nodes:
- Small rounded rectangles (pill shape) in amber (#fbbf24), positioned below the function block
- Smaller font (10px), max 15 chars with ellipsis
- Use `data-service-id` attribute

Place them in a row just below the function blocks, before the system area.

**Step 3: Run tests, verify pass, commit**

```bash
git add src/components/wizard/mini-map.tsx tests/components/wizard/mini-map.test.tsx
git commit -m "feat: render services as amber tags in mini-map"
```

---

## Task 13: Install PapaParse

**Step 1: Install**

```bash
npm install papaparse
npm install -D @types/papaparse
```

**Step 2: Verify build**

```bash
npm run typecheck
npm run build
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add papaparse for CSV import"
```

---

## Task 14: Create import validation logic

**Files:**
- Create: `src/lib/import/validate-json.ts`
- Create: `src/lib/import/parse-csv.ts`
- Create: `src/lib/import/index.ts`
- Create: `tests/unit/import-validate-json.test.ts`
- Create: `tests/unit/import-parse-csv.test.ts`

**Step 1: Write failing tests for JSON validation**

```typescript
import { describe, it, expect } from 'vitest';
import { validateArchitectureJson } from '@/lib/import/validate-json';

describe('validateArchitectureJson', () => {
  it('returns success for valid architecture JSON', () => {
    const validJson = JSON.stringify({
      organisation: { id: 'o1', name: 'Test Org', type: 'charity', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      functions: [],
      services: [],
      systems: [],
      dataCategories: [],
      integrations: [],
      owners: [],
      metadata: { version: '1', exportedAt: '2026-01-01', stackmapVersion: '0.1.0', mappingPath: 'function_first' },
    });
    const result = validateArchitectureJson(validJson);
    expect(result.success).toBe(true);
  });

  it('returns errors for invalid JSON string', () => {
    const result = validateArchitectureJson('not json at all');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/valid JSON/i);
  });

  it('returns specific Zod errors for wrong shape', () => {
    const result = validateArchitectureJson(JSON.stringify({ foo: 'bar' }));
    expect(result.success).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('strips computed fields like costSummary and overlaps', () => {
    const json = JSON.stringify({
      organisation: { id: 'o1', name: 'Test', type: 'charity', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      functions: [], services: [], systems: [], dataCategories: [], integrations: [], owners: [],
      metadata: { version: '1', exportedAt: '2026-01-01', stackmapVersion: '0.1.0', mappingPath: 'function_first' },
      costSummary: { totalAnnual: 5000 },
      overlaps: [],
      riskSummary: {},
    });
    const result = validateArchitectureJson(json);
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).costSummary).toBeUndefined();
    }
  });
});
```

**Step 2: Run to verify fails**

**Step 3: Implement `validate-json.ts`**

```typescript
import { ArchitectureSchema } from '@/lib/schema';
import type { Architecture } from '@/lib/types';

interface ValidationSuccess {
  success: true;
  data: Architecture;
}

interface ValidationFailure {
  success: false;
  error: string;
  errors?: string[];
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export function validateArchitectureJson(raw: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { success: false, error: 'This file isn\u2019t valid JSON.' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { success: false, error: 'Expected a JSON object.' };
  }

  // Strip computed fields that exports add
  const { costSummary, overlaps, riskSummary, ...rest } = parsed as Record<string, unknown>;

  const result = ArchitectureSchema.safeParse(rest);
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    return { success: false, error: 'This file doesn\u2019t match the Stackmap format.', errors };
  }

  return { success: true, data: result.data as Architecture };
}
```

**Step 4: Run tests, verify pass**

**Step 5: Write failing tests for CSV parsing**

```typescript
import { describe, it, expect } from 'vitest';
import { parseCsvSystems } from '@/lib/import/parse-csv';

describe('parseCsvSystems', () => {
  it('parses CSV with all columns', () => {
    const csv = `name,vendor,type,hosting,status,cost,cost_period,function
Salesforce,Salesforce,crm,cloud,active,1200,annual,fundraising`;
    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toBe('Salesforce');
      expect(result.rows[0].matchedType).toBe('crm');
      expect(result.rows[0].matchedFunction).toBe('fundraising');
    }
  });

  it('handles missing columns gracefully', () => {
    const csv = `name
"Our wiki"
Slack`;
    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows.length).toBe(2);
      expect(result.rows[0].vendor).toBeUndefined();
      expect(result.rows[0].matchedType).toBe('other');
    }
  });

  it('skips rows with no name', () => {
    const csv = `name,vendor
,Salesforce
Xero,Xero`;
    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows.length).toBe(1);
    }
  });

  it('fuzzy-matches system types', () => {
    const csv = `name,type
MyCRM,CRM
Accounting App,Finance`;
    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows[0].matchedType).toBe('crm');
      expect(result.rows[1].matchedType).toBe('finance');
    }
  });

  it('returns error for empty CSV', () => {
    const result = parseCsvSystems('');
    expect(result.success).toBe(false);
  });
});
```

**Step 6: Implement `parse-csv.ts`**

```typescript
import Papa from 'papaparse';
import type { SystemType, StandardFunction } from '@/lib/types';

const SYSTEM_TYPES: SystemType[] = [
  'crm', 'finance', 'hr', 'case_management', 'website', 'email',
  'document_management', 'database', 'spreadsheet', 'messaging', 'custom', 'other',
];

const STANDARD_FUNCTIONS: StandardFunction[] = [
  'finance', 'governance', 'people', 'fundraising', 'communications',
  'service_delivery', 'operations', 'data_reporting',
];

export interface CsvSystemRow {
  name: string;
  vendor?: string;
  type?: string;
  matchedType: SystemType;
  hosting?: string;
  status?: string;
  cost?: number;
  costPeriod?: string;
  function?: string;
  matchedFunction?: StandardFunction;
  completeness: 'full' | 'partial' | 'minimal';
}

interface CsvParseSuccess {
  success: true;
  rows: CsvSystemRow[];
  warnings: string[];
}

interface CsvParseFailure {
  success: false;
  error: string;
}

export type CsvParseResult = CsvParseSuccess | CsvParseFailure;

function fuzzyMatchType(raw: string): SystemType {
  const lower = raw.toLowerCase().trim();
  const exact = SYSTEM_TYPES.find((t) => t === lower);
  if (exact) return exact;

  const contains = SYSTEM_TYPES.find((t) => lower.includes(t) || t.includes(lower));
  if (contains) return contains;

  // Common aliases
  if (lower.includes('document') || lower.includes('doc')) return 'document_management';
  if (lower.includes('case') || lower.includes('client')) return 'case_management';
  if (lower.includes('chat') || lower.includes('message')) return 'messaging';
  if (lower.includes('web') || lower.includes('site')) return 'website';

  return 'other';
}

function fuzzyMatchFunction(raw: string): StandardFunction | undefined {
  const lower = raw.toLowerCase().trim();
  const exact = STANDARD_FUNCTIONS.find((f) => f === lower);
  if (exact) return exact;

  const underscored = lower.replace(/\s+/g, '_');
  const matchUnderscore = STANDARD_FUNCTIONS.find((f) => f === underscored);
  if (matchUnderscore) return matchUnderscore;

  // Common aliases
  if (lower.includes('finance') || lower.includes('account')) return 'finance';
  if (lower.includes('govern') || lower.includes('board')) return 'governance';
  if (lower.includes('people') || lower.includes('hr') || lower.includes('staff')) return 'people';
  if (lower.includes('fund') || lower.includes('donor')) return 'fundraising';
  if (lower.includes('comms') || lower.includes('market')) return 'communications';
  if (lower.includes('service') || lower.includes('deliver')) return 'service_delivery';
  if (lower.includes('ops') || lower.includes('operation')) return 'operations';
  if (lower.includes('data') || lower.includes('report')) return 'data_reporting';

  return undefined;
}

function computeCompleteness(row: CsvSystemRow): 'full' | 'partial' | 'minimal' {
  const fields = [row.vendor, row.type, row.cost, row.function].filter(Boolean);
  if (fields.length >= 3) return 'full';
  if (fields.length >= 1) return 'partial';
  return 'minimal';
}

export function parseCsvSystems(csvText: string): CsvParseResult {
  if (!csvText.trim()) {
    return { success: false, error: 'The file is empty.' };
  }

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return { success: false, error: `CSV parsing failed: ${parsed.errors[0].message}` };
  }

  const warnings: string[] = [];
  const rows: CsvSystemRow[] = [];

  for (const [index, raw] of parsed.data.entries()) {
    const name = (raw.name ?? raw.system ?? raw.tool ?? '').trim();
    if (!name) {
      warnings.push(`Row ${index + 2}: skipped (no name)`);
      continue;
    }

    const costRaw = raw.cost ?? raw.annual_cost ?? raw.price ?? '';
    const costNum = costRaw ? parseFloat(costRaw.replace(/[^0-9.]/g, '')) : undefined;

    const row: CsvSystemRow = {
      name,
      vendor: raw.vendor?.trim() || undefined,
      type: raw.type?.trim() || undefined,
      matchedType: raw.type ? fuzzyMatchType(raw.type) : 'other',
      hosting: raw.hosting?.trim() || undefined,
      status: raw.status?.trim() || undefined,
      cost: costNum && !isNaN(costNum) ? costNum : undefined,
      costPeriod: raw.cost_period?.trim() || raw.period?.trim() || undefined,
      function: raw.function?.trim() || raw.department?.trim() || undefined,
      matchedFunction: raw.function ? fuzzyMatchFunction(raw.function) : undefined,
      completeness: 'minimal',
    };
    row.completeness = computeCompleteness(row);
    rows.push(row);
  }

  if (rows.length === 0) {
    return { success: false, error: 'No valid rows found. Each row needs at least a name.' };
  }

  return { success: true, rows, warnings };
}
```

**Step 7: Create barrel export**

`src/lib/import/index.ts`:
```typescript
export { validateArchitectureJson } from './validate-json';
export type { ValidationResult } from './validate-json';
export { parseCsvSystems } from './parse-csv';
export type { CsvSystemRow, CsvParseResult } from './parse-csv';
```

**Step 8: Run all import tests, verify pass, commit**

```bash
git add src/lib/import/ tests/unit/import-validate-json.test.ts tests/unit/import-parse-csv.test.ts
git commit -m "feat: add JSON validation and CSV parsing for import"
```

---

## Task 15: Create ImportDialog component

**Files:**
- Create: `src/components/import/import-dialog.tsx`
- Create: `tests/components/import/import-dialog.test.tsx`

**Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ImportDialog } from '@/components/import/import-dialog';

describe('ImportDialog', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shows format picker with JSON and CSV options', () => {
    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.getByText(/json/i)).toBeInTheDocument();
    expect(screen.getByText(/csv/i)).toBeInTheDocument();
  });

  it('is not visible when open is false', () => {
    render(<ImportDialog open={false} onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape key', async () => {
    const onClose = vi.fn();
    render(<ImportDialog open onClose={onClose} onImport={vi.fn()} />);
    await userEvent.setup().keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
```

**Step 2: Run to verify fails**

**Step 3: Implement ImportDialog**

This is a modal dialog component with:

1. **Format picker** — two cards: "JSON (full architecture)" and "CSV (systems list)"
2. **File drop zone / picker** — `<input type="file" accept=".json,.csv">`
3. **Validation phase** — shows loading, then errors or preview
4. **JSON preview** — summary counts: "3 functions, 8 systems, 2 services..."
5. **CSV preview** — editable table (Task 16)
6. **Action buttons** — "Replace current data" / "Cancel"

Use a `<dialog>` element for native modal behavior (keyboard, focus trap).

The component manages internal state:
```typescript
type ImportStep = 'format' | 'file' | 'preview' | 'error';
```

Props:
```typescript
interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (arch: Architecture) => void;
}
```

Wire `validateArchitectureJson` and `parseCsvSystems` from `@/lib/import`.

**Step 4: Run tests, verify pass, commit**

```bash
git add src/components/import/ tests/components/import/
git commit -m "feat: add ImportDialog component with format picker and validation"
```

---

## Task 16: Create CSV preview table component

**Files:**
- Create: `src/components/import/csv-preview-table.tsx`
- Create: `tests/components/import/csv-preview-table.test.tsx`

**Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CsvPreviewTable } from '@/components/import/csv-preview-table';
import type { CsvSystemRow } from '@/lib/import';

const sampleRows: CsvSystemRow[] = [
  { name: 'Salesforce', vendor: 'Salesforce', type: 'crm', matchedType: 'crm', cost: 1200, matchedFunction: 'fundraising', function: 'fundraising', completeness: 'full' },
  { name: 'Wiki', matchedType: 'other', completeness: 'minimal' },
];

describe('CsvPreviewTable', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<CsvPreviewTable rows={sampleRows} onChange={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders all rows', () => {
    render(<CsvPreviewTable rows={sampleRows} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('Salesforce')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Wiki')).toBeInTheDocument();
  });

  it('highlights incomplete cells', () => {
    render(<CsvPreviewTable rows={sampleRows} onChange={vi.fn()} />);
    // Wiki row should have amber/empty styling on vendor cell
    const vendorCells = document.querySelectorAll('[data-row="1"][data-col="vendor"]');
    expect(vendorCells[0]?.classList.contains('bg-amber-50')).toBe(true);
  });

  it('allows editing a cell and calls onChange', async () => {
    const onChange = vi.fn();
    render(<CsvPreviewTable rows={sampleRows} onChange={onChange} />);
    const user = userEvent.setup();
    const nameInput = screen.getByDisplayValue('Wiki');
    await user.clear(nameInput);
    await user.type(nameInput, 'Internal Wiki');
    expect(onChange).toHaveBeenCalled();
  });
});
```

**Step 2: Run to verify fails**

**Step 3: Implement CsvPreviewTable**

Custom `<table>` with `<input>` elements in each cell:
- Name: text input (required)
- Vendor: text input
- Type: `<select>` dropdown of `SystemType` values (pre-selected from `matchedType`)
- Cost: number input
- Function: `<select>` dropdown of `StandardFunction` values (pre-selected from `matchedFunction`)

Cell styling:
- Green background (`bg-green-50`): value present and matched
- Amber background (`bg-amber-50`): value present but needs confirmation (fuzzy match)
- No special background: value missing (shows placeholder "Unknown")

Design note: Built as plain HTML table + inputs. If more features needed later (sorting, filtering, pagination, large datasets), consider AG Grid (MIT or enterprise) or TanStack Table (headless, MIT, lightweight).

Props:
```typescript
interface CsvPreviewTableProps {
  rows: CsvSystemRow[];
  onChange: (rows: CsvSystemRow[]) => void;
}
```

**Step 4: Run tests, verify pass, commit**

```bash
git add src/components/import/csv-preview-table.tsx tests/components/import/csv-preview-table.test.tsx
git commit -m "feat: add editable CSV preview table with completeness indicators"
```

---

## Task 17: Create CSV-to-Architecture converter

**Files:**
- Create: `src/lib/import/csv-to-architecture.ts`
- Create: `tests/unit/import-csv-to-architecture.test.ts`

**Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { csvRowsToArchitecture } from '@/lib/import/csv-to-architecture';
import type { CsvSystemRow } from '@/lib/import';

describe('csvRowsToArchitecture', () => {
  it('creates systems with IDs from rows', () => {
    const rows: CsvSystemRow[] = [
      { name: 'Xero', vendor: 'Xero', matchedType: 'finance', matchedFunction: 'finance', cost: 400, costPeriod: 'annual', completeness: 'full' },
    ];
    const arch = csvRowsToArchitecture(rows, 'Test Org', 'charity');
    expect(arch.systems.length).toBe(1);
    expect(arch.systems[0].name).toBe('Xero');
    expect(arch.systems[0].type).toBe('finance');
    expect(arch.systems[0].cost?.amount).toBe(400);
  });

  it('creates functions for matched standard functions', () => {
    const rows: CsvSystemRow[] = [
      { name: 'Xero', matchedType: 'finance', matchedFunction: 'finance', completeness: 'partial' },
      { name: 'QuickBooks', matchedType: 'finance', matchedFunction: 'finance', completeness: 'partial' },
    ];
    const arch = csvRowsToArchitecture(rows, 'Test Org', 'charity');
    // Should create ONE finance function, not two
    expect(arch.functions.length).toBe(1);
    expect(arch.functions[0].type).toBe('finance');
    // Both systems should reference that function
    expect(arch.systems[0].functionIds).toContain(arch.functions[0].id);
    expect(arch.systems[1].functionIds).toContain(arch.functions[0].id);
  });

  it('leaves systems unassigned when no function matched', () => {
    const rows: CsvSystemRow[] = [
      { name: 'Random Tool', matchedType: 'other', completeness: 'minimal' },
    ];
    const arch = csvRowsToArchitecture(rows, 'Test Org', 'charity');
    expect(arch.systems[0].functionIds).toEqual([]);
    expect(arch.functions.length).toBe(0);
  });

  it('uses sensible defaults for missing fields', () => {
    const rows: CsvSystemRow[] = [
      { name: 'Mystery Tool', matchedType: 'other', completeness: 'minimal' },
    ];
    const arch = csvRowsToArchitecture(rows, 'Test Org', 'charity');
    const sys = arch.systems[0];
    expect(sys.status).toBe('active');
    expect(sys.hosting).toBe('unknown');
    expect(sys.cost).toBeUndefined();
  });

  it('auto-scores TechFreedom when tool matches known tools', () => {
    const rows: CsvSystemRow[] = [
      { name: 'Salesforce', vendor: 'Salesforce', matchedType: 'crm', completeness: 'partial' },
    ];
    const arch = csvRowsToArchitecture(rows, 'Test Org', 'charity');
    expect(arch.systems[0].techFreedomScore).toBeDefined();
    expect(arch.systems[0].techFreedomScore?.isAutoScored).toBe(true);
  });
});
```

**Step 2: Run to verify fails**

**Step 3: Implement**

```typescript
import { v4 as uuid } from 'crypto';
import type { Architecture, System, OrgFunction, StandardFunction } from '@/lib/types';
import type { CsvSystemRow } from './parse-csv';
import { findMatchingTool } from '@/lib/techfreedom/match';

export function csvRowsToArchitecture(
  rows: CsvSystemRow[],
  orgName: string,
  orgType: Architecture['organisation']['type'],
): Architecture {
  const now = new Date().toISOString();

  // Deduplicate functions
  const functionMap = new Map<StandardFunction, OrgFunction>();
  for (const row of rows) {
    if (row.matchedFunction && !functionMap.has(row.matchedFunction)) {
      const FUNCTION_NAMES: Record<StandardFunction, string> = {
        finance: 'Finance', governance: 'Governance', people: 'People',
        fundraising: 'Fundraising', communications: 'Communications',
        service_delivery: 'Service delivery', operations: 'Operations',
        data_reporting: 'Data & reporting',
      };
      functionMap.set(row.matchedFunction, {
        id: crypto.randomUUID(),
        name: FUNCTION_NAMES[row.matchedFunction],
        type: row.matchedFunction,
        isActive: true,
      });
    }
  }

  const systems: System[] = rows.map((row) => {
    const fnId = row.matchedFunction ? functionMap.get(row.matchedFunction)?.id : undefined;
    const matchedTool = findMatchingTool(row.name, row.vendor);

    return {
      id: crypto.randomUUID(),
      name: row.name,
      type: row.matchedType,
      vendor: row.vendor,
      hosting: (row.hosting as System['hosting']) ?? 'unknown',
      status: (row.status as System['status']) ?? 'active',
      functionIds: fnId ? [fnId] : [],
      serviceIds: [],
      cost: row.cost ? {
        amount: row.cost,
        period: (row.costPeriod as 'monthly' | 'annual') ?? 'annual',
        model: 'subscription' as const,
      } : undefined,
      techFreedomScore: matchedTool?.score ? { ...matchedTool.score, isAutoScored: true } : undefined,
    };
  });

  return {
    organisation: {
      id: crypto.randomUUID(),
      name: orgName,
      type: orgType,
      createdAt: now,
      updatedAt: now,
    },
    functions: Array.from(functionMap.values()),
    services: [],
    systems,
    dataCategories: [],
    integrations: [],
    owners: [],
    metadata: {
      version: '1',
      exportedAt: now,
      stackmapVersion: '0.3.0',
      mappingPath: 'function_first',
    },
  };
}
```

**Step 4: Export from index, run tests, verify pass, commit**

```bash
git add src/lib/import/csv-to-architecture.ts src/lib/import/index.ts tests/unit/import-csv-to-architecture.test.ts
git commit -m "feat: add CSV-to-Architecture converter with auto-scoring"
```

---

## Task 18: Wire import into landing page and wizard

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/wizard/page.tsx`
- Modify: `src/hooks/useArchitecture.ts` (add `replaceArchitecture` method)

**Step 1: Write failing test**

Add to `tests/components/wizard/path-selector.test.tsx`:

```typescript
it('renders an import button', () => {
  render(<PathSelectorPage />);
  expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
});
```

**Step 2: Run to verify fails**

**Step 3: Add `replaceArchitecture` to useArchitecture hook**

In `src/hooks/useArchitecture.ts`, add to the context interface:
```typescript
replaceArchitecture: (arch: Architecture) => void;
```

Implement in provider:
```typescript
const replaceArchitecture = useCallback((arch: Architecture) => {
  setArchitecture(arch);
}, []);
```

**Step 4: Add Import button to landing page**

In `src/app/page.tsx`, add alongside the "Start mapping" link in the hero CTA area:

```tsx
<Link
  href="/wizard?import=true"
  className="btn-secondary text-base px-6 py-3 rounded-lg inline-flex items-center gap-2"
>
  Import existing data
</Link>
```

**Step 5: Add Import button and dialog to PathSelector**

In `src/app/wizard/page.tsx`:

1. Import `ImportDialog` component
2. Add state: `const [showImport, setShowImport] = useState(false)`
3. Check URL param on mount: if `?import=true`, open dialog
4. Add "Import" button near the path cards
5. Render `<ImportDialog>` with `onImport` wired to `replaceArchitecture`

**Step 6: Run tests, verify pass, commit**

```bash
git add src/app/page.tsx src/app/wizard/page.tsx src/hooks/useArchitecture.ts tests/components/wizard/path-selector.test.tsx
git commit -m "feat: wire import dialog into landing page and wizard"
```

---

## Task 19: Full integration test

**Files:**
- Create: `tests/integration/import-flow.test.tsx`

**Step 1: Write integration test**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Import flow', () => {
  it('imports a JSON file and loads data into wizard', async () => {
    // Render PathSelector with import dialog open
    // Create a mock File with valid architecture JSON
    // Upload via file input
    // Verify preview shows counts
    // Click "Replace"
    // Verify architecture context updated
  });

  it('imports a CSV file and shows editable preview', async () => {
    // Create a mock CSV File
    // Upload
    // Verify preview table renders with correct rows
    // Edit a cell
    // Click confirm
    // Verify systems created in architecture
  });

  it('shows validation errors for invalid JSON', async () => {
    // Upload invalid JSON file
    // Verify error message shown
  });
});
```

**Step 2: Implement tests with proper mocking**

**Step 3: Run tests, verify pass, commit**

```bash
git add tests/integration/import-flow.test.tsx
git commit -m "test: add integration tests for import flow"
```

---

## Task 20: Final verification

**Step 1: Run full test suite**

```bash
npx vitest run
```

**Step 2: Run lint and typecheck**

```bash
npm run lint
npm run typecheck
```

**Step 3: Run build**

```bash
npm run build
```

**Step 4: Manual verification checklist**

- [ ] Service form shows "What your organisation delivers" heading
- [ ] Beneficiaries field present and optional
- [ ] Mini-map shows shared systems in separate row with colour dots
- [ ] Mini-map shows status indicators (dashed for planned, grey for legacy)
- [ ] Mini-map shows personal data shield icon
- [ ] Mini-map shows service tags in amber
- [ ] MapStats shows shared systems count
- [ ] Review summary has Data section with sensitivity badges
- [ ] Contextual tips mention retiring systems and personal data
- [ ] Diagram view has "Data flow" mode
- [ ] Diagrams show status classes
- [ ] Import button visible on landing page and wizard
- [ ] JSON import validates and loads data
- [ ] CSV import parses, shows editable preview, creates systems
- [ ] Keyboard navigation works on all new elements
- [ ] No axe-core violations on any new/modified components

**Step 5: Commit any final fixes**

```bash
git commit -m "chore: final verification and cleanup"
```
