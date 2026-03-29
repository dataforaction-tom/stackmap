# Wizard-Wide Import & TechFreedom Step Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a persistent import button throughout the wizard (with CSV merge mode), and a dedicated TechFreedom step after org setup.

**Architecture:** Two independent features. Merge mode adds a `mergeCsvIntoArchitecture` function that appends systems to existing architecture. TechFreedom step is a new Next.js page at `/wizard/techfreedom` with stepper and navigation updates.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind, Vitest, Zod

---

## Task 1: Add `mergeCsvIntoArchitecture` function

**Files:**
- Modify: `src/lib/import/csv-to-architecture.ts`
- Modify: `src/lib/import/index.ts`
- Create: `tests/unit/import-merge-csv.test.ts`

**Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { mergeCsvIntoArchitecture } from '@/lib/import/csv-to-architecture';
import type { Architecture } from '@/lib/types';
import type { CsvSystemRow } from '@/lib/import';

const baseArch: Architecture = {
  organisation: { id: 'o1', name: 'Test Org', type: 'charity', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  functions: [{ id: 'f1', name: 'Finance', type: 'finance', isActive: true }],
  services: [],
  systems: [{ id: 's1', name: 'Xero', type: 'finance', hosting: 'cloud', status: 'active', functionIds: ['f1'], serviceIds: [] }],
  dataCategories: [],
  integrations: [],
  owners: [],
  metadata: { version: '1', exportedAt: '2026-01-01', stackmapVersion: '0.3.0', mappingPath: 'function_first' },
};

describe('mergeCsvIntoArchitecture', () => {
  it('appends new systems to existing architecture', () => {
    const rows: CsvSystemRow[] = [
      { name: 'Slack', matchedType: 'messaging', completeness: 'minimal' },
    ];
    const result = mergeCsvIntoArchitecture(rows, baseArch);
    expect(result.systems.length).toBe(2);
    expect(result.systems[0].name).toBe('Xero'); // existing preserved
    expect(result.systems[1].name).toBe('Slack'); // new added
  });

  it('reuses existing function when type matches', () => {
    const rows: CsvSystemRow[] = [
      { name: 'QuickBooks', matchedType: 'finance', matchedFunction: 'finance', completeness: 'partial' },
    ];
    const result = mergeCsvIntoArchitecture(rows, baseArch);
    expect(result.functions.length).toBe(1); // no new function
    expect(result.systems[1].functionIds).toContain('f1'); // linked to existing
  });

  it('creates new function when type does not exist', () => {
    const rows: CsvSystemRow[] = [
      { name: 'Mailchimp', matchedType: 'email', matchedFunction: 'communications', completeness: 'partial' },
    ];
    const result = mergeCsvIntoArchitecture(rows, baseArch);
    expect(result.functions.length).toBe(2);
    expect(result.functions[1].type).toBe('communications');
  });

  it('preserves all existing data untouched', () => {
    const rows: CsvSystemRow[] = [
      { name: 'Slack', matchedType: 'messaging', completeness: 'minimal' },
    ];
    const result = mergeCsvIntoArchitecture(rows, baseArch);
    expect(result.organisation).toEqual(baseArch.organisation);
    expect(result.services).toEqual(baseArch.services);
    expect(result.dataCategories).toEqual(baseArch.dataCategories);
    expect(result.integrations).toEqual(baseArch.integrations);
    expect(result.owners).toEqual(baseArch.owners);
  });

  it('auto-scores known tools via TechFreedom', () => {
    const rows: CsvSystemRow[] = [
      { name: 'Salesforce', vendor: 'Salesforce', matchedType: 'crm', completeness: 'partial' },
    ];
    const result = mergeCsvIntoArchitecture(rows, baseArch);
    const newSys = result.systems.find((s) => s.name === 'Salesforce');
    expect(newSys?.techFreedomScore).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/import-merge-csv.test.ts`
Expected: FAIL — `mergeCsvIntoArchitecture` not exported.

**Step 3: Implement**

In `src/lib/import/csv-to-architecture.ts`, add below the existing `csvRowsToArchitecture`:

```typescript
export function mergeCsvIntoArchitecture(
  rows: CsvSystemRow[],
  existing: Architecture,
): Architecture {
  const now = new Date().toISOString();

  // Build map of existing functions by type for reuse
  const existingFunctionsByType = new Map(
    existing.functions.map((fn) => [fn.type, fn]),
  );

  // Find new functions needed
  const newFunctions: OrgFunction[] = [];
  const functionIdByType = new Map<string, string>();

  // Populate with existing
  for (const fn of existing.functions) {
    functionIdByType.set(fn.type, fn.id);
  }

  for (const row of rows) {
    if (row.matchedFunction && !functionIdByType.has(row.matchedFunction)) {
      const fn: OrgFunction = {
        id: uuidv4(),
        name: FUNCTION_NAMES[row.matchedFunction] ?? row.matchedFunction,
        type: row.matchedFunction,
        isActive: true,
      };
      newFunctions.push(fn);
      functionIdByType.set(row.matchedFunction, fn.id);
    }
  }

  // Create new systems
  const newSystems: System[] = rows.map((row) => {
    const fnId = row.matchedFunction
      ? functionIdByType.get(row.matchedFunction)
      : undefined;
    const matchedTool = findMatchingTool(row.name, KNOWN_TOOLS);

    return {
      id: uuidv4(),
      name: row.name,
      type: row.matchedType,
      vendor: row.vendor,
      hosting: (row.hosting as System['hosting']) ?? 'unknown',
      status: (row.status as System['status']) ?? 'active',
      functionIds: fnId ? [fnId] : [],
      serviceIds: [],
      cost: row.cost
        ? {
            amount: row.cost,
            period: (row.costPeriod === 'monthly' ? 'monthly' : 'annual') as 'monthly' | 'annual',
            model: 'subscription' as const,
          }
        : undefined,
      techFreedomScore: matchedTool?.score
        ? { ...matchedTool.score, isAutoScored: true }
        : undefined,
    };
  });

  return {
    ...existing,
    organisation: { ...existing.organisation, updatedAt: now },
    functions: [...existing.functions, ...newFunctions],
    systems: [...existing.systems, ...newSystems],
  };
}
```

**Step 4: Add export to barrel**

In `src/lib/import/index.ts`, add:
```typescript
export { csvRowsToArchitecture, mergeCsvIntoArchitecture } from './csv-to-architecture';
```

**Step 5: Run tests, verify pass, commit**

```bash
git add src/lib/import/csv-to-architecture.ts src/lib/import/index.ts tests/unit/import-merge-csv.test.ts
git commit -m "feat: add mergeCsvIntoArchitecture for CSV merge import"
```

---

## Task 2: Update ImportDialog with mode prop

**Files:**
- Modify: `src/components/import/import-dialog.tsx`
- Modify: `tests/components/import/import-dialog.test.tsx`

**Step 1: Write failing tests**

Add to the test file:

```typescript
describe('merge mode', () => {
  it('hides JSON option in merge mode', () => {
    render(<ImportDialog open mode="merge" onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.queryByText(/json/i)).not.toBeInTheDocument();
    // Should go straight to CSV file step
    expect(screen.getByText(/select a .csv file/i)).toBeInTheDocument();
  });

  it('shows "Add N systems" button text in merge mode', async () => {
    const csv = `name\nSlack\nZoom`;
    const file = new File([csv], 'tools.csv', { type: 'text/csv' });
    render(<ImportDialog open mode="merge" onClose={vi.fn()} onImport={vi.fn()} />);
    const user = userEvent.setup();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    expect(await screen.findByRole('button', { name: /add 2 systems/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify fails**

**Step 3: Implement**

1. Add `mode` to `ImportDialogProps`:
```typescript
export interface ImportDialogProps {
  open: boolean;
  mode?: 'replace' | 'merge';
  onClose: () => void;
  onImport: (arch: Architecture) => void;
}
```

2. Default `mode` to `'replace'`.

3. In merge mode:
   - Skip the format step — go directly to the file step with `format='csv'`
   - In the reset effect, set step to `'file'` instead of `'format'` when mode is merge
   - Hide JSON format card in FormatStep (or skip FormatStep entirely)

4. Pass `mode` to `CsvPreviewStep`. In merge mode, change button text from "Import N systems" to "Add N systems".

5. In the CSV import handler, when `mode === 'merge'`, the parent (`onImport`) will handle calling `mergeCsvIntoArchitecture` instead of `csvRowsToArchitecture`. So `ImportDialog` itself doesn't need to know about the merge logic — it just passes rows via a different callback.

   Actually, simpler: change `onImport` for CSV to pass the rows array, and let the parent decide. But that changes the API. Instead, keep it simpler:

   Add an `onMergeCsv?: (rows: CsvSystemRow[]) => void` prop. In merge mode, the CSV import button calls `onMergeCsv(rows)` instead of `onImport(csvRowsToArchitecture(...))`.

**Step 4: Run tests, verify pass, commit**

```bash
git add src/components/import/import-dialog.tsx tests/components/import/import-dialog.test.tsx
git commit -m "feat: add merge mode to ImportDialog"
```

---

## Task 3: Add import button to wizard layout

**Files:**
- Modify: `src/app/wizard/layout.tsx`
- Create: `tests/components/wizard/wizard-layout.test.tsx` (minimal)

**Step 1: Write failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock all dependencies
vi.mock('@/hooks/useArchitecture', () => ({
  ArchitectureProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useArchitecture: () => ({
    architecture: { /* minimal arch */ },
    replaceArchitecture: vi.fn(),
    // ... other needed mocks
  }),
}));

// Mock components that need context
vi.mock('@/components/wizard/stepper', () => ({
  Stepper: () => <nav data-testid="stepper" />,
}));
vi.mock('@/components/techfreedom/toggle', () => ({
  TechFreedomToggle: () => <div data-testid="toggle" />,
}));
vi.mock('@/components/wizard/live-map-sidebar', () => ({
  LiveMapSidebar: () => <div data-testid="sidebar" />,
}));

import WizardLayout from '@/app/wizard/layout';

describe('WizardLayout', () => {
  it('renders an import button', () => {
    render(<WizardLayout><div>child</div></WizardLayout>);
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify fails**

**Step 3: Implement**

Modify `src/app/wizard/layout.tsx`:

1. Add `'use client'` is already there.
2. Import `useState` from react.
3. Import `ImportDialog` from `@/components/import/import-dialog`.
4. Import `useArchitecture` (the layout already wraps in `ArchitectureProvider`, but we need a child component to use the hook — or we restructure slightly).

Since the layout wraps children in `ArchitectureProvider`, a component inside the layout can use `useArchitecture`. Create a small `WizardHeader` component inline:

```tsx
function WizardHeader() {
  const { architecture, replaceArchitecture } = useArchitecture();
  const [showImport, setShowImport] = useState(false);

  const handleMergeCsv = useCallback((rows: CsvSystemRow[]) => {
    if (!architecture) return;
    const merged = mergeCsvIntoArchitecture(rows, architecture);
    replaceArchitecture(merged);
    setShowImport(false);
  }, [architecture, replaceArchitecture]);

  return (
    <>
      <header className="border-b border-surface-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-3xl mx-auto px-4 pt-2">
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="text-sm px-3 py-1.5 rounded-lg border border-surface-300 text-primary-700 hover:bg-surface-50 transition-colors"
          >
            Import
          </button>
        </div>
        <Stepper />
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <TechFreedomToggle />
        </div>
      </header>
      <ImportDialog
        open={showImport}
        mode="merge"
        onClose={() => setShowImport(false)}
        onImport={(arch) => {
          replaceArchitecture(arch);
          setShowImport(false);
        }}
        onMergeCsv={handleMergeCsv}
      />
    </>
  );
}
```

Update the layout to use `WizardHeader` inside the provider.

**Step 4: Run tests, verify pass, commit**

```bash
git add src/app/wizard/layout.tsx tests/components/wizard/wizard-layout.test.tsx
git commit -m "feat: add persistent import button to wizard layout"
```

---

## Task 4: Create TechFreedom wizard step page

**Files:**
- Create: `src/app/wizard/techfreedom/page.tsx`
- Create: `tests/components/wizard/techfreedom-step.test.tsx`

**Step 1: Write failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/wizard/techfreedom',
}));

const setTechFreedomEnabledMock = vi.fn();
vi.mock('@/hooks/useArchitecture', () => ({
  useArchitecture: () => ({
    architecture: {
      metadata: { mappingPath: 'function_first', techFreedomEnabled: false },
    },
    setTechFreedomEnabled: setTechFreedomEnabledMock,
  }),
}));

import TechFreedomStep from '@/app/wizard/techfreedom/page';

describe('TechFreedomStep', () => {
  beforeEach(() => vi.clearAllMocks());

  it('has no accessibility violations', async () => {
    const { container } = render(<TechFreedomStep />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders heading about technology risk', () => {
    render(<TechFreedomStep />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/technology risk/i);
  });

  it('shows yes and no buttons', () => {
    render(<TechFreedomStep />);
    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();
  });

  it('enables TechFreedom and navigates to functions on yes', async () => {
    const user = userEvent.setup();
    render(<TechFreedomStep />);
    await user.click(screen.getByRole('button', { name: /yes/i }));
    expect(setTechFreedomEnabledMock).toHaveBeenCalledWith(true);
    expect(pushMock).toHaveBeenCalledWith('/wizard/functions');
  });

  it('disables TechFreedom and navigates to functions on no', async () => {
    const user = userEvent.setup();
    render(<TechFreedomStep />);
    await user.click(screen.getByRole('button', { name: /no/i }));
    expect(setTechFreedomEnabledMock).toHaveBeenCalledWith(false);
    expect(pushMock).toHaveBeenCalledWith('/wizard/functions');
  });

  it('navigates to services path when mappingPath is service_first', async () => {
    // Override mock to return service_first
    vi.mocked(useArchitecture).mockReturnValueOnce({
      architecture: { metadata: { mappingPath: 'service_first', techFreedomEnabled: false } },
      setTechFreedomEnabled: setTechFreedomEnabledMock,
    } as any);
    const user = userEvent.setup();
    render(<TechFreedomStep />);
    await user.click(screen.getByRole('button', { name: /yes/i }));
    expect(pushMock).toHaveBeenCalledWith('/wizard/services');
  });

  it('highlights yes button when TechFreedom is already enabled', () => {
    vi.mocked(useArchitecture).mockReturnValueOnce({
      architecture: { metadata: { mappingPath: 'function_first', techFreedomEnabled: true } },
      setTechFreedomEnabled: setTechFreedomEnabledMock,
    } as any);
    render(<TechFreedomStep />);
    const yesBtn = screen.getByRole('button', { name: /yes/i });
    expect(yesBtn.className).toContain('border-primary');
  });
});
```

**Step 2: Run to verify fails**

**Step 3: Implement the page**

Create `src/app/wizard/techfreedom/page.tsx`:

```tsx
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useArchitecture } from '@/hooks/useArchitecture';

export default function TechFreedomStepPage() {
  const router = useRouter();
  const { architecture, setTechFreedomEnabled } = useArchitecture();

  const mappingPath = architecture?.metadata?.mappingPath ?? 'function_first';
  const enabled = architecture?.metadata?.techFreedomEnabled ?? false;
  const nextPath = mappingPath === 'service_first' ? '/wizard/services' : '/wizard/functions';

  const handleYes = useCallback(() => {
    setTechFreedomEnabled(true);
    router.push(nextPath);
  }, [setTechFreedomEnabled, router, nextPath]);

  const handleNo = useCallback(() => {
    setTechFreedomEnabled(false);
    router.push(nextPath);
  }, [setTechFreedomEnabled, router, nextPath]);

  if (!architecture) {
    return (
      <div className="flex items-center justify-center py-12" role="status">
        <p className="text-primary-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary-900">
          Do you want to assess technology risk?
        </h1>
        <p className="text-lg text-primary-700 leading-relaxed">
          TechFreedom scores help you understand vendor lock-in, surveillance risk,
          and data sovereignty across your tools. When enabled, Stackmap automatically
          scores known tools and highlights areas of concern.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleYes}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors
            ${enabled
              ? 'bg-primary-600 text-white border-2 border-primary-600'
              : 'border-2 border-surface-300 text-primary-700 hover:border-primary-400 hover:bg-primary-50'}
          `}
        >
          Yes, include risk assessment
        </button>
        <button
          type="button"
          onClick={handleNo}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors
            ${!enabled && architecture.metadata.techFreedomEnabled !== undefined
              ? 'bg-surface-200 text-primary-800 border-2 border-surface-300'
              : 'border-2 border-surface-300 text-primary-700 hover:border-primary-400 hover:bg-primary-50'}
          `}
        >
          No, skip this
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-surface-200">
        <Link
          href="/wizard"
          className="btn-secondary inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </Link>
      </div>
    </div>
  );
}
```

**Step 4: Run tests, verify pass, commit**

```bash
git add src/app/wizard/techfreedom/page.tsx tests/components/wizard/techfreedom-step.test.tsx
git commit -m "feat: add TechFreedom wizard step page"
```

---

## Task 5: Update stepper with TechFreedom step

**Files:**
- Modify: `src/components/wizard/stepper.tsx:11-31`
- Modify: `tests/components/wizard/stepper.test.tsx`

**Step 1: Write failing test**

```typescript
it('includes risk assessment step as step 2 in function-first path', () => {
  mockPathname = '/wizard/techfreedom';
  render(<Stepper />);
  expect(screen.getByText('Risk assessment')).toBeInTheDocument();
  expect(screen.getByText('Risk assessment').closest('[aria-current="step"]')).toBeTruthy();
});
```

**Step 2: Run to verify fails**

**Step 3: Update step arrays**

In `src/components/wizard/stepper.tsx`, update both arrays:

```typescript
const FUNCTION_FIRST_STEPS: Step[] = [
  { label: 'Choose path', path: '/wizard' },
  { label: 'Risk assessment', path: '/wizard/techfreedom' },
  { label: 'Functions', path: '/wizard/functions' },
  { label: 'Systems', path: '/wizard/functions/systems' },
  { label: 'Services', path: '/wizard/functions/services' },
  { label: 'Data', path: '/wizard/functions/data' },
  { label: 'Integrations', path: '/wizard/functions/integrations' },
  { label: 'Owners', path: '/wizard/functions/owners' },
  { label: 'Review', path: '/wizard/functions/review' },
];

const SERVICE_FIRST_STEPS: Step[] = [
  { label: 'Choose path', path: '/wizard' },
  { label: 'Risk assessment', path: '/wizard/techfreedom' },
  { label: 'Services', path: '/wizard/services' },
  { label: 'Systems', path: '/wizard/services/systems' },
  { label: 'Functions', path: '/wizard/services/functions' },
  { label: 'Data', path: '/wizard/services/data' },
  { label: 'Integrations', path: '/wizard/services/integrations' },
  { label: 'Owners', path: '/wizard/services/owners' },
  { label: 'Review', path: '/wizard/services/review' },
];
```

Note: The stepper uses pathname-based step detection. `/wizard/techfreedom` is not under `/wizard/services`, so it will naturally use the function-first steps. For the service-first case, we need the stepper to detect the mapping path. Currently it checks `pathname.startsWith('/wizard/services')`. Since `/wizard/techfreedom` doesn't start with that, it will always show function-first steps on the TechFreedom page regardless.

This is acceptable because the TechFreedom step is the same in both paths — only the "next step" label differs. If needed later, the stepper could read `mappingPath` from context.

**Step 4: Update existing stepper tests** that reference step positions/counts.

**Step 5: Run tests, verify pass, commit**

```bash
git add src/components/wizard/stepper.tsx tests/components/wizard/stepper.test.tsx
git commit -m "feat: add risk assessment to wizard stepper"
```

---

## Task 6: Update PathSelector navigation

**Files:**
- Modify: `src/app/wizard/page.tsx`
- Modify: `tests/components/wizard/path-selector.test.tsx`

**Step 1: Write failing test**

```typescript
it('links function-first path to /wizard/techfreedom', () => {
  render(<PathSelectorPage />);
  const link = screen.getByRole('link', { name: /start with what we do/i });
  expect(link).toHaveAttribute('href', '/wizard/techfreedom');
});

it('links service-first path to /wizard/techfreedom', () => {
  render(<PathSelectorPage />);
  const link = screen.getByRole('link', { name: /start with what we use/i });
  expect(link).toHaveAttribute('href', '/wizard/techfreedom');
});
```

**Step 2: Run to verify fails** — links currently point to `/wizard/functions` and `/wizard/services`.

**Step 3: Update navigation links**

In `src/app/wizard/page.tsx`:

1. Change the function-first `<Link href="/wizard/functions">` to `<Link href="/wizard/techfreedom">`
2. Change the service-first `<Link href="/wizard/services">` to `<Link href="/wizard/techfreedom">`
3. Both paths need to store which mapping path was chosen BEFORE navigating. Currently the mapping path is set... let me check.

Actually, looking at the code, the path selection cards are just `<Link>` elements. The `mappingPath` in metadata is likely set by the first page of each path. We need to set it when the user clicks a path card, BEFORE navigating to `/wizard/techfreedom`.

Options:
- Store mapping path via click handler before navigation
- Use query param: `/wizard/techfreedom?path=function_first`
- Set mapping path on the PathSelector page when clicking

Best approach: convert the Link elements to buttons with click handlers that:
1. Call `updateOrganisation` or a metadata update to set `mappingPath`
2. Then navigate to `/wizard/techfreedom`

In `src/app/wizard/page.tsx`, replace the Link elements with buttons:

```tsx
<button
  type="button"
  onClick={() => {
    // Set mapping path in architecture metadata
    setMappingPath('function_first');
    router.push('/wizard/techfreedom');
  }}
  className={/* same styles */}
>
```

Need to check if there's a `setMappingPath` method. Looking at the hook, there isn't one directly. The metadata is part of architecture. We could add a simple helper or set it via a more general update.

Simplest: add it via the existing architecture update pattern. In `useArchitecture.ts`, the `setTechFreedomEnabled` modifies `metadata`. We could either:
- Add a `setMappingPath` method to the hook
- Or set it inline when the user picks a path

Let's keep it simple and just update the architecture inline in the PathSelector. The PathSelector already has access to `architecture` via the hook. We can spread the architecture and update metadata.mappingPath. But there's no generic `updateMetadata` method.

Simplest fix: use `replaceArchitecture` to set the mapping path:

```typescript
const handlePathSelect = (path: 'function_first' | 'service_first') => {
  if (architecture) {
    replaceArchitecture({
      ...architecture,
      metadata: { ...architecture.metadata, mappingPath: path },
    });
  }
  router.push('/wizard/techfreedom');
};
```

**Step 4: Remove the TechFreedomToggle from the wizard layout header**

Since TechFreedom is now a dedicated step, remove it from the layout header to avoid confusion. The toggle was in `src/app/wizard/layout.tsx`:

```tsx
<div className="max-w-3xl mx-auto px-4 pb-3">
  <TechFreedomToggle />
</div>
```

Remove this block. The TechFreedom toggle import can stay or be removed.

**Step 5: Run tests, verify pass, commit**

```bash
git add src/app/wizard/page.tsx src/app/wizard/layout.tsx tests/components/wizard/path-selector.test.tsx
git commit -m "feat: route path selection through TechFreedom step"
```

---

## Task 7: Tests and verification

**Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass (except pre-existing cost-estimates failure).

**Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Fix any new type errors introduced.

**Step 3: Manual verification**

- [ ] Landing page has "Import existing data" link
- [ ] Wizard PathSelector has "Import" button
- [ ] Selecting a path goes to `/wizard/techfreedom` first
- [ ] TechFreedom step shows yes/no, navigates to correct next step
- [ ] Stepper shows "Risk assessment" as step 2
- [ ] TechFreedom toggle removed from wizard header
- [ ] Import button visible on all wizard steps (in header)
- [ ] Wizard import opens in merge mode (CSV only, no JSON option)
- [ ] CSV merge adds systems without replacing existing data
- [ ] Keyboard navigation works on TechFreedom step

**Step 4: Commit any fixes**

```bash
git commit -m "chore: final verification and fixes for wizard import and TechFreedom step"
```
