# Data Flow Review & Import Design

**Date:** 2026-03-29
**Status:** Approved
**Approach:** Model cleanup first, then import (Approach B)

## Context

Full review of Stackmap's data flow, UX, sidebar map, and service connections revealed several gaps. This design addresses them systematically, then adds import capabilities on a clean foundation.

## 1. Service Clarity

**Problem:** Services are ambiguous — users don't know if they mean software services or organisational activities. They're labelled "optional" and underexplained.

**Definition:** A Service is something your organisation delivers to beneficiaries or customers — e.g. "Youth mentoring", "Emergency food parcels", "Business advice". Systems *support* services; functions *govern* them.

**Type change:** Add `beneficiaries?: string` field to `Service`.

**UI changes:**
- Wizard heading: "Services" → "What your organisation delivers"
- Subheading: "These are the things you do for your beneficiaries or customers — not software services"
- New "Who is this for?" text field on service form
- Service cards show: name, beneficiaries, linked functions, linked systems
- Promoted from "optional" to "recommended" with "Skip for now" option

**Map:** Services appear as small amber/yellow tags beneath their parent functions in the sidebar mini-map.

**Diagrams:** New services subgraph layer in Mermaid, showing services connected to functions and systems.

## 2. Multi-Function System Display

**Problem:** Sidebar mini-map places each system under its first function only. Systems supporting multiple functions (e.g. Microsoft 365 used by Finance and Communications) are misrepresented.

**Solution — display only, no type changes:**
- Systems with multiple `functionIds` appear in a "Shared Systems" row at the bottom of the mini-map
- Coloured dots on each shared system circle indicate which functions it serves (using existing function colour scheme)
- Tooltip lists all connected functions
- Single-function systems remain nested under their function
- MapStats adds "Shared systems" count
- Full Mermaid diagram: shared systems get bold border or distinct shape

## 3. Data Category Visibility

**Problem:** Data categories are captured in the wizard but never displayed in sidebar map, review, or diagrams. They're invisible after entry.

**Review summary:** New "Data" section with:
- Table of categories: name, sensitivity level, personal data flag, which systems hold them
- Callout when restricted/confidential data lives in high TechFreedom-risk systems

**Sidebar map:** Systems holding personal data get a small shield icon overlay on their circle. No separate data layer.

**Diagrams:** New "data flow" mode alongside existing modes. Shows systems as nodes, data categories as edge labels (using integration connections), colour-coded by sensitivity (green=public, amber=internal, orange=confidential, red=restricted).

**Contextual tips:** "X systems hold personal data", "Restricted data in Y — check its TechFreedom score".

## 4. Status Indicators in Map

**Problem:** Systems and services have status (active/planned/retiring/legacy) but it's not reflected visually.

**Mini-map:**
- Active: solid fill (unchanged)
- Planned: dashed border, slightly faded
- Retiring: reduced opacity + small "x" indicator
- Legacy: grey fill regardless of function colour

**Stats:** System count shows breakdown on hover: "12 systems (9 active, 2 planned, 1 retiring)"

**Diagrams:** Mermaid CSS classes for status styling (dashed for planned, grey+dashed for retiring/legacy).

**Contextual tip:** "You have X systems marked as retiring — have you planned replacements?"

## 5. JSON Import

**Entry points:**
- Landing page (`/`) alongside "Start mapping"
- PathSelector (`/wizard`) for replacing current data

**Flow:**
1. File picker (accepts `.json`)
2. Read client-side via FileReader API
3. Validate against Zod `architectureSchema` — show specific errors if invalid
4. Preview summary: "This file contains 3 functions, 8 systems, 2 services..."
5. User chooses Replace or Cancel
6. On replace: state set, localStorage updated, land on `/wizard`

**Design decisions:**
- No merge — replace only. Merging (deduplication, ID conflicts, relationship resolution) is complex. Users who need to combine can edit JSON manually.
- Computed fields (costSummary, overlaps, riskSummary) stripped on import — they're derived, not stored.

**Error handling:**
- Malformed JSON → "This file isn't valid JSON"
- Wrong shape → specific Zod validation errors surfaced to user

## 6. CSV Import

**Entry point:** Same Import button with format picker: "JSON (full architecture)" or "CSV (systems list)".

**CSV format — expected columns:**
```
name, vendor, type, hosting, status, cost, cost_period, function
```

All columns except `name` are optional.

**Example:**
```csv
name, vendor, type, cost, function
Salesforce, Salesforce, crm, 1200, fundraising
Xero, Xero, finance, 400, finance
"Our internal wiki",,,, operations
Slack, Slack,,,
```

**Flow:**
1. Select CSV file
2. Parse with PapaParse (added as dependency — ~7KB gzipped, handles quoted fields, commas in values, line endings)
3. Editable preview table with colour-coded completeness:
   - Green: valid, matched
   - Amber: recognised, needs confirmation
   - Empty: missing, shown as "Unknown"
4. Auto-matching:
   - `type` → fuzzy match to `SystemType` enum
   - `function` → fuzzy match to `StandardFunction` names
   - `name`/`vendor` → match against known tools DB for auto TechFreedom scoring
5. User can edit any cell before confirming
6. On confirm: systems created with defaults for missing fields

**Defaults for missing data:**
- Missing vendor → blank, no auto-scoring
- Missing type → `'other'`
- Missing cost → no cost object (flagged in contextual tips)
- Missing function → unassigned (appears in Shared Systems row)
- Missing hosting → `'unknown'`
- Missing status → `'active'`

**Post-import:** Land on wizard with imported systems. Contextual tips highlight gaps: "5 systems have no cost data", "3 systems aren't assigned to a function".

**Component decisions:**
- Preview table built as custom HTML `<table>` + `<input>` elements — no data grid library
- If future requirements demand sorting, filtering, pagination, or large datasets: consider AG Grid (enterprise, feature-rich) or TanStack Table (headless, lightweight, open source)

## Implementation Order

1. Service clarity (type change + UI + map + diagrams)
2. Multi-function system display (mini-map + stats + diagram styling)
3. Data category visibility (review + map icon + diagram mode + tips)
4. Status indicators (mini-map + stats + diagrams + tips)
5. JSON import (file picker + validation + preview + replace)
6. CSV import (PapaParse + preview table + auto-matching + defaults)

## Dependencies

- PapaParse (`papaparse`) — added for CSV import step only
- No other new dependencies
