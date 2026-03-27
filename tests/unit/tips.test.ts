import { describe, it, expect } from 'vitest';
import { getTip } from '@/components/wizard/tips';
import type { Architecture } from '@/lib/types';

const blank: Architecture = {
  organisation: { id: '1', name: '', type: 'charity', createdAt: '', updatedAt: '' },
  functions: [],
  services: [],
  systems: [],
  dataCategories: [],
  integrations: [],
  owners: [],
  metadata: { version: '1', exportedAt: '', stackmapVersion: '0.1.0', mappingPath: 'function_first', techFreedomEnabled: false },
};

describe('getTip', () => {
  // Functions step
  it('returns start prompt when no functions selected', () => {
    const tip = getTip('/wizard/functions', blank);
    expect(tip).toMatch(/select/i);
  });

  it('returns encouragement when 1-3 functions selected', () => {
    const arch = { ...blank, functions: [
      { id: '1', name: 'Finance', type: 'finance' as const, isActive: true },
    ]};
    const tip = getTip('/wizard/functions', arch);
    expect(tip).toMatch(/most organisations/i);
  });

  it('returns good coverage when 6+ functions', () => {
    const fns = Array.from({ length: 6 }, (_, i) => ({
      id: String(i), name: `Fn${i}`, type: 'finance' as const, isActive: true,
    }));
    const arch = { ...blank, functions: fns };
    const tip = getTip('/wizard/functions', arch);
    expect(tip).toMatch(/coverage/i);
  });

  // Systems step
  it('returns prompt when systems step has no systems', () => {
    const tip = getTip('/wizard/functions/systems', blank);
    expect(tip).toMatch(/software/i);
  });

  it('mentions spreadsheets when few systems added', () => {
    const arch = { ...blank, systems: [
      { id: '1', name: 'Xero', type: 'finance' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [] },
    ]};
    const tip = getTip('/wizard/functions/systems', arch);
    expect(tip).toMatch(/spreadsheet/i);
  });

  // Services step
  it('returns optional message for services', () => {
    const tip = getTip('/wizard/functions/services', blank);
    expect(tip).toMatch(/optional/i);
  });

  // Data step
  it('mentions personal data on data step', () => {
    const tip = getTip('/wizard/functions/data', blank);
    expect(tip).toMatch(/personal data/i);
  });

  // Integrations step
  it('normalises few integrations', () => {
    const tip = getTip('/wizard/functions/integrations', blank);
    expect(tip).toMatch(/normal/i);
  });

  // Owners step
  it('shows unassigned count when systems lack owners', () => {
    const arch = { ...blank, systems: [
      { id: '1', name: 'Xero', type: 'finance' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [] },
      { id: '2', name: 'Slack', type: 'messaging' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [] },
    ]};
    const tip = getTip('/wizard/functions/owners', arch);
    expect(tip).toMatch(/2 systems/i);
  });

  it('congratulates when all systems have owners', () => {
    const arch = { ...blank, systems: [
      { id: '1', name: 'Xero', type: 'finance' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [], ownerId: 'o1' },
    ], owners: [{ id: 'o1', name: 'Sarah', isExternal: false }]};
    const tip = getTip('/wizard/functions/owners', arch);
    expect(tip).toMatch(/owner/i);
  });

  // Review step
  it('returns summary for review step', () => {
    const arch = { ...blank, functions: [
      { id: '1', name: 'Finance', type: 'finance' as const, isActive: true },
    ], systems: [
      { id: '1', name: 'Xero', type: 'finance' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: ['1'], serviceIds: [] },
    ]};
    const tip = getTip('/wizard/functions/review', arch);
    expect(tip.length).toBeGreaterThan(0);
  });

  // Unknown path
  it('returns empty for unknown paths', () => {
    expect(getTip('/unknown', blank)).toBe('');
  });
});
