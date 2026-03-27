import type { StandardFunction } from './types';

export interface FunctionSystemSuggestion {
  name: string;        // tool name — should match KNOWN_TOOLS where possible
  description: string; // brief context for why this is suggested
}

type OrgType = 'charity' | 'social_enterprise' | 'council' | 'cooperative' | 'private_business' | 'other';
type OrgSize = 'micro' | 'small' | 'medium' | 'large';

// ─── Suggestion data keyed by function type ───

interface SuggestionEntry {
  name: string;
  description: string;
  orgTypes?: OrgType[];   // if set, only show for these org types
  excludeTypes?: OrgType[]; // if set, hide for these org types
  sizes?: OrgSize[];       // if set, only show for these sizes
}

const SUGGESTIONS: Record<StandardFunction, SuggestionEntry[]> = {
  finance: [
    { name: 'Xero', description: 'Cloud accounting popular with small orgs' },
    { name: 'QuickBooks', description: 'Widely used accounting software' },
    { name: 'Sage', description: 'Common in larger charities', orgTypes: ['charity'] },
    { name: 'SAP', description: 'Enterprise financial management', orgTypes: ['council'] },
    { name: 'Unit4', description: 'Public sector financial software', orgTypes: ['council'] },
    { name: 'FreeAgent', description: 'Free alternative for small teams', sizes: ['micro', 'small'] },
    { name: 'Wave', description: 'Free accounting for micro orgs', sizes: ['micro', 'small'] },
  ],

  governance: [
    { name: 'Google Docs', description: 'Document collaboration for policies and minutes' },
    { name: 'SharePoint', description: 'Document management and intranet' },
    { name: 'OneDrive', description: 'Cloud storage for governance documents' },
    { name: 'Charity Commission portal', description: 'Regulatory filing for charities', orgTypes: ['charity'] },
    { name: 'Modern.gov', description: 'Council meeting and decision management', orgTypes: ['council'] },
  ],

  people: [
    { name: 'BreatheHR', description: 'HR management for SMEs' },
    { name: 'CharlieHR', description: 'Simple HR for small teams', sizes: ['micro', 'small'] },
    { name: 'iTrent', description: 'Public sector HR and payroll', orgTypes: ['council'] },
    { name: 'ResourceLink', description: 'Council HR and workforce management', orgTypes: ['council'] },
    { name: 'Google Sheets', description: 'Lightweight people tracking', sizes: ['micro'] },
  ],

  fundraising: [
    { name: 'Salesforce', description: 'CRM with NPSP for nonprofits', orgTypes: ['charity'] },
    { name: 'Donorfy', description: 'UK-built donor management', orgTypes: ['charity'] },
    { name: 'Beacon', description: 'Modern fundraising CRM', orgTypes: ['charity'] },
    { name: 'JustGiving', description: 'Online fundraising platform', orgTypes: ['charity'] },
    { name: 'HubSpot', description: 'CRM and marketing automation', orgTypes: ['social_enterprise', 'other'] },
    { name: 'Mailchimp', description: 'Email campaigns for fundraising' },
    { name: 'Google Sheets', description: 'Track income and grant applications', orgTypes: ['council', 'other'] },
    { name: 'Excel', description: 'Spreadsheet-based income tracking', orgTypes: ['council'] },
  ],

  communications: [
    { name: 'Mailchimp', description: 'Email marketing and newsletters' },
    { name: 'Canva', description: 'Design tool for social and print' },
    { name: 'WordPress', description: 'Website content management' },
    { name: 'Instagram', description: 'Visual social media platform' },
    { name: 'Meta/Facebook', description: 'Social media and community engagement' },
    { name: 'LinkedIn', description: 'Professional networking and updates' },
    { name: 'GovDelivery', description: 'Government digital communications', orgTypes: ['council'] },
  ],

  service_delivery: [
    { name: 'Lamplight', description: 'Case management for charities', orgTypes: ['charity'] },
    { name: 'Salesforce', description: 'Flexible CRM for service tracking', orgTypes: ['charity', 'social_enterprise'] },
    { name: 'Inform', description: 'Outcomes and case recording', orgTypes: ['charity'] },
    { name: 'Airtable', description: 'Flexible database for service data', orgTypes: ['social_enterprise', 'other'] },
    { name: 'Trello', description: 'Task and workflow management', orgTypes: ['social_enterprise', 'other'] },
    { name: 'Firmstep', description: 'Council digital service delivery', orgTypes: ['council'] },
    { name: 'Jadu', description: 'Council web and forms platform', orgTypes: ['council'] },
  ],

  operations: [
    { name: 'Microsoft 365', description: 'Productivity and collaboration suite' },
    { name: 'Google Workspace', description: 'Cloud-based productivity tools' },
    { name: 'Slack', description: 'Team messaging for smaller orgs', sizes: ['micro', 'small'] },
    { name: 'Microsoft Teams', description: 'Team communication for larger orgs', sizes: ['medium', 'large'] },
    { name: 'Trello', description: 'Simple project boards', sizes: ['micro', 'small'] },
    { name: 'Asana', description: 'Project management at scale', sizes: ['medium', 'large'] },
  ],

  data_reporting: [
    { name: 'Google Sheets', description: 'Collaborative spreadsheets for data' },
    { name: 'Excel', description: 'Spreadsheet analysis and reporting' },
    { name: 'Power BI', description: 'Business intelligence dashboards', sizes: ['medium', 'large'] },
    { name: 'Tableau', description: 'Data visualisation platform', sizes: ['medium', 'large'] },
    { name: 'Impact reporting spreadsheet', description: 'Template for funder reports', orgTypes: ['charity'] },
  ],
};

/**
 * Returns suggested systems for a given function type, filtered by org type and size.
 */
export function getSuggestedSystems(
  functionType: StandardFunction,
  orgType: OrgType,
  orgSize?: OrgSize,
): FunctionSystemSuggestion[] {
  const entries = SUGGESTIONS[functionType];
  if (!entries) return [];

  return entries
    .filter((entry) => {
      // Filter by org type
      if (entry.orgTypes && !entry.orgTypes.includes(orgType)) return false;
      if (entry.excludeTypes && entry.excludeTypes.includes(orgType)) return false;

      // Filter by size (if size specified and entry has size restriction)
      if (entry.sizes && orgSize && !entry.sizes.includes(orgSize)) return false;

      return true;
    })
    .map(({ name, description }) => ({ name, description }));
}
