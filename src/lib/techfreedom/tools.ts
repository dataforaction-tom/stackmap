import type { KnownTool } from './types';

export const KNOWN_TOOLS: KnownTool[] = [
  // --- Productivity & Collaboration ---
  {
    slug: 'microsoft-365',
    name: 'Microsoft 365',
    provider: 'Microsoft',
    category: 'Productivity',
    score: {
      jurisdiction: 4,
      continuity: 2,
      surveillance: 4,
      lockIn: 4,
      costExposure: 3,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction (CLOUD Act); deep ecosystem lock-in; extensive telemetry collection; price increases on renewal',
    estimatedAnnualCost: 1200,
    pricing: {
      model: 'tiered',
      penetrationRate: 1.0,
      tiers: [
        { name: 'Business Basic', maxUsers: 300, annualPerSeat: 54, recommended: true, minUsers: 1 },
        { name: 'Business Standard', maxUsers: 300, annualPerSeat: 114 },
        { name: 'Enterprise E3', annualPerSeat: 264, minUsers: 50 },
        { name: 'Enterprise E5', annualPerSeat: 432, minUsers: 100 },
      ],
    },
  },
  {
    slug: 'google-workspace',
    name: 'Google Workspace',
    provider: 'Google',
    category: 'Productivity',
    score: {
      jurisdiction: 4,
      continuity: 2,
      surveillance: 5,
      lockIn: 4,
      costExposure: 3,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; aggressive data mining for advertising profiles; deep ecosystem lock-in; export tools exist but migration is complex',
    estimatedAnnualCost: 960,
    pricing: {
      model: 'tiered',
      penetrationRate: 1.0,
      tiers: [
        { name: 'Business Starter', maxUsers: 300, annualPerSeat: 50, recommended: true },
        { name: 'Business Standard', maxUsers: 300, annualPerSeat: 96 },
        { name: 'Business Plus', maxUsers: 300, annualPerSeat: 144 },
        { name: 'Enterprise', annualPerSeat: 252, minUsers: 50 },
      ],
    },
  },
  {
    slug: 'slack',
    name: 'Slack',
    provider: 'Salesforce',
    category: 'Communication',
    score: {
      jurisdiction: 4,
      continuity: 3,
      surveillance: 3,
      lockIn: 3,
      costExposure: 3,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; message history limits on free tier; data accessible to workspace admins; vendor acquired by Salesforce',
    estimatedAnnualCost: 840,
    pricing: {
      model: 'tiered',
      penetrationRate: 0.8,
      tiers: [
        { name: 'Free', annualPerSeat: 0, maxUsers: 999, recommended: true },
        { name: 'Pro', annualPerSeat: 63 },
        { name: 'Business+', annualPerSeat: 105, minUsers: 25 },
      ],
    },
  },
  {
    slug: 'zoom',
    name: 'Zoom',
    provider: 'Zoom',
    category: 'Communication',
    score: {
      jurisdiction: 4,
      continuity: 2,
      surveillance: 3,
      lockIn: 2,
      costExposure: 3,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; past security controversies; data routed through multiple jurisdictions; relatively easy to switch',
    estimatedAnnualCost: 1200,
    pricing: {
      model: 'tiered',
      penetrationRate: 0.5,
      tiers: [
        { name: 'Basic', annualPerSeat: 0, maxUsers: 100, recommended: true },
        { name: 'Pro', annualPerSeat: 120 },
        { name: 'Business', annualPerSeat: 180, minUsers: 10 },
      ],
    },
  },
  {
    slug: 'teams',
    name: 'Microsoft Teams',
    provider: 'Microsoft',
    category: 'Communication',
    score: {
      jurisdiction: 4,
      continuity: 2,
      surveillance: 4,
      lockIn: 4,
      costExposure: 3,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; bundled with M365 creating lock-in; extensive telemetry; tightly coupled to Microsoft ecosystem',
    estimatedAnnualCost: 0,
  },

  // --- CRM & Sales ---
  {
    slug: 'salesforce',
    name: 'Salesforce',
    provider: 'Salesforce',
    category: 'CRM',
    score: {
      jurisdiction: 4,
      continuity: 2,
      surveillance: 3,
      lockIn: 5,
      costExposure: 5,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; extreme lock-in through customisation; very high costs and complex pricing; data export is difficult',
    estimatedAnnualCost: 3000,
    pricing: {
      model: 'per_seat',
      penetrationRate: 0.3,
      annualPerSeat: 300,
      tiers: [
        { name: 'Essentials', annualPerSeat: 300, recommended: true, maxUsers: 10 },
        { name: 'Professional', annualPerSeat: 900, minUsers: 5 },
        { name: 'Enterprise', annualPerSeat: 1800, minUsers: 20 },
      ],
    },
  },
  {
    slug: 'hubspot',
    name: 'HubSpot',
    provider: 'HubSpot',
    category: 'CRM',
    score: {
      jurisdiction: 4,
      continuity: 2,
      surveillance: 3,
      lockIn: 4,
      costExposure: 4,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; significant lock-in through workflows and integrations; escalating costs as contacts grow; free tier limited',
    estimatedAnnualCost: 4800,
    pricing: {
      model: 'tiered',
      penetrationRate: 0.3,
      tiers: [
        { name: 'Free CRM', annualPerSeat: 0, maxUsers: 999, recommended: true },
        { name: 'Starter', annualPerSeat: 216 },
        { name: 'Professional', annualPerSeat: 4800, minUsers: 5 },
      ],
    },
  },

  // --- Finance ---
  {
    slug: 'xero',
    name: 'Xero',
    provider: 'Xero',
    category: 'Finance',
    score: {
      jurisdiction: 2,
      continuity: 2,
      surveillance: 2,
      lockIn: 3,
      costExposure: 3,
      isAutoScored: true,
    },
    keyRisks:
      'NZ-headquartered with UK/AU data centres; reasonable data export; some lock-in through integrations; annual price rises',
    estimatedAnnualCost: 360,
    pricing: {
      model: 'flat',
      flatAnnual: 360,
      penetrationRate: 0.1,
      tiers: [
        { name: 'Starter', annualPerSeat: 0, maxUsers: 1, recommended: true },
        { name: 'Standard', annualPerSeat: 0, maxUsers: 3 },
        { name: 'Premium', annualPerSeat: 0, maxUsers: 10 },
      ],
      notes: 'Flat rate, not per-user. Starter: \u00A330/mo, Standard: \u00A342/mo, Premium: \u00A354/mo',
    },
  },
  {
    slug: 'quickbooks',
    name: 'QuickBooks',
    provider: 'Intuit',
    category: 'Finance',
    score: {
      jurisdiction: 4,
      continuity: 2,
      surveillance: 3,
      lockIn: 3,
      costExposure: 3,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; data export available but format limitations; pricing tiers can escalate; desktop version being phased out',
    estimatedAnnualCost: 480,
  },
  {
    slug: 'sage',
    name: 'Sage',
    provider: 'Sage',
    category: 'Finance',
    score: {
      jurisdiction: 2,
      continuity: 2,
      surveillance: 2,
      lockIn: 3,
      costExposure: 3,
      isAutoScored: true,
    },
    keyRisks:
      'UK-headquartered; long track record but moving to cloud-only; moderate lock-in; pricing complexity across products',
    estimatedAnnualCost: 600,
  },

  // --- Marketing ---
  {
    slug: 'mailchimp',
    name: 'Mailchimp',
    provider: 'Intuit',
    category: 'Marketing',
    score: {
      jurisdiction: 4,
      continuity: 3,
      surveillance: 3,
      lockIn: 2,
      costExposure: 3,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction (acquired by Intuit); list export available; costs escalate with list size; free tier significantly reduced',
    estimatedAnnualCost: 240,
    pricing: {
      model: 'flat',
      flatAnnual: 156,
      penetrationRate: 0.05,
    },
  },
  {
    slug: 'eventbrite',
    name: 'Eventbrite',
    provider: 'Eventbrite',
    category: 'Events',
    score: {
      jurisdiction: 4,
      continuity: 3,
      surveillance: 3,
      lockIn: 2,
      costExposure: 2,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; attendee data exportable; relatively low lock-in; per-ticket fees can add up for large events',
    estimatedAnnualCost: 0,
  },
  {
    slug: 'canva',
    name: 'Canva',
    provider: 'Canva',
    category: 'Design',
    score: {
      jurisdiction: 3,
      continuity: 2,
      surveillance: 3,
      lockIn: 2,
      costExposure: 2,
      isAutoScored: true,
    },
    keyRisks:
      'Australian HQ but US data processing; designs exportable as images; low switching cost; generous free tier',
    estimatedAnnualCost: 120,
    pricing: {
      model: 'per_seat',
      penetrationRate: 0.2,
      annualPerSeat: 100,
    },
  },

  // --- Website & CMS ---
  {
    slug: 'wordpress',
    name: 'WordPress',
    provider: 'Automattic',
    category: 'CMS',
    score: {
      jurisdiction: 2,
      continuity: 1,
      surveillance: 1,
      lockIn: 1,
      costExposure: 1,
      isAutoScored: true,
    },
    keyRisks:
      'Open source with self-hosting option; full data portability; minimal surveillance; hosting costs vary but options abundant',
    estimatedAnnualCost: 300,
  },

  // --- Storage & Files ---
  {
    slug: 'dropbox',
    name: 'Dropbox',
    provider: 'Dropbox',
    category: 'Storage',
    score: {
      jurisdiction: 4,
      continuity: 2,
      surveillance: 3,
      lockIn: 2,
      costExposure: 3,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; files easily downloadable; some lock-in through Dropbox-specific features; pricing has increased',
    estimatedAnnualCost: 960,
  },
  {
    slug: 'onedrive',
    name: 'OneDrive',
    provider: 'Microsoft',
    category: 'Storage',
    score: {
      jurisdiction: 4,
      continuity: 2,
      surveillance: 3,
      lockIn: 3,
      costExposure: 2,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; bundled with M365; files downloadable but deeply integrated with Office apps; included in M365 licence',
    estimatedAnnualCost: 0,
  },

  // --- Project Management ---
  {
    slug: 'trello',
    name: 'Trello',
    provider: 'Atlassian',
    category: 'Project Management',
    score: {
      jurisdiction: 4,
      continuity: 3,
      surveillance: 2,
      lockIn: 2,
      costExposure: 2,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction (Atlassian); JSON export available; low lock-in; generous free tier but power-ups require paid plan',
    estimatedAnnualCost: 0,
  },
  {
    slug: 'asana',
    name: 'Asana',
    provider: 'Asana',
    category: 'Project Management',
    score: {
      jurisdiction: 4,
      continuity: 3,
      surveillance: 2,
      lockIn: 3,
      costExposure: 3,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; CSV export available; moderate lock-in through workflows; costs increase significantly with team size',
    estimatedAnnualCost: 1320,
  },
  {
    slug: 'airtable',
    name: 'Airtable',
    provider: 'Airtable',
    category: 'Project Management',
    score: {
      jurisdiction: 4,
      continuity: 3,
      surveillance: 2,
      lockIn: 4,
      costExposure: 4,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; CSV export but automations/views not portable; significant lock-in through custom apps; expensive at scale',
    estimatedAnnualCost: 2400,
    pricing: {
      model: 'tiered',
      penetrationRate: 0.5,
      tiers: [
        { name: 'Free', annualPerSeat: 0, maxUsers: 5, recommended: true },
        { name: 'Team', annualPerSeat: 200 },
        { name: 'Business', annualPerSeat: 288, minUsers: 20 },
      ],
    },
  },

  // --- Social Media ---
  {
    slug: 'linkedin',
    name: 'LinkedIn',
    provider: 'Microsoft',
    category: 'Social Media',
    score: {
      jurisdiction: 4,
      continuity: 3,
      surveillance: 4,
      lockIn: 3,
      costExposure: 2,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; extensive professional data profiling; content not easily portable; free for basic use but analytics require paid tier',
    estimatedAnnualCost: 0,
  },
  {
    slug: 'meta-facebook',
    name: 'Meta/Facebook',
    provider: 'Meta',
    category: 'Social Media',
    score: {
      jurisdiction: 4,
      continuity: 3,
      surveillance: 5,
      lockIn: 4,
      costExposure: 2,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; extreme surveillance and data harvesting; audience locked to platform; ad costs increasing; algorithm changes unpredictable',
    estimatedAnnualCost: 0,
  },
  {
    slug: 'twitter-x',
    name: 'Twitter/X',
    provider: 'X Corp',
    category: 'Social Media',
    score: {
      jurisdiction: 4,
      continuity: 4,
      surveillance: 4,
      lockIn: 2,
      costExposure: 2,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; platform stability concerns under new ownership; content not portable; API access restricted; free to use but volatile',
    estimatedAnnualCost: 0,
  },
  {
    slug: 'instagram',
    name: 'Instagram',
    provider: 'Meta',
    category: 'Social Media',
    score: {
      jurisdiction: 4,
      continuity: 3,
      surveillance: 5,
      lockIn: 4,
      costExposure: 2,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; Meta surveillance infrastructure; content locked to platform; algorithm-dependent reach; ad costs rising',
    estimatedAnnualCost: 0,
  },

  // --- Messaging ---
  {
    slug: 'whatsapp',
    name: 'WhatsApp',
    provider: 'Meta',
    category: 'Messaging',
    score: {
      jurisdiction: 4,
      continuity: 3,
      surveillance: 4,
      lockIn: 3,
      costExposure: 1,
      isAutoScored: true,
    },
    keyRisks:
      'US jurisdiction; end-to-end encrypted but metadata collected by Meta; contact list dependency; free but owned by Meta',
    estimatedAnnualCost: 0,
  },
  {
    slug: 'signal',
    name: 'Signal',
    provider: 'Signal Foundation',
    category: 'Messaging',
    score: {
      jurisdiction: 2,
      continuity: 2,
      surveillance: 1,
      lockIn: 1,
      costExposure: 1,
      isAutoScored: true,
    },
    keyRisks:
      'US-based non-profit but minimal data collection; open source; strong encryption; no lock-in; free and donation-funded',
    estimatedAnnualCost: 0,
    pricing: { model: 'free' },
  },

  // --- Privacy-focused alternatives ---
  {
    slug: 'jitsi-meet',
    name: 'Jitsi Meet',
    provider: '8x8 / Community',
    category: 'Communication',
    score: {
      jurisdiction: 1,
      continuity: 2,
      surveillance: 1,
      lockIn: 1,
      costExposure: 1,
      isAutoScored: true,
    },
    keyRisks:
      'Open source and self-hostable; minimal data collection; no lock-in; free; depends on community maintenance',
    estimatedAnnualCost: 0,
    pricing: { model: 'free' },
  },
  {
    slug: 'proton-mail',
    name: 'Proton Mail',
    provider: 'Proton AG',
    category: 'Email',
    score: {
      jurisdiction: 1,
      continuity: 2,
      surveillance: 1,
      lockIn: 2,
      costExposure: 2,
      isAutoScored: true,
    },
    keyRisks:
      'Swiss jurisdiction with strong privacy laws; end-to-end encrypted; email export available; affordable paid tiers',
    estimatedAnnualCost: 480,
    pricing: { model: 'free' },
  },
];
