# Stackmap: Lightweight Architecture Mapping for Social Purpose Organisations

A product specification for Claude Code build.

---

## 1. Overview

### What this is

**Stackmap** is a lightweight, open source tool for mapping technical architecture in social purpose organisations (charities, social enterprises, local councils, VCSE organisations). It provides a common model for describing systems, integrations, and data flows — without requiring enterprise architecture expertise.

### The problem

GDS Local's "Sourcing the Stack" initiative found that councils have no common model for describing their technology. 54% already document architecture but use spreadsheets, which are limiting and hard to aggregate. The same is true — often worse — in the VCSE sector, where organisations rarely have dedicated technical staff and architectural knowledge lives in people's heads.

A shared model would enable:
- Single source of truth for applications, integrations, data, ownership
- Clearer impact analysis for investment and risk decisions
- Identification of duplication, overlap, underused systems
- Stronger alignment between services, capabilities, data, technology
- Better communication with non-technical stakeholders

But commercial enterprise architecture tools are:
- Expensive (often per-seat licensing)
- Complex (designed for enterprise architects, not operations managers)
- Overkill (features for compliance frameworks, TOGAF modelling, etc.)

### The opportunity

Build something radically simpler:
- One person with operational knowledge can complete it in an afternoon
- No enterprise architecture training required
- Produces a useful artefact immediately
- Can be aggregated for sector-wide insight
- Open source, self-hostable, zero vendor lock-in

### Target users

1. **Small charities / social enterprises** (primary): No IT team, technology decisions made by CEO or operations lead, systems chosen ad-hoc over years
2. **Medium VCSE organisations**: Might have a part-time IT person or outsourced support, want to get a grip on their stack before making changes
3. **Local councils** (secondary): Digital teams who want a lightweight tool for LGR transition planning, or who want to pilot before committing to enterprise tooling

---

## 2. Core Concepts

### The model

Stackmap uses a deliberately simple metamodel with six entity types:

```
┌─────────────┐
│  Function   │
│  (what we   │
│    do)      │
└──────┬──────┘
       │ supports
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Service   │────▶│   System    │────▶│    Data     │
│  (what we   │     │  (software  │     │  (what we   │
│   deliver)  │     │   we use)   │     │   hold)     │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ Integration │────▶│   Owner     │
                    │  (how they  │     │  (who is    │
                    │   connect)  │     │ responsible)│
                    └─────────────┘     └─────────────┘
```

**Function**: A core area of organisational activity (e.g., "Finance", "Governance", "Communications"). Functions are universal across organisation types — every org has finance, manages people, communicates. They provide a stable scaffold for mapping.

**Service**: A thing we deliver to users (e.g., "Advice sessions", "Grant distribution", "Housing repairs"). Services sit within functions and represent the user-facing work. Optional for organisations that don't think in service terms.

**System**: A piece of software we use (e.g., "Salesforce", "Xero", "Custom Access database", "Google Sheets")

**Data**: A category of information we hold (e.g., "Client records", "Financial transactions", "Case notes")

**Integration**: How two systems connect (e.g., "Zapier sync", "Manual CSV export/import", "API", "None — rekeyed")

**Owner**: A person or role responsible for a system (e.g., "Finance Manager", "CEO", "External IT support")

### Standard functions

These are pre-populated but users can add custom functions:

| Function | Description | Typical systems |
|----------|-------------|-----------------|
| **Finance** | Managing money in and out — accounts, payments, payroll | Xero, QuickBooks, Sage, spreadsheets |
| **Governance** | Board, trustees, compliance, policies, risk | Board portals, document storage, policy tools |
| **People** | Staff, volunteers, HR, rotas, recruitment | BreatheHR, Deputy, spreadsheets, rota tools |
| **Fundraising** | Generating income — donors, grants, trading | CRM, donation platforms, grant trackers |
| **Communications** | External comms, marketing, social media, newsletters | Mailchimp, Hootsuite, website CMS |
| **Service Delivery** | Core mission work — whatever the org exists to do | Case management, booking, referral systems |
| **Operations** | Day-to-day running — email, documents, collaboration | Microsoft 365, Google Workspace, Slack |
| **Data & Reporting** | MI, impact measurement, reporting to funders | BI tools, spreadsheets, impact platforms |

Functions serve two purposes:
1. **Entry point for mapping**: Users who struggle with "what services do you deliver?" can start with "which of these functions apply to you?"
2. **Cross-cutting tag**: Systems can be tagged with the functions they support, enabling function-based views of the architecture

### What makes this different

1. **Two entry points — functions or services**: Users who think in operational terms start with functions (Finance, Governance, etc.). Users who think in delivery terms start with services. Both paths lead to the same architecture map.

2. **Functions as universal scaffold**: Every organisation has finance, manages people, communicates — regardless of sector. Functions provide stable ground for users who can't articulate their "services."

3. **Integration honesty**: Most small orgs don't have APIs — they have "Sarah exports it on Tuesdays". Stackmap captures this reality.

4. **No TOGAF, no ArchiMate**: This isn't trying to be enterprise architecture. It's trying to be useful.

5. **Guided capture**: Wizard-style flow with plain-language questions, not a blank canvas.

---

## 3. User Experience

### Primary flow: Guided mapping

A wizard that takes the user through their architecture step by step, with a choice of entry point.

```
Step 0: Choose your path
"How would you like to map your technology?"

Option A: "Start with what we do" (Function-first)
  → Best for orgs that don't think in "services"
  → More structured, uses standard categories

Option B: "Start with what we deliver" (Service-first)  
  → Best for orgs with clear service offerings
  → More flexible, user-defined categories
```

**Path A: Function-first flow**

```
Step 1: Functions
"Which of these apply to your organisation?"
- Checkbox list of standard functions (Finance, Governance, People, etc.)
- Option to add custom functions
- Brief description shown for each

Step 2: Systems by function
"What software do you use for [Finance]?" (repeated per function)
- Add systems with name, type, vendor
- Systems can support multiple functions
- Include "custom/bespoke" and "spreadsheet" as explicit types
- Capture hosting (cloud/on-premise/don't know)

Step 3: Services (optional)
"Do you want to map specific services within these functions?"
- Skip option for orgs that don't need this level
- If yes: add services, link to functions and systems

Step 4: Data
"What kinds of data do these systems hold?"
- For each system, tag the data categories
- Pre-populated common categories + custom
- Flag sensitive data (personal, financial, safeguarding)

Step 5: Integrations
"How do your systems connect to each other?"
- Matrix view: System A × System B
- Options: "API/automated", "Scheduled export/import", "Manual copy", "No connection", "Don't know"
- Capture direction (one-way, two-way)

Step 6: Owners
"Who is responsible for each system?"
- Assign owner (person or role) to each system
- Capture: decision-maker, day-to-day admin, external support

Step 7: Review & Export
- Visual diagram of the architecture
- Table summary
- Export as JSON, Markdown, or image
```

**Path B: Service-first flow**

```
Step 1: Services
"What services does your organisation deliver?"
- Add each service with a name and brief description
- Examples shown for their sector type

Step 2: Systems
"What software do you use to deliver these services?"
- Add systems with name, type (CRM, Finance, etc.), and which services they support
- Include "custom/bespoke" and "spreadsheet" as explicit types
- Capture hosting (cloud/on-premise/don't know)

Step 3: Functions
"Which functions do these systems support?"
- Tag each system with one or more functions
- Pre-populated list, can add custom
- Helps categorise for later analysis

Step 4: Data
(same as Path A Step 4)

Step 5: Integrations
(same as Path A Step 5)

Step 6: Owners
(same as Path A Step 6)

Step 7: Review & Export
(same as Path A Step 7)
```

### Secondary flow: Quick capture

For users who just want to dump what they know:

- Single form with all fields visible
- Paste from spreadsheet support
- "I'll sort the connections later" mode

### Tertiary flow: Import existing

- CSV/spreadsheet import with column mapping
- JSON import (for migration from other tools)

### Views

1. **Diagram view**: Mermaid-based visualisation showing systems, connections, data flows
2. **Table view**: Spreadsheet-like grid for bulk editing
3. **Function view**: Which systems support which functions — good for spotting gaps and overlaps
4. **Service view**: Which systems support which services (if services are mapped)
5. **Risk view**: Highlights single points of failure, undocumented systems, manual integrations

---

## 4. Technical Specification

### Stack

**Frontend**: Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
**Storage**: Two options (user choice at setup)
  - GitHub: JSON files committed to a repo (version controlled, collaborative)
  - Local SQLite: Browser-based via sql.js (offline-first, single user)
**Diagrams**: Mermaid.js for rendering
**Forms**: React Hook Form + Zod validation
**Testing**: Vitest + React Testing Library + Playwright (e2e)
**Deployment**: Vercel / Netlify / self-hosted static export

### Why this stack

- **Next.js static export**: Can be hosted anywhere, including GitHub Pages. No server required for SQLite mode.
- **GitHub storage option**: Perfect for councils/orgs with existing GitHub presence. Provides audit trail, collaboration, PRs for changes.
- **SQLite option**: Works offline, data never leaves the browser, ideal for orgs concerned about cloud storage.
- **Mermaid**: Already used in many council documentation systems, renders on GitHub natively.

### Data schema

```typescript
// Core types
interface Organisation {
  id: string;
  name: string;
  type: 'charity' | 'social_enterprise' | 'council' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

// Standard functions — pre-populated, user can add custom
type StandardFunction = 
  | 'finance'
  | 'governance'
  | 'people'
  | 'fundraising'
  | 'communications'
  | 'service_delivery'
  | 'operations'
  | 'data_reporting';

interface OrgFunction {
  id: string;
  name: string;
  type: StandardFunction | 'custom';
  description?: string;
  isActive: boolean; // does this org perform this function?
}

interface Service {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'planned' | 'retiring';
  functionIds: string[]; // which functions this service sits within
}

interface System {
  id: string;
  name: string;
  type: SystemType;
  vendor?: string;
  hosting: 'cloud' | 'on_premise' | 'hybrid' | 'unknown';
  status: 'active' | 'planned' | 'retiring' | 'legacy';
  functionIds: string[]; // which functions it supports
  serviceIds: string[]; // which services it supports (optional)
  ownerId?: string;
  notes?: string;
  url?: string;
  cost?: {
    amount: number;
    period: 'monthly' | 'annual';
    model: 'subscription' | 'perpetual' | 'free' | 'unknown';
  };
}

type SystemType = 
  | 'crm' 
  | 'finance' 
  | 'hr' 
  | 'case_management'
  | 'website'
  | 'email'
  | 'document_management'
  | 'database'
  | 'spreadsheet'
  | 'messaging'
  | 'custom'
  | 'other';

interface DataCategory {
  id: string;
  name: string;
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  containsPersonalData: boolean;
  systemIds: string[]; // which systems hold this data
}

interface Integration {
  id: string;
  sourceSystemId: string;
  targetSystemId: string;
  type: 'api' | 'file_transfer' | 'manual' | 'webhook' | 'database_link' | 'unknown';
  direction: 'one_way' | 'two_way';
  frequency: 'real_time' | 'scheduled' | 'on_demand' | 'unknown';
  description?: string;
  reliability: 'reliable' | 'fragile' | 'unknown';
}

interface Owner {
  id: string;
  name: string;
  role?: string;
  isExternal: boolean; // e.g., outsourced IT
  contactInfo?: string;
}

// The complete architecture document
interface Architecture {
  organisation: Organisation;
  functions: OrgFunction[];
  services: Service[];
  systems: System[];
  dataCategories: DataCategory[];
  integrations: Integration[];
  owners: Owner[];
  metadata: {
    version: string;
    exportedAt: Date;
    stackmapVersion: string;
    mappingPath: 'function_first' | 'service_first'; // which wizard path was used
  };
}
```

### Storage adapters

```typescript
interface StorageAdapter {
  load(): Promise<Architecture>;
  save(arch: Architecture): Promise<void>;
  getHistory(): Promise<ArchitectureVersion[]>;
}

// GitHub adapter: commits JSON to repo
class GitHubStorageAdapter implements StorageAdapter { ... }

// SQLite adapter: stores in IndexedDB via sql.js
class SQLiteStorageAdapter implements StorageAdapter { ... }

// Export adapter: download as file (no persistence)
class ExportOnlyAdapter implements StorageAdapter { ... }
```

### API routes (for GitHub mode)

```
POST /api/auth/github     - OAuth flow
GET  /api/architecture    - Load from repo
POST /api/architecture    - Save to repo (creates commit)
GET  /api/architecture/history - List commits
```

---

## 5. Design System

Reference the `frontend-design` skill. Key requirements:

### Aesthetic direction

**Tone**: Warm, accessible, public-sector-appropriate. Not corporate SaaS. Not startup playful. Think: a well-designed government form that doesn't feel like a government form.

**Typography**: 
- Display: Something with character but highly legible (e.g., Source Serif Pro, Literata)
- Body: Clean sans-serif, not Inter (e.g., Atkinson Hyperlegible, Public Sans)

**Colour palette**:
- Primary: A deep, trustworthy blue-green (not the cliched purple gradient)
- Accents: Warm amber/orange for CTAs, muted sage for success states
- Backgrounds: Off-white and warm greys, not stark white
- Avoid: Red for anything except genuine errors

**Layout**:
- Generous whitespace
- Clear visual hierarchy
- Progressive disclosure — don't overwhelm with options
- Mobile-first (many small charity staff work from phones)

### Components needed

- Wizard stepper (clear progress, ability to jump back)
- Entity cards (Service, System, Data, etc.)
- Connection matrix
- Mermaid diagram container with zoom/pan
- Import/export modals
- Form fields with excellent validation UX
- Toast notifications
- Empty states with helpful prompts

### Accessibility

**Non-negotiable**:
- WCAG 2.1 AA compliance minimum
- Keyboard navigation throughout
- Screen reader compatible
- Focus indicators visible
- Colour contrast ratios met
- No information conveyed by colour alone
- Motion respects prefers-reduced-motion

**Testing**: Every component must pass axe-core automated checks + manual keyboard testing.

---

## 6. Development Approach

### TDD workflow

Reference the `tdd` skill. Every feature follows red/green/refactor:

```
1. Write failing test that describes desired behaviour
2. Run test, confirm it fails
3. Write minimal code to make test pass
4. Run test, confirm it passes
5. Refactor with confidence
6. Repeat
```

### Test categories

**Unit tests** (Vitest):
- Data transformations
- Validation logic
- Storage adapters (mocked)
- Mermaid diagram generation

**Component tests** (React Testing Library):
- Form behaviour
- Wizard flow
- Accessibility (axe-core integration)

**Integration tests** (Vitest + MSW):
- GitHub API interactions
- SQLite operations
- Import/export

**E2E tests** (Playwright):
- Complete wizard flow
- Storage round-trip
- Export functionality
- Cross-browser (Chromium, Firefox, Safari)

### Accessibility testing

Every component test includes:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

Plus Playwright tests with `@axe-core/playwright`:

```typescript
import AxeBuilder from '@axe-core/playwright';

test('wizard step 1 is accessible', async ({ page }) => {
  await page.goto('/wizard');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

---

## 7. File Structure

```
stackmap/
├── .claude/
│   ├── commands/
│   │   ├── catchup.md
│   │   ├── commit-push-pr.md
│   │   ├── handoff.md
│   │   ├── reflect.md
│   │   ├── review.md
│   │   ├── status.md
│   │   └── techdebt.md
│   ├── agents/
│   │   ├── code-reviewer.md
│   │   ├── code-simplifier.md
│   │   ├── plan-reviewer.md
│   │   └── verify-app.md
│   └── skills/
│       └── docs-updater/
│           └── SKILL.md
├── CLAUDE.md                 # Project config
├── CLAUDE.local.md           # Personal overrides (gitignored)
├── PLAN.md                   # Living plan with tasks
├── STATE.md                  # State diagram and status
├── MISTAKES.md               # Error log
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Landing/dashboard
│   │   ├── wizard/
│   │   │   ├── page.tsx      # Path selection (function-first vs service-first)
│   │   │   ├── functions/    # Function-first path
│   │   │   │   └── [step]/
│   │   │   │       └── page.tsx
│   │   │   ├── services/     # Service-first path
│   │   │   │   └── [step]/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── view/
│   │   │   ├── diagram/
│   │   │   ├── table/
│   │   │   ├── functions/    # Function-based view
│   │   │   ├── services/     # Service-based view
│   │   │   └── risk/
│   │   ├── settings/
│   │   └── api/
│   │       ├── auth/
│   │       │   └── github/
│   │       └── architecture/
│   ├── components/
│   │   ├── ui/               # Base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox-group.tsx
│   │   │   ├── stepper.tsx
│   │   │   └── ...
│   │   ├── wizard/           # Wizard-specific
│   │   │   ├── path-selector.tsx      # Choose function-first or service-first
│   │   │   ├── function-picker.tsx    # Standard functions checkbox list
│   │   │   ├── function-systems.tsx   # Systems per function
│   │   │   ├── service-form.tsx
│   │   │   ├── system-form.tsx
│   │   │   ├── data-form.tsx
│   │   │   ├── integration-matrix.tsx
│   │   │   ├── owner-form.tsx
│   │   │   └── review-summary.tsx
│   │   ├── views/            # View components
│   │   │   ├── diagram-view.tsx
│   │   │   ├── table-view.tsx
│   │   │   ├── function-view.tsx
│   │   │   ├── service-view.tsx
│   │   │   └── risk-view.tsx
│   │   └── layout/
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       └── footer.tsx
│   ├── lib/
│   │   ├── types.ts          # Core type definitions
│   │   ├── schema.ts         # Zod schemas
│   │   ├── functions.ts      # Standard functions data + helpers
│   │   ├── storage/
│   │   │   ├── adapter.ts    # Interface
│   │   │   ├── github.ts     # GitHub adapter
│   │   │   ├── sqlite.ts     # SQLite adapter
│   │   │   └── export.ts     # Export-only adapter
│   │   ├── diagram/
│   │   │   └── mermaid.ts    # Generate Mermaid syntax
│   │   ├── import/
│   │   │   ├── csv.ts
│   │   │   └── json.ts
│   │   └── export/
│   │       ├── json.ts
│   │       ├── markdown.ts
│   │       └── image.ts
│   ├── hooks/
│   │   ├── useArchitecture.ts
│   │   ├── useStorage.ts
│   │   └── useWizard.ts
│   └── styles/
│       └── globals.css
├── tests/
│   ├── unit/
│   │   ├── schema.test.ts
│   │   ├── functions.test.ts
│   │   ├── mermaid.test.ts
│   │   └── storage/
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── path-selector.test.tsx
│   │   │   ├── function-picker.test.tsx
│   │   │   └── ...
│   │   └── views/
│   ├── integration/
│   │   ├── github-storage.test.ts
│   │   └── sqlite-storage.test.ts
│   └── e2e/
│       ├── wizard-function-first.spec.ts
│       ├── wizard-service-first.spec.ts
│       ├── export.spec.ts
│       └── accessibility.spec.ts
├── public/
│   ├── examples/             # Example architectures
│   │   ├── small-charity.json
│   │   ├── social-enterprise.json
│   │   └── council-department.json
│   └── ...
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── next.config.js
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal**: Core data model, path selection, function-first basics, local storage

Tasks:
- [ ] Set up Next.js project with TypeScript, Tailwind, Vitest, Playwright
- [ ] Implement core types and Zod schemas including functions (TDD)
- [ ] Build standard functions data and helpers (TDD)
- [ ] Build SQLite storage adapter (TDD)
- [ ] Create base UI components (accessible from start)
- [ ] Build wizard shell with stepper and path selector
- [ ] Implement path selection: "Start with what we do" vs "Start with what we deliver"
- [ ] Implement function-first Step 1: Function picker (checkbox list)
- [ ] Implement function-first Step 2: Systems per function
- [ ] Basic save/load with SQLite

**Exit criteria**:
- User can select function-first path
- User can pick functions and add systems per function
- Data persists in browser
- All tests pass
- No accessibility violations

### Phase 2: Complete Wizard (Week 2)

**Goal**: Both wizard paths complete, all entity types

Tasks:
- [ ] Implement service-first path Step 1: Services form
- [ ] Implement service-first path Step 2: Systems form
- [ ] Implement service-first path Step 3: Function tagging
- [ ] Implement function-first Step 3: Services (optional)
- [ ] Implement shared Step: Data categories form
- [ ] Implement shared Step: Integration matrix
- [ ] Implement shared Step: Owners form
- [ ] Implement shared Step: Review summary
- [ ] Build Mermaid diagram generation (TDD)
- [ ] Basic diagram view
- [ ] JSON export

**Exit criteria**:
- Both wizard paths work end-to-end
- Diagram renders correctly showing functions and systems
- Export produces valid JSON
- All tests pass

### Phase 3: GitHub Storage (Week 3)

**Goal**: GitHub as a storage backend

Tasks:
- [ ] GitHub OAuth flow
- [ ] GitHub storage adapter (TDD)
- [ ] Repository selection/creation UI
- [ ] Commit on save with meaningful messages
- [ ] Version history view
- [ ] Handle conflicts gracefully

**Exit criteria**:
- User can authenticate with GitHub
- Architecture saves as commits
- History is viewable
- Works with existing repos

### Phase 4: Views & Polish (Week 4)

**Goal**: Multiple views, import, polish

Tasks:
- [ ] Table view with inline editing
- [ ] Function view (systems by function, spot gaps/overlaps)
- [ ] Service view (systems by service)
- [ ] Risk view (single points of failure, etc.)
- [ ] CSV import with column mapping
- [ ] Markdown export
- [ ] Image export (diagram as PNG)
- [ ] Empty states and onboarding
- [ ] Mobile responsiveness
- [ ] Performance optimisation

**Exit criteria**:
- All views work
- Import handles messy data gracefully
- Works well on mobile
- Lighthouse score > 90

### Phase 5: Examples & Documentation (Week 5)

**Goal**: Ready for real users

Tasks:
- [ ] Create example architectures for different org types
- [ ] Write user guide
- [ ] Write contributor guide
- [ ] Set up GitHub Pages demo
- [ ] Security review
- [ ] Accessibility audit (manual + automated)

**Exit criteria**:
- Demo site live
- Documentation complete
- No critical security issues
- WCAG 2.1 AA compliant

---

## 9. CLAUDE.md Configuration

This goes in the project's `CLAUDE.md` file to configure Claude Code:

```markdown
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
- Every component test includes accessibility check
- E2E tests for critical user journeys
- Aim for 80%+ coverage on lib/, 60%+ on components/

### Accessibility
- WCAG 2.1 AA minimum
- Test with keyboard before committing
- Include axe-core check in every component test
- Use semantic HTML elements
- Visible focus indicators

### Styling
- Tailwind utility classes
- No inline styles
- CSS variables for design tokens in globals.css
- Mobile-first responsive design

## Lessons Learned

(This section is populated from MISTAKES.md as patterns emerge)

- Don't skip the failing test step — even for "obvious" code
- Always check keyboard navigation after adding interactive elements
- Mermaid syntax is sensitive to special characters — sanitise node labels

## Verification

Before marking any task complete:
1. `npm run lint` passes
2. `npm run typecheck` passes
3. `npm run test` passes
4. Manual keyboard navigation check
5. Check Lighthouse accessibility score

## Current Focus

See PLAN.md for current phase and tasks.
```

---

## 10. Open Questions

Things to decide during build:

1. **Naming**: Is "Stackmap" the right name? Alternatives: "Techmap", "Archie", "Blueprint"

2. **Sector presets**: Should we have different starting templates for charities vs councils vs social enterprises? Or one universal flow?

3. **Collaboration**: For GitHub mode, should we support multiple people editing the same architecture? (PRs? Branch per person?)

4. **Aggregation**: Should there be a way to combine multiple organisations' architectures for sector-wide analysis? (This is the GDS use case but adds significant complexity)

5. **Hosting**: Should we provide a hosted version, or is self-host/GitHub Pages enough?

6. **LLM assistance**: Should there be an option to use Claude to help identify systems from a description? ("We use email, a CRM, and some spreadsheets" → suggested systems)

---

## 11. Success Metrics

How we know this is working:

**Immediate (during build)**:
- All tests pass
- No accessibility violations
- Can complete wizard in < 15 minutes

**Short-term (first users)**:
- User can produce a useful architecture diagram first time
- Export is immediately useful (can paste into a document, share with board)
- No critical bugs reported

**Medium-term (adoption)**:
- Organisations use it for actual decision-making
- Councils find it useful for LGR planning
- Other tools can import the JSON format

---

## 12. Related Work

- **GDS Local Sourcing the Stack**: The initiative this responds to
- **LGA Digital Maturity Assessment**: Complementary — architecture mapping feeds into maturity understanding
- **CAST State of the Sector**: Could aggregate Stackmap exports for sector-wide technology landscape
- **Open Referral UK (HSDS)**: Similar ethos of open standards for the sector

---

*Spec version: 1.0*
*Author: Tom Campbell Watson / The Good Ship*
*Date: March 2026*
