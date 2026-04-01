import { describe, it, expect } from 'vitest';
import { getImportanceTier } from '@/lib/importance';

describe('getImportanceTier', () => {
  it('returns "core" for scores 8-10', () => {
    expect(getImportanceTier(8)).toEqual({ tier: 'core', label: 'Core' });
    expect(getImportanceTier(9)).toEqual({ tier: 'core', label: 'Core' });
    expect(getImportanceTier(10)).toEqual({ tier: 'core', label: 'Core' });
  });

  it('returns "important" for scores 4-7', () => {
    expect(getImportanceTier(4)).toEqual({ tier: 'important', label: 'Important' });
    expect(getImportanceTier(7)).toEqual({ tier: 'important', label: 'Important' });
  });

  it('returns "peripheral" for scores 1-3', () => {
    expect(getImportanceTier(1)).toEqual({ tier: 'peripheral', label: 'Peripheral' });
    expect(getImportanceTier(3)).toEqual({ tier: 'peripheral', label: 'Peripheral' });
  });

  it('returns null for undefined', () => {
    expect(getImportanceTier(undefined)).toBeNull();
  });
});
