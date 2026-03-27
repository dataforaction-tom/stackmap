# Changelog

All notable changes to Stackmap will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-27

### Added

- **134 known tools** across 19 categories — massively expanded from the original 27, now covering AI (including local/privacy-focused models like Ollama, Mistral, LM Studio), databases, data visualisation, geospatial, payment processors, website builders, hosting, and more
- **Cost analysis in review** — total annual cost, breakdown by function, top 3 most expensive systems, and count of free/uncosted tools
- **Overlap detection** — warns when you have multiple systems of the same type under one function, suggesting consolidation opportunities
- **Clickable stepper** — completed wizard steps are now clickable links, so you can jump back to any section to edit
- **Mobile stepper navigation** — left/right arrows for moving between steps on small screens
- **Form hydration** — going back to a previous wizard step now shows your existing data, not a blank form
- **Clear and start fresh** — the path selection page detects existing data and offers to clear it with confirmation
- **Organisation types** expanded to include co-operatives and private businesses
- **TechFreedom acknowledgement** — credit to TechFreedom programme in the review summary and footer
- **Documentation link** in the footer
- **Cost data included in JSON export** — export now includes a costSummary object
- **Cost column in TechFreedom risk table** — see cost alongside risk for each system

### Changed

- **Landing page redesigned** — replaced generic AI-style layout with distinctive design: leading question headline, real GDS sector stat, staggered "how it works" steps, asymmetric layout
- **Smart cost estimation** — replaced simple size multipliers with realistic per-seat pricing, tiered pricing selection, and penetration rates (e.g. not everyone needs a Salesforce licence)
- **Wizard navigation is now non-linear** — users can step forward and back freely, editing at any stage
- **Sidebar redesigned** — now an expanding overlay panel (480px) instead of a cramped fixed sidebar, with floating pill on mobile
- **Footer updated** — built by The Good Ship and tomcw.xyz, MIT licence, TechFreedom credit, docs link
- **480 tests** across 42 test files (up from 335/30)

### Fixed

- **Duplicate systems bug** — going through the wizard twice no longer creates duplicate functions and systems
- **State not persisting to diagram view** — architecture now auto-saves to localStorage on every change
- **Service-first path** now fully functional (was "coming soon")

## [0.1.0] - 2026-03-27

### Added

- **Two wizard paths**: function-first ("start with what we do") and service-first ("start with what we deliver"), both producing the same architecture map
- **8 standard organisational functions**: Finance, Governance, People, Fundraising, Communications, Service Delivery, Operations, Data & Reporting
- **10 service templates** with auto-populated tool suggestions: Advice sessions, Grant distribution, Housing repairs, Youth programmes, Training courses, Community events, Counselling, Food bank, Advocacy & campaigns, Volunteer coordination
- **System suggestions** tailored by organisation type and size
- **TechFreedom risk assessment** with 5 dimensions: jurisdiction, continuity, surveillance, lock-in, and cost exposure
- **Smart cost estimation** with per-seat pricing, tiered pricing selection, penetration rates, and automatic tier matching
- **Live architecture map sidebar** that updates in real-time as you build your map
- **Mermaid diagram generation** for visual architecture maps
- **TechFreedom analysis view** with heatmap table and radar chart
- **Data categories** with sensitivity levels and personal data flags
- **Integration mapping** with connection types, direction, and frequency
- **Owner assignment** for each system
- **Review summary step** with complete architecture overview
- **JSON export** of the full architecture document
- **localStorage persistence** with auto-save
- **WCAG 2.1 AA accessibility** throughout
- **Cloudflare Pages deployment** with GitHub Actions CI/CD
