# User Guide

This guide walks you through using Stackmap to map your organisation's technology architecture.

---

## 1. Getting Started

### What you need

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- About 30-60 minutes, depending on the size of your organisation
- Knowledge of what software your organisation uses and how systems connect

Stackmap runs entirely in your browser. Your data is stored in your browser's local storage and never leaves your device.

### Creating your organisation profile

When you first open Stackmap, you will be asked to set up your organisation:

- **Name** — Your organisation's name
- **Type** — Charity, social enterprise, council, cooperative, private business, or other
- **Size** — Micro (1-5 staff), small (6-25), medium (26-100), or large (100+)
- **Staff count** (optional) — Your full-time equivalent headcount, used for more accurate cost estimates
- **Annual turnover** (optional) — In GBP

Your organisation type and size affect which system suggestions you see later in the wizard.

---

## 2. Choosing Your Path

Stackmap offers two ways to map your architecture. Both paths lead to the same result — choose whichever feels more natural.

### Function-first: "Start with what we do"

Best for organisations that:

- Do not think in terms of "services"
- Want a more structured approach
- Prefer to start with familiar categories like Finance, People, and Communications

You begin by selecting which organisational functions apply to you, then add the systems used for each function.

### Service-first: "Start with what we deliver"

Best for organisations that:

- Have clearly defined services they deliver
- Think in terms of what they provide to users, clients, or beneficiaries
- Want to map technology around their delivery model

You begin by listing your services, then add the systems that support them.

!!! tip "Not sure which to choose?"
    If your organisation is small and does not have clearly defined services, start with **function-first**. The standard functions (Finance, Governance, People, etc.) give you a solid scaffold to work from.

---

## 3. Function-First Wizard

### Step 1: Select your functions

You will see a list of 8 standard organisational functions:

| Function | Description |
|----------|-------------|
| **Finance** | Financial management, accounting, budgeting, and reporting |
| **Governance** | Board management, compliance, policies, and organisational oversight |
| **People** | HR, recruitment, payroll, volunteering, and staff management |
| **Fundraising** | Donor management, grant applications, campaigns, and income tracking |
| **Communications** | External communications, marketing, social media, and website management |
| **Service Delivery** | Delivery of core services, programmes, and activities to beneficiaries |
| **Operations** | Day-to-day operations, facilities, logistics, and procurement |
| **Data & Reporting** | Impact measurement, data collection, analysis, and funder reporting |

Select all the functions that apply to your organisation. You can also add custom functions if your work does not fit neatly into these categories.

!!! tip
    Most organisations will select at least Finance, People, Communications, and Operations. Do not overthink it — you can always come back and adjust.

### Step 2: Add systems for each function

For each function you selected, you will be asked: "What software do you use for [Function]?"

Stackmap suggests tools based on your organisation type and size. For example, a small charity selecting Finance might see suggestions for Xero, QuickBooks, and FreeAgent.

For each system you add, you can provide:

- **Name** — The name of the software (e.g., "Xero", "Google Sheets")
- **Type** — CRM, finance, HR, case management, spreadsheet, etc.
- **Vendor** — Who makes it
- **Hosting** — Cloud, on-premise, hybrid, or "don't know"
- **Status** — Active, planned, retiring, or legacy
- **Cost** — Amount, period (monthly/annual), and pricing model

A system can support multiple functions. If you have already added a system for a previous function, you will be able to link it rather than entering it again.

### Step 3: Services (optional)

You will be asked: "Do you want to map specific services within these functions?"

This step is optional. If your organisation thinks in terms of services (e.g., "Advice sessions", "Youth programmes"), you can add them here and link them to the functions and systems you have already mapped.

If this is not relevant to your organisation, skip this step.

---

## 4. Service-First Wizard

### Step 1: List your services

Add each service your organisation delivers:

- **Name** — What the service is called (e.g., "Employment support", "Community meals")
- **Description** — A brief description of what the service involves
- **Status** — Active, planned, or retiring

Stackmap provides 10 service templates you can use as starting points:

- Advice sessions
- Grant distribution
- Housing repairs
- Youth programmes
- Training courses
- Community events
- Counselling
- Food bank
- Advocacy & campaigns
- Volunteer coordination

Selecting a template auto-populates suggested tools for that service type.

### Step 2: Add systems

For each service, add the software used to deliver it. As with the function-first path, you can provide details about type, vendor, hosting, status, and cost.

### Step 3: Tag functions

Tag each system with the organisational functions it supports. This categorises your systems for analysis and helps identify which functions are well-served and which have gaps.

---

## 5. Adding Systems

Whether you are on the function-first or service-first path, adding systems works the same way.

### Suggested tools

Stackmap shows tool suggestions based on your organisation type, size, and the function or service you are mapping. Suggestions are drawn from a database of tools commonly used in the sector.

If a suggested tool has data in the known tools database, Stackmap can automatically provide:

- Cost estimates with per-seat pricing
- TechFreedom risk scores (if enabled)
- Provider and category information

### Manual entry

You can always add any system manually. Enter the name and fill in whatever details you know. Fields you leave blank can be completed later.

### Cost information

For each system, you can record:

- **Amount** — How much it costs
- **Period** — Monthly or annual
- **Model** — Subscription, perpetual licence, free, or unknown

If a tool is in the known tools database with pricing data, Stackmap will estimate costs automatically based on your organisation's staff count.

---

## 6. Data Categories

After adding systems, you will map the data your systems hold.

### Adding data categories

For each system, tag the types of data it holds. Common categories include:

- Client records
- Financial transactions
- Case notes
- Staff records
- Donor information
- Contact details

### Sensitivity levels

Each data category has a sensitivity level:

| Level | Meaning |
|-------|---------|
| **Public** | Information that is or could be publicly available |
| **Internal** | Internal working information, not for public release |
| **Confidential** | Sensitive information requiring controlled access |
| **Restricted** | Highly sensitive data (safeguarding, health, legal) |

### Personal data flag

You can mark whether a data category contains personal data. This is useful for understanding your data protection obligations and GDPR exposure.

---

## 7. Integrations

The integrations step captures how your systems connect to each other.

### Connection types

For each pair of connected systems, record:

| Type | Description |
|------|-------------|
| **API** | Automated connection via programming interface |
| **File transfer** | Scheduled or manual file exchange (CSV, Excel, etc.) |
| **Manual** | Someone copies data between systems by hand |
| **Webhook** | Automated trigger-based notifications |
| **Database link** | Direct database connection |
| **Unknown** | You know they connect, but not how |

### Direction

- **One-way** — Data flows from system A to system B only
- **Two-way** — Data flows in both directions

### Frequency

- **Real-time** — Immediate, as changes happen
- **Scheduled** — Regular intervals (daily, weekly, etc.)
- **On-demand** — When someone triggers it
- **Unknown** — Not sure how often

!!! note "Integration honesty"
    Most small organisations do not have APIs — they have "Sarah exports it on Tuesdays." Stackmap is designed to capture this reality honestly. Selecting "Manual" as the integration type is completely valid and helps identify where automation might add value later.

---

## 8. Owners

Assign ownership for each system:

- **Name** — The person or role responsible (e.g., "Finance Manager", "CEO", "External IT support")
- **Role** — Their position
- **External** — Whether they are outside your organisation (e.g., outsourced IT provider)
- **Contact info** — Optional contact details

Ownership mapping helps with:

- Understanding who to ask about a system
- Identifying single points of failure (one person responsible for everything)
- Planning handovers and succession

---

## 9. Review and Export

The final step shows a summary of your complete architecture map.

### What you see

- **Organisation overview** — Your org details and the mapping path you chose
- **Functions and services** — What your organisation does
- **Systems** — All the software you use, with cost and risk information
- **Data categories** — What data you hold and its sensitivity
- **Integrations** — How systems connect
- **Owners** — Who is responsible

### Architecture diagram

Stackmap generates a Mermaid diagram showing your systems and their relationships. This can be embedded in documents, wikis, or GitHub README files.

### JSON export

Export your complete architecture as a JSON file. This produces a structured document containing all entities, relationships, and metadata. The JSON format can be:

- Shared with colleagues
- Imported into other tools
- Stored in version control
- Used for sector-wide aggregation

---

## 10. TechFreedom Risk Assessment

TechFreedom is an optional feature that assesses the risk profile of your technology stack across five dimensions.

### What is TechFreedom?

TechFreedom scores each system in your architecture on a 1-5 scale across five risk dimensions:

| Dimension | What it measures | Example risk |
|-----------|-----------------|-------------|
| **Jurisdiction** | Where data is stored and under which legal regime | US-based service subject to CLOUD Act |
| **Continuity** | Risk of the service disappearing or changing terms | Startup with uncertain funding |
| **Surveillance** | Extent of data mining and telemetry | Advertising-funded platform profiling users |
| **Lock-in** | How difficult it is to export data and switch | Proprietary format with no export |
| **Cost exposure** | Risk of price increases | History of above-inflation price rises |

Scores range from 1 (low risk) to 5 (critical risk).

### How to enable TechFreedom

TechFreedom has a two-tier toggle:

1. **App-level** — Controls whether TechFreedom is available at all. This is a global setting.
2. **Organisation-level** — Even when enabled globally, individual organisations can opt out of risk assessment for their architecture.

### Reading the results

#### Risk badges

Each system shows a risk badge with an overall risk level:

- **Low** — Score 1-2, minimal concerns
- **Moderate** — Score 2-3, some areas to watch
- **High** — Score 3-4, significant concerns in one or more areas
- **Critical** — Score 4-5, serious risks that need attention

#### Heatmap table

The TechFreedom analysis view shows a heatmap table with all your systems and their scores across the five dimensions. This makes it easy to spot patterns — for example, if all your systems score high on jurisdiction risk because they are US-based.

#### Radar chart

The radar chart shows the aggregate risk profile of your entire stack across all five dimensions. This gives a quick visual overview of where your organisation's technology risk is concentrated.

### Pre-scored tools

Stackmap includes a database of approximately 27 commonly used tools with pre-scored risk assessments. When you add a system that matches a known tool, the risk scores are populated automatically. You can override any score if you disagree with the assessment.

---

## 11. Cost Overview

Stackmap estimates the annual cost of your technology stack based on the systems you have mapped.

### How costs are estimated

1. **Known tools with pricing data** — If a system matches a tool in the database with detailed pricing, Stackmap calculates cost based on:
   - Your staff count (or default for your size band)
   - The tool's penetration rate (what fraction of staff need licences)
   - The most appropriate pricing tier for your user count
2. **Known tools with base cost only** — Scaled from a baseline of approximately 15 users
3. **Manual entry** — If you entered cost data for a system, that amount is used directly

### Understanding the breakdown

Each system's cost estimate shows:

- **Annual total** — Estimated yearly cost
- **Per seat** — Cost per user per year (if applicable)
- **Seats** — Number of licences estimated
- **Tier** — Which pricing tier was selected
- **Breakdown** — Human-readable explanation of how the cost was calculated

### Size bands and defaults

If you have not specified your staff count, Stackmap uses defaults:

| Size | Default staff |
|------|--------------|
| Micro | 3 |
| Small | 15 |
| Medium | 60 |
| Large | 200 |

---

## 12. Live Map Sidebar

As you work through the wizard, a live sidebar shows your architecture map building up in real time.

### How it works

The sidebar displays a simplified Mermaid diagram that updates automatically as you add functions, systems, services, and integrations. It provides a visual confirmation that your data is being captured correctly.

### Tips

- The sidebar is visible on larger screens. On mobile devices, you can toggle it.
- Use it to spot gaps — if a function shows no systems, you may have missed something.
- The sidebar provides contextual guidance based on the current wizard step.

---

## 13. Starting Over

### Editing previous steps

You can navigate back to any previous step in the wizard using the stepper at the top. Your data is preserved — going back does not delete what you have entered in later steps.

### Clearing data

To start fresh, you can clear your architecture data from the settings. This removes all data from your browser's local storage. This action cannot be undone.

!!! warning
    Clearing data is permanent. If you want to keep a copy, export your architecture as JSON before clearing.
