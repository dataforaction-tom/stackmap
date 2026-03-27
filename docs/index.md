# Stackmap

**Lightweight architecture mapping for social purpose organisations.**

## What is Stackmap?

Stackmap is an open source tool that helps charities, social enterprises, and local councils map their technology architecture. It provides a guided wizard that walks anyone with operational knowledge through documenting their systems, integrations, data, and ownership — without requiring enterprise architecture expertise.

The result is an immediately useful architecture map with visual diagrams, cost analysis, and optional risk assessment.

## Who is it for?

- **Small charities and social enterprises** — No IT team, technology decisions made by the CEO or operations lead, systems accumulated over years with no single view of the whole picture.
- **Medium VCSE organisations** — May have a part-time IT person or outsourced support, want to understand their stack before making changes or investments.
- **Local councils** — Digital teams who want a lightweight tool for local government reorganisation (LGR) planning, or who want to pilot architecture mapping before committing to enterprise tooling.

## Why Stackmap?

Commercial enterprise architecture tools (ArchiMate, TOGAF-based platforms) are expensive, complex, and designed for specialists. Most social purpose organisations do not have — and do not need — those tools. They need something that:

- One person can complete in an afternoon
- Requires no enterprise architecture training
- Produces a useful artefact immediately
- Is open source with zero vendor lock-in

Stackmap was built in response to findings from GDS Local's "Sourcing the Stack" initiative, which found that councils have no common model for describing their technology and 54% use spreadsheets that are limiting and difficult to aggregate.

## Key Features

- **Two wizard paths** — start with organisational functions ("what we do") or services ("what we deliver")
- **Smart suggestions** — system recommendations tailored to your organisation type and size
- **10 service templates** with auto-populated tools
- **TechFreedom risk assessment** — optional scoring across jurisdiction, continuity, surveillance, lock-in, and cost exposure
- **Cost estimation** with per-seat pricing and tier selection
- **Mermaid diagram generation** for visual architecture maps
- **JSON export** of your complete architecture
- **Fully accessible** — WCAG 2.1 AA, keyboard navigable, screen reader compatible

## Quick Start

```bash
git clone https://github.com/dataforaction-tom/stackmap.git
cd stackmap
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and follow the guided wizard to start mapping your architecture.

For a detailed walkthrough, see the [User Guide](user-guide.md).
