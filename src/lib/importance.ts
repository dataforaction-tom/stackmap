export type ImportanceTierKey = 'core' | 'important' | 'peripheral';

export interface ImportanceTier {
  tier: ImportanceTierKey;
  label: string;
}

export const IMPORTANCE_TIERS: {
  key: ImportanceTierKey;
  label: string;
  min: number;
  max: number;
  color: string;
}[] = [
  { key: 'core', label: 'Core', min: 8, max: 10, color: '#22c55e' },
  { key: 'important', label: 'Important', min: 4, max: 7, color: '#f59e0b' },
  { key: 'peripheral', label: 'Peripheral', min: 1, max: 3, color: '#9ca3af' },
];

export function getImportanceTier(
  score: number | undefined,
): ImportanceTier | null {
  if (score === undefined) return null;
  if (score >= 8) return { tier: 'core', label: 'Core' };
  if (score >= 4) return { tier: 'important', label: 'Important' };
  return { tier: 'peripheral', label: 'Peripheral' };
}
