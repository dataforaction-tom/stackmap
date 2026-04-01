# Importance Assessment & Shadow Tools

## Summary

Add a new wizard step where users assess the importance of each system on a 1-10 slider scale, and surface informal "shadow" tools that people use outside the official stack. A live bullseye diagram in the sidebar visualises the results, with core tools at the centre, important tools in the middle ring, peripheral tools on the outside, and shadow tools beyond the edge.

## Motivation

Organisations mapping their technology need to understand not just *what* they use, but *how much they depend on it*. A CRM and a sticky-notes app are both "systems" but losing them has very different consequences. Separately, many organisations have informal tools (WhatsApp, personal AI accounts, consumer file sharing) that carry real risk but never appear in official audits. This feature captures both dimensions.

## Data Model

### System interface changes

Two new optional fields on the existing `System` interface:

```typescript
importance?: number;    // 1-10 scale
isShadow?: boolean;     // true for unofficial/informal tools
```

### Derived tiers

The tier label is derived from the score, never stored separately:

| Score | Tier | Definition |
|-------|------|------------|
| 8-10 | Core | Operations would stop without this tool |
| 4-7 | Important | Valuable and regularly used, but the organisation could work around its loss temporarily |
| 1-3 | Peripheral | Nice to have, used occasionally or by few people, easy to replace or drop |

Shadow tools with no score sit outside the bullseye. Shadow tools with a score appear in the appropriate ring but retain shadow styling.

## Wizard Flow

The wizard goes from 9 to 10 steps. The new step slots in after systems (step 5).

### Function-first path

1. Choose path
2. Risk assessment
3. Functions
4. Systems
5. **Importance & Shadow Tools** (new)
6. Services
7. Data
8. Integrations
9. Owners
10. Review

### Service-first path

1. Choose path
2. Risk assessment
3. Services
4. Systems
5. **Importance & Shadow Tools** (new)
6. Functions
7. Data
8. Integrations
9. Owners
10. Review

Routes: `/wizard/functions/importance` and `/wizard/services/importance`.

## Importance Step UI

### Left panel (scrollable)

**Tier definitions** at the top (collapsible after first visit):
- Core (8-10): Operations would stop without it
- Important (4-7): Valuable but you could work around its loss temporarily
- Peripheral (1-3): Nice to have, easy to replace or drop

**Systems grouped by function.** For each function:
- Function heading
- Each system shown as a card:
  - System name and type badge
  - Slider (1-10) with derived tier label updating live
  - Colour hint on slider track: green (8-10), amber (4-7), grey (1-3)
- Below the systems, a prompt: *"Are there tools people use informally for [Function]?"*
  - "Add shadow tool" button expands inline form: name, type dropdown, optional notes
  - Shadow tools appear with dashed border and "Shadow" tag
  - Optional importance slider (collapsed by default, expandable)

**Bottom section:** Unlinked systems, plus general prompt: *"Any other tools people use that aren't part of the official setup?"*

### Right panel (sidebar)

The bullseye diagram replaces the mini-map for this step only. Other wizard steps continue showing the normal mini-map.

## Bullseye Diagram Component

Custom SVG component (`BullseyeDiagram`), used in the sidebar during the importance step and as a static output in the review summary.

### Structure

Three concentric rings plus an outer zone:
- Innermost (green fill): Core (8-10)
- Middle (amber fill): Important (4-7)
- Outer (grey fill): Peripheral (1-3)
- Beyond the rings: unscored shadow tools

### System positioning

- Each system is a small labelled circle
- Radial position within a ring determined by exact slider value (10 = centre, 8 = inner edge of core ring)
- Angular position distributed evenly to avoid overlap, grouped loosely by function
- Dot colour matches function colour from the mini-map (finance = emerald, governance = blue, etc.)

### Shadow tool styling

- Dashed outline instead of solid
- If scored, appears in the appropriate ring but keeps dashed style
- If unscored, floats outside the outermost ring

### Dynamic sizing

- Diagram grows to fit the number of systems
- Rings expand proportionally so labels stay readable
- Minimum size ensures it looks good with few tools

### Labels and interaction

- System name displayed next to each dot
- Ring labels ("Core", "Important", "Peripheral") along ring edges
- On hover/focus: exact score and function name

## Review Summary Changes

### Importance overview section (after cost overview)

- Static bullseye diagram
- Summary stats: "X core, Y important, Z peripheral, W shadow tools"
- Callout if any shadow tools score 8+: *"[Tool] is classified as shadow but scored as core — consider formalising it"*

### Shadow tools section (separate from main systems list)

- Heading: "Shadow & Informal Tools"
- Shows name, type, importance score (if set), originating function
- Visually distinct from official systems

## Export Changes

### JSON

`importance` and `isShadow` fields included on System objects. No structural changes.

### Markdown

Bullseye summary table (systems grouped by tier) plus a separate shadow tools table.

### Mermaid diagrams

No changes. Shadow tools are excluded from architecture diagrams. The bullseye is its own standalone SVG visualisation.

## Architecture Context Hook

New helpers on `useArchitecture`:
- `updateSystemImportance(systemId: string, score: number)` — sets importance on a system
- `addShadowSystem(system)` — creates a system with `isShadow: true`, lightweight fields

## Shadow Tool Form

Lightweight compared to the full system form:
- Name (required)
- Type dropdown (required)
- Notes (optional)

Stored as a System with `isShadow: true`. Most fields (vendor, hosting, cost, owner) left undefined. Shadow tools can still match against the known tools database for TechFreedom auto-scoring.

## What stays unchanged

- Mini-map on other wizard steps (no shadow tools shown)
- Mermaid diagram generation (shadow tools excluded)
- Known tools database structure
- Existing system form
