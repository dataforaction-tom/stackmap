import { v4 as uuidv4 } from 'uuid';
import type { StandardFunction, OrgFunction } from './types';

// ─── Standard function definition with metadata ───

export interface StandardFunctionDefinition {
  type: StandardFunction;
  name: string;
  description: string;
  typicalSystems: string[];
}

export const STANDARD_FUNCTIONS: StandardFunctionDefinition[] = [
  {
    type: 'finance',
    name: 'Finance',
    description: 'Financial management, accounting, budgeting, and reporting',
    typicalSystems: ['Xero', 'QuickBooks', 'Sage', 'Excel spreadsheets'],
  },
  {
    type: 'governance',
    name: 'Governance',
    description: 'Board management, compliance, policies, and organisational oversight',
    typicalSystems: ['BoardEffect', 'Diligent', 'Google Docs', 'SharePoint'],
  },
  {
    type: 'people',
    name: 'People',
    description: 'HR, recruitment, payroll, volunteering, and staff management',
    typicalSystems: ['BreatheHR', 'CharlieHR', 'Moorepay', 'Excel spreadsheets'],
  },
  {
    type: 'fundraising',
    name: 'Fundraising',
    description: 'Donor management, grant applications, campaigns, and income tracking',
    typicalSystems: ['Salesforce', 'Donorfy', 'Beacon', 'JustGiving'],
  },
  {
    type: 'communications',
    name: 'Communications',
    description: 'External communications, marketing, social media, and website management',
    typicalSystems: ['Mailchimp', 'WordPress', 'Hootsuite', 'Canva'],
  },
  {
    type: 'service_delivery',
    name: 'Service Delivery',
    description: 'Delivery of core services, programmes, and activities to beneficiaries',
    typicalSystems: ['Lamplight', 'Salesforce', 'Inform', 'Case management tools'],
  },
  {
    type: 'operations',
    name: 'Operations',
    description: 'Day-to-day operations, facilities, logistics, and procurement',
    typicalSystems: ['Microsoft 365', 'Google Workspace', 'Trello', 'Asana'],
  },
  {
    type: 'data_reporting',
    name: 'Data & Reporting',
    description: 'Impact measurement, data collection, analysis, and funder reporting',
    typicalSystems: ['Power BI', 'Google Sheets', 'Tableau', 'Excel'],
  },
];

/**
 * Returns all standard functions as OrgFunction objects, ready for use in an architecture.
 * Each function is active by default and gets a unique generated id.
 */
export function getStandardFunctions(): OrgFunction[] {
  return STANDARD_FUNCTIONS.map((def) => ({
    id: uuidv4(),
    name: def.name,
    type: def.type,
    description: def.description,
    isActive: true,
  }));
}

/**
 * Look up a standard function definition by its type.
 */
export function getStandardFunctionByType(
  type: StandardFunction,
): StandardFunctionDefinition | undefined {
  return STANDARD_FUNCTIONS.find((f) => f.type === type);
}

/**
 * Create a custom OrgFunction with a generated id.
 */
export function createCustomFunction(name: string, description?: string): OrgFunction {
  return {
    id: uuidv4(),
    name,
    type: 'custom',
    description,
    isActive: true,
  };
}
