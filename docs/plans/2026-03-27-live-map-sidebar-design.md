# Live Map Sidebar Design

> Date: 2026-03-27
> Status: Approved

## Overview

A persistent, step-aware sidebar in the wizard that shows a live visual representation of the architecture as it builds. Provides spatial context, progress feedback, and contextual guidance to make the wizard feel like building something tangible.

## Approach

**Hybrid: collapsible sidebar with step-aware content (Approach C)**

- Same growing SVG diagram throughout all steps
- Contextual tips below the diagram that adapt per step
- Responsive: fixed sidebar on desktop, collapsible on tablet, floating pill on mobile
- Stylised abstract SVG representation (not live Mermaid) for performance and design control

## Component Architecture

### LiveMapSidebar — `src/components/wizard/live-map-sidebar.tsx`

Persistent sidebar rendered in wizard layout. Three responsive modes:

- **Desktop (lg+):** Fixed right panel, ~280px (w-72). Always visible. Wizard content shrinks. Sidebar is `position: sticky` below the header.
- **Tablet (md):** Toggle button on right edge. Slides in as overlay on click.
- **Mobile:** Floating pill at bottom-centre showing summary ("5 items mapped"). Tapping opens full-screen overlay with sidebar content. Close button to dismiss.

### MiniMap — `src/components/wizard/mini-map.tsx`

Custom SVG that grows as entities are added:

- **Functions**: Rounded rectangles at top, colour-coded (same tints as function picker — emerald for finance, blue for governance, violet for people, etc.). Horizontal row, wrapping.
- **Systems**: Smaller circles/pills below parent function, connected by thin lines. Tree layout.
- **Integrations**: Curved bezier lines between connected systems with direction indicator.
- **Data categories**: Tiny tag icons on systems that have them.
- **Owners**: Small person icons next to owned systems.

Layout: functions evenly spaced across top, systems in columns below parent. ViewBox scales down when items exceed space (no scrolling).

Animation (motion-safe only): new items fade in + scale (0.8→1.0, 200ms). New lines draw from source to target.

Empty state: faint dotted outline with "Your map will appear here" text.

### MapStats — `src/components/wizard/map-stats.tsx`

Compact stats row with icons: "3 functions, 5 systems, 1 integration, 2 owners". Numbers animate up when items added. Only shows non-zero counts.

### ContextualTip — `src/components/wizard/contextual-tip.tsx`

Step-aware guidance based on current pathname and architecture state. Pure function `getTip(pathname, architecture)` for testability. Examples:

- Functions step, empty: "Start by selecting the functions your organisation performs"
- Functions step, 1-3: "Good start. Most organisations select 5-6 functions"
- Systems step, empty for function: "What software does your team use for [Function]?"
- Systems step, few added: "Don't forget spreadsheets and manual processes — they count too"
- Services step: "Services are optional — skip this if your org doesn't think in those terms"
- Data step: "Flag anything containing personal data — it helps identify compliance priorities"
- Integrations step, none: "Many small orgs have few integrations — that's normal"
- Integrations step, manual: "Manual integrations are often the highest-risk areas"
- Owners step, unassigned: "[n] systems still need an owner"
- Owners step, complete: "Every system has an owner — that's great accountability"
- Review step: completion summary

### Floating Pill (mobile) — part of LiveMapSidebar

Shows most relevant non-zero counts: "3 functions, 5 systems". Accent colour. Pulses briefly on new item added.

## Data Flow

All sub-components read from `useArchitecture()` context — no prop drilling. ContextualTip also reads `usePathname()` for step awareness. MiniMap re-renders on architecture state changes (already in React state).

## Layout Integration

### Wizard layout change

Current: single centered column (`max-w-3xl mx-auto`).

New: responsive sidebar layout.

Desktop (lg+):
```
┌─────────────────────────────────────────────┐
│ Stepper + TechFreedom toggle                │
├──────────────────────────┬──────────────────┤
│ Wizard step content      │ Live Map sidebar │
│ (flex-1, max-w-3xl)      │ (w-72, sticky)   │
├──────────────────────────┴──────────────────┤
```

Tablet (md): sidebar collapses to toggle button, slides in as overlay.

Mobile: no sidebar. Floating pill at bottom. Tap for full-screen overlay.

## Accessibility

- Sidebar: `role="complementary"`, `aria-label="Architecture map preview"`
- Mobile overlay: `role="dialog"`, focus trap when open
- Close button: `aria-label="Close map preview"`
- All animation: `motion-safe:` prefix, respects `prefers-reduced-motion`
- Stats: `aria-live="polite"` for screen reader announcements

## New Files

```
src/components/wizard/
  live-map-sidebar.tsx    — Responsive container (sidebar/overlay/pill)
  mini-map.tsx            — Custom SVG growing diagram
  map-stats.tsx           — Animated stat counters
  contextual-tip.tsx      — Step-aware guidance
  tips.ts                 — Pure function getTip() for testability

tests/unit/
  tips.test.ts            — Test tip generation logic

tests/components/wizard/
  mini-map.test.tsx        — SVG renders entities, a11y check
  map-stats.test.tsx       — Renders counts, a11y check
  contextual-tip.test.tsx  — Shows correct tip per step, a11y check
  live-map-sidebar.test.tsx — Responsive behaviour, a11y check
```

## Modified Files

- `src/app/wizard/layout.tsx` — Sidebar layout, import LiveMapSidebar
