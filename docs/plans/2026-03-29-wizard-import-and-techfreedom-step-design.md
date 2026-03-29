# Wizard-Wide Import & TechFreedom Step Design

**Date:** 2026-03-29
**Status:** Approved

## 1. Wizard-Wide Import

**Problem:** Import is only available on the landing page and PathSelector. Once in the wizard, users can't import — but that's exactly when they realise they have a spreadsheet of tools.

**Solution:** Persistent "Import" button in the wizard layout header, visible on every step.

**Import modes:**
- `replace` — JSON and CSV from landing page / PathSelector. Full replacement of architecture.
- `merge` — CSV from within wizard steps. Adds systems to existing architecture:
  - New systems created and appended to `architecture.systems`
  - Functions created if they don't exist (matched by StandardFunction type); if they already exist, imported systems link to the existing function
  - Existing systems, services, data categories, integrations, owners are untouched
  - User stays on their current wizard step after import

**ImportDialog changes:**
- New prop: `mode: 'replace' | 'merge'`
- In merge mode, JSON option is hidden (merge only makes sense for CSV systems)
- In merge mode, button text changes from "Replace current data" to "Add N systems"

## 2. TechFreedom Wizard Step

**Problem:** TechFreedom toggle is a small switch in the header, easy to miss. Users who discover it mid-wizard don't get retroactive auto-scoring on previously added systems.

**Solution:** Dedicated wizard step at `/wizard/techfreedom`, inserted between PathSelector and first content step.

**Content:**
- Heading: "Do you want to assess technology risk?"
- Description: "TechFreedom scores help you understand vendor lock-in, surveillance risk, and data sovereignty across your tools. When enabled, Stackmap automatically scores known tools and highlights areas of concern."
- Two buttons: "Yes, include risk assessment" / "No, skip this"

**Behavior:**
- Sets `techFreedomEnabled` in architecture metadata
- Navigates to appropriate next step based on `metadata.mappingPath`
- Re-visiting shows current selection
- Back button returns to `/wizard`

**Stepper updates:**
- "Risk assessment" added as step 2 in both FUNCTION_FIRST_STEPS and SERVICE_FIRST_STEPS
- All subsequent steps shift by one

**Navigation updates:**
- PathSelector buttons navigate to `/wizard/techfreedom` instead of `/wizard/functions` or `/wizard/services`
- TechFreedom step navigates to `/wizard/functions` or `/wizard/services` based on mapping path
- Header toggle remains as secondary control

## Implementation Order

1. Add merge logic to csv-to-architecture (merge into existing architecture)
2. Update ImportDialog with mode prop
3. Add Import button to wizard layout
4. Create TechFreedom wizard step page
5. Update stepper with new step
6. Update PathSelector navigation
7. Tests and verification
