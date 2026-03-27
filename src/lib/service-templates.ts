export interface ServiceTemplate {
  name: string;
  description: string;
  suggestedTools: string[]; // tool names that match known tools database
}

export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    name: 'Advice sessions',
    description: 'One-to-one or group advice, guidance, and information services',
    suggestedTools: ['Salesforce', 'Microsoft 365', 'Zoom', 'Google Workspace'],
  },
  {
    name: 'Grant distribution',
    description: 'Managing and distributing grants or funds to beneficiaries',
    suggestedTools: ['Salesforce', 'Xero', 'Microsoft 365', 'Airtable'],
  },
  {
    name: 'Housing repairs',
    description: 'Managing property maintenance and repair requests',
    suggestedTools: ['Salesforce', 'Trello', 'Microsoft 365', 'WhatsApp'],
  },
  {
    name: 'Youth programmes',
    description: 'Activities, mentoring, and development for young people',
    suggestedTools: ['Salesforce', 'Canva', 'Instagram', 'WhatsApp', 'Zoom'],
  },
  {
    name: 'Training courses',
    description: 'Delivering education, workshops, and professional development',
    suggestedTools: ['Zoom', 'Google Workspace', 'Mailchimp', 'Canva', 'Eventbrite'],
  },
  {
    name: 'Community events',
    description: 'Organising public events, festivals, and community gatherings',
    suggestedTools: ['Eventbrite', 'Canva', 'Mailchimp', 'Instagram', 'Meta/Facebook'],
  },
  {
    name: 'Counselling',
    description: 'Professional counselling and therapeutic support services',
    suggestedTools: ['Salesforce', 'Zoom', 'Microsoft 365', 'Signal'],
  },
  {
    name: 'Food bank',
    description: 'Collecting and distributing food to people in need',
    suggestedTools: ['Airtable', 'WhatsApp', 'Google Workspace', 'Canva'],
  },
  {
    name: 'Advocacy & campaigns',
    description: 'Campaigning, lobbying, and public awareness activities',
    suggestedTools: ['Mailchimp', 'Canva', 'WordPress', 'Meta/Facebook', 'Twitter/X'],
  },
  {
    name: 'Volunteer coordination',
    description: 'Recruiting, managing, and supporting volunteers',
    suggestedTools: ['Salesforce', 'Slack', 'Google Workspace', 'WhatsApp'],
  },
];
