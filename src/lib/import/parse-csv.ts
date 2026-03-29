import Papa from 'papaparse';
import type { SystemType, StandardFunction } from '@/lib/types';

export interface CsvSystemRow {
  name: string;
  vendor?: string;
  type?: string;
  matchedType: SystemType;
  hosting?: string;
  status?: string;
  cost?: number;
  costPeriod?: string;
  function?: string;
  matchedFunction?: StandardFunction;
  completeness: 'full' | 'partial' | 'minimal';
}

export type CsvParseResult =
  | { success: true; rows: CsvSystemRow[]; warnings: string[] }
  | { success: false; error: string };

// ─── Fuzzy matching helpers ───

const TYPE_ALIASES: Record<string, SystemType> = {
  crm: 'crm',
  'customer relationship management': 'crm',
  'customer relationship': 'crm',
  finance: 'finance',
  accounting: 'finance',
  accounts: 'finance',
  hr: 'hr',
  'human resources': 'hr',
  people: 'hr',
  payroll: 'hr',
  'case management': 'case_management',
  'case_management': 'case_management',
  casework: 'case_management',
  website: 'website',
  'web site': 'website',
  web: 'website',
  cms: 'website',
  email: 'email',
  'email marketing': 'email',
  mail: 'email',
  'document management': 'document_management',
  'document_management': 'document_management',
  'document management system': 'document_management',
  documents: 'document_management',
  database: 'database',
  'database system': 'database',
  db: 'database',
  spreadsheet: 'spreadsheet',
  'google sheets': 'spreadsheet',
  excel: 'spreadsheet',
  sheets: 'spreadsheet',
  messaging: 'messaging',
  chat: 'messaging',
  slack: 'messaging',
  teams: 'messaging',
  custom: 'custom',
};

const FUNCTION_ALIASES: Record<string, StandardFunction> = {
  finance: 'finance',
  'finance & accounting': 'finance',
  'finance and accounting': 'finance',
  accounting: 'finance',
  accounts: 'finance',
  governance: 'governance',
  'board management': 'governance',
  compliance: 'governance',
  people: 'people',
  hr: 'people',
  'human resources': 'people',
  'hr / people': 'people',
  payroll: 'people',
  fundraising: 'fundraising',
  'fundraising & development': 'fundraising',
  'fundraising and development': 'fundraising',
  development: 'fundraising',
  donations: 'fundraising',
  communications: 'communications',
  comms: 'communications',
  marketing: 'communications',
  'marketing & comms': 'communications',
  'marketing and communications': 'communications',
  'service delivery': 'service_delivery',
  'service_delivery': 'service_delivery',
  programmes: 'service_delivery',
  programs: 'service_delivery',
  operations: 'operations',
  ops: 'operations',
  it: 'operations',
  'it / operations': 'operations',
  'it operations': 'operations',
  'data reporting': 'data_reporting',
  'data_reporting': 'data_reporting',
  reporting: 'data_reporting',
  data: 'data_reporting',
  'reporting & data': 'data_reporting',
  analytics: 'data_reporting',
};

function fuzzyMatchType(raw: string): SystemType {
  const normalised = raw.trim().toLowerCase();

  // Direct match
  if (normalised in TYPE_ALIASES) {
    return TYPE_ALIASES[normalised];
  }

  // Substring match: check if any alias is contained in the input or vice versa
  for (const [alias, type] of Object.entries(TYPE_ALIASES)) {
    if (normalised.includes(alias) || alias.includes(normalised)) {
      return type;
    }
  }

  return 'other';
}

function fuzzyMatchFunction(raw: string): StandardFunction | undefined {
  const normalised = raw.trim().toLowerCase();

  if (!normalised) return undefined;

  // Direct match
  if (normalised in FUNCTION_ALIASES) {
    return FUNCTION_ALIASES[normalised];
  }

  // Substring match
  for (const [alias, fn] of Object.entries(FUNCTION_ALIASES)) {
    if (normalised.includes(alias) || alias.includes(normalised)) {
      return fn;
    }
  }

  return undefined;
}

function parseCost(raw: string): number | undefined {
  if (!raw || !raw.trim()) return undefined;
  // Strip currency symbols, commas, whitespace
  const cleaned = raw.replace(/[$£€,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

function normaliseHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

// ─── Column alias maps ───

const NAME_ALIASES = new Set(['name', 'system', 'tool']);
const COST_ALIASES = new Set(['cost', 'annual_cost', 'price']);
const FUNCTION_COLUMN_ALIASES = new Set(['function', 'department']);

export function parseCsvSystems(raw: string): CsvParseResult {
  if (!raw.trim()) {
    return { success: false, error: 'The CSV file is empty.' };
  }

  const parsed = Papa.parse<Record<string, string>>(raw.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: normaliseHeader,
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return { success: false, error: `CSV parsing failed: ${parsed.errors[0].message}` };
  }

  const headers = parsed.meta.fields ?? [];

  // Find the name column
  const nameCol = headers.find((h) => NAME_ALIASES.has(h));
  if (!nameCol) {
    return {
      success: false,
      error:
        'No name column found. The CSV must have a column called "name", "system", or "tool".',
    };
  }

  // Find alias columns
  const costCol = headers.find((h) => COST_ALIASES.has(h));
  const functionCol = headers.find((h) => FUNCTION_COLUMN_ALIASES.has(h));

  const rows: CsvSystemRow[] = [];
  const warnings: string[] = [];
  let skippedNoName = 0;

  for (const row of parsed.data) {
    const name = (row[nameCol] ?? '').trim();
    if (!name) {
      skippedNoName++;
      continue;
    }

    const typeRaw = (row['type'] ?? '').trim();
    const vendor = (row['vendor'] ?? '').trim() || undefined;
    const hosting = (row['hosting'] ?? '').trim() || undefined;
    const status = (row['status'] ?? '').trim() || undefined;
    const costRaw = costCol ? (row[costCol] ?? '').trim() : '';
    const costPeriodRaw = (row['cost_period'] ?? '').trim() || undefined;
    const functionRaw = functionCol ? (row[functionCol] ?? '').trim() : '';

    const matchedType = typeRaw ? fuzzyMatchType(typeRaw) : 'other';
    const matchedFunction = functionRaw ? fuzzyMatchFunction(functionRaw) : undefined;
    const cost = parseCost(costRaw);

    // Count non-name fields that have values
    const filledFields = [vendor, typeRaw, hosting, status, costRaw, functionRaw].filter(
      (v) => v && v.length > 0,
    ).length;

    const completeness: 'full' | 'partial' | 'minimal' =
      filledFields >= 3 ? 'full' : filledFields >= 1 ? 'partial' : 'minimal';

    const csvRow: CsvSystemRow = {
      name,
      matchedType,
      completeness,
    };

    if (vendor) csvRow.vendor = vendor;
    if (typeRaw) csvRow.type = typeRaw;
    if (hosting) csvRow.hosting = hosting;
    if (status) csvRow.status = status;
    if (cost !== undefined) csvRow.cost = cost;
    if (costPeriodRaw) csvRow.costPeriod = costPeriodRaw;
    if (functionRaw) csvRow.function = functionRaw;
    if (matchedFunction) csvRow.matchedFunction = matchedFunction;

    rows.push(csvRow);
  }

  if (skippedNoName > 0) {
    warnings.push(`Skipped ${skippedNoName} row${skippedNoName > 1 ? 's' : ''} with no name.`);
  }

  if (rows.length === 0) {
    return { success: false, error: 'No valid rows found in the CSV.' };
  }

  return { success: true, rows, warnings };
}
