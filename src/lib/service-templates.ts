export interface ServiceTemplate {
  name: string;
  description: string;
  suggestedTools: string[]; // tool names that match known tools database
}

export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    name: 'Advice sessions',
    description: 'One-to-one or group advice, guidance, and information services',
    suggestedTools: ['Salesforce', 'Lamplight', 'Microsoft 365', 'Zoom', 'Whereby', 'ChatGPT', 'Google Sheets'],
  },
  {
    name: 'Grant distribution',
    description: 'Managing and distributing grants or funds to beneficiaries',
    suggestedTools: ['Salesforce', 'Xero', 'Airtable', 'Stripe', 'GoCardless', 'Power BI', 'ChatGPT'],
  },
  {
    name: 'Housing repairs',
    description: 'Managing property maintenance and repair requests',
    suggestedTools: ['Salesforce', 'Trello', 'Microsoft 365', 'WhatsApp', 'QGIS', 'Felt'],
  },
  {
    name: 'Youth programmes',
    description: 'Activities, mentoring, and development for young people',
    suggestedTools: ['Lamplight', 'Canva', 'Instagram', 'TikTok', 'WhatsApp', 'Zoom', 'Google Workspace'],
  },
  {
    name: 'Training courses',
    description: 'Delivering education, workshops, and professional development',
    suggestedTools: ['Zoom', 'BigBlueButton', 'Google Workspace', 'Mailchimp', 'Canva', 'Eventbrite', 'Notion', 'ChatGPT'],
  },
  {
    name: 'Community events',
    description: 'Organising public events, festivals, and community gatherings',
    suggestedTools: ['Eventbrite', 'Tito', 'Canva', 'Mailchimp', 'Instagram', 'Meta/Facebook', 'Stripe'],
  },
  {
    name: 'Counselling',
    description: 'Professional counselling and therapeutic support services',
    suggestedTools: ['Lamplight', 'Zoom', 'Whereby', 'Signal', 'Microsoft 365', 'Notion'],
  },
  {
    name: 'Food bank',
    description: 'Collecting and distributing food to people in need',
    suggestedTools: ['Airtable', 'Baserow', 'WhatsApp', 'Google Workspace', 'Canva', 'Google Maps Platform'],
  },
  {
    name: 'Advocacy & campaigns',
    description: 'Campaigning, lobbying, and public awareness activities',
    suggestedTools: ['Mailchimp', 'Brevo', 'Canva', 'WordPress', 'Meta/Facebook', 'Twitter/X', 'Bluesky', 'YouTube', 'ChatGPT'],
  },
  {
    name: 'Volunteer coordination',
    description: 'Recruiting, managing, and supporting volunteers',
    suggestedTools: ['Salesforce', 'CiviCRM', 'Slack', 'Google Workspace', 'WhatsApp', 'Notion', 'Mailchimp'],
  },
  {
    name: 'Research & policy',
    description: 'Conducting research, analysis, and policy development',
    suggestedTools: ['Google Workspace', 'Notion', 'Claude', 'Perplexity', 'Power BI', 'Metabase', 'QGIS', 'Airtable'],
  },
  {
    name: 'Digital inclusion',
    description: 'Supporting people to access and use digital technology',
    suggestedTools: ['Google Workspace', 'Zoom', 'WhatsApp', 'Canva', 'WordPress', 'Google Sheets', 'Lamplight'],
  },
  {
    name: 'Membership services',
    description: 'Managing members, subscriptions, and member communications',
    suggestedTools: ['CiviCRM', 'Beacon', 'Stripe', 'GoCardless', 'Mailchimp', 'WordPress', 'Notion'],
  },
  {
    name: 'Impact reporting',
    description: 'Measuring, analysing, and reporting on organisational impact',
    suggestedTools: ['Power BI', 'Metabase', 'Looker Studio', 'Google Sheets', 'Airtable', 'Claude', 'Notion'],
  },
];
