# Changelog

All notable changes to Stackmap will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-27

### Added

- **Two wizard paths**: function-first ("start with what we do") and service-first ("start with what we deliver"), both producing the same architecture map
- **8 standard organisational functions**: Finance, Governance, People, Fundraising, Communications, Service Delivery, Operations, Data & Reporting
- **10 service templates** with auto-populated tool suggestions: Advice sessions, Grant distribution, Housing repairs, Youth programmes, Training courses, Community events, Counselling, Food bank, Advocacy & campaigns, Volunteer coordination
- **System suggestions** tailored by organisation type (charity, social enterprise, council, cooperative, private business) and size (micro, small, medium, large)
- **TechFreedom risk assessment** with 5 dimensions: jurisdiction, continuity, surveillance, lock-in, and cost exposure
- **27 pre-scored known tools** with risk assessments and detailed pricing data (Microsoft 365, Google Workspace, Salesforce, Slack, Zoom, Xero, and more)
- **Smart cost estimation** with per-seat pricing, tiered pricing selection, penetration rates, and automatic tier matching
- **Live architecture map sidebar** that updates in real-time as you build your map
- **Mermaid diagram generation** for visual architecture maps
- **TechFreedom analysis view** with heatmap table and radar chart
- **Risk badges** with inline scoring in the wizard systems step
- **Two-tier feature toggle** for TechFreedom (app-level availability and org-level opt-out)
- **Data categories** with sensitivity levels (public, internal, confidential, restricted) and personal data flags
- **Integration mapping** with connection types (API, file transfer, manual, webhook, database link), direction, and frequency
- **Owner assignment** for each system with role and external/internal designation
- **Review summary step** with complete architecture overview
- **JSON export** of the full architecture document
- **localStorage persistence** with auto-save
- **8 base UI components** (Button, Card, Input, Select, Checkbox Group, Stepper, Toast, and more)
- **3 TechFreedom components** (RiskBadge, RiskDetails, RadarChart)
- **Warm forest-green design** with Figtree font, colour-coded functions, and celebratory review step
- **WCAG 2.1 AA accessibility** throughout — keyboard navigation, screen reader support, visible focus indicators, axe-core tested
- **335 tests** across 30 test files (unit, component, and accessibility tests)
- **Skip link** and contrast fixes for accessibility
- **Stepper touch targets** optimised for mobile
- **Double-submit prevention** on forms
- **Text overflow handling** across all components
