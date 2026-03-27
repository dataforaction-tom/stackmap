import { describe, it, expect } from 'vitest';
import { getSuggestedSystems } from '../../src/lib/function-templates';
import type { StandardFunction } from '../../src/lib/types';

const ALL_FUNCTIONS: StandardFunction[] = [
  'finance',
  'governance',
  'people',
  'fundraising',
  'communications',
  'service_delivery',
  'operations',
  'data_reporting',
];

describe('getSuggestedSystems', () => {
  it('returns suggestions for each function type', () => {
    for (const fn of ALL_FUNCTIONS) {
      const results = getSuggestedSystems(fn, 'charity');
      expect(results.length).toBeGreaterThan(0);
    }
  });

  it('returns at least 2 suggestions per function', () => {
    const orgTypes = ['charity', 'social_enterprise', 'council', 'other'] as const;
    for (const fn of ALL_FUNCTIONS) {
      for (const orgType of orgTypes) {
        const results = getSuggestedSystems(fn, orgType);
        expect(
          results.length,
          `Expected at least 2 suggestions for ${fn}/${orgType}, got ${results.length}`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('all suggestion names are non-empty strings', () => {
    for (const fn of ALL_FUNCTIONS) {
      const results = getSuggestedSystems(fn, 'charity');
      for (const sug of results) {
        expect(sug.name).toBeTruthy();
        expect(typeof sug.name).toBe('string');
        expect(sug.name.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('all suggestions have non-empty descriptions', () => {
    for (const fn of ALL_FUNCTIONS) {
      const results = getSuggestedSystems(fn, 'charity');
      for (const sug of results) {
        expect(sug.description).toBeTruthy();
        expect(sug.description.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('suggestions vary by org type — charity vs council', () => {
    // Finance: charities get Sage, councils get SAP
    const charityFinance = getSuggestedSystems('finance', 'charity');
    const councilFinance = getSuggestedSystems('finance', 'council');

    const charityNames = charityFinance.map((s) => s.name);
    const councilNames = councilFinance.map((s) => s.name);

    expect(charityNames).toContain('Sage');
    expect(charityNames).not.toContain('SAP');

    expect(councilNames).toContain('SAP');
    expect(councilNames).not.toContain('Sage');
  });

  it('suggestions vary by org type — charity vs social enterprise for fundraising', () => {
    const charityFR = getSuggestedSystems('fundraising', 'charity');
    const seFR = getSuggestedSystems('fundraising', 'social_enterprise');

    const charityNames = charityFR.map((s) => s.name);
    const seNames = seFR.map((s) => s.name);

    expect(charityNames).toContain('Donorfy');
    expect(seNames).toContain('HubSpot');
    expect(seNames).not.toContain('Donorfy');
  });

  it('filters by size — micro orgs get FreeAgent, large orgs do not', () => {
    const micro = getSuggestedSystems('finance', 'other', 'micro');
    const large = getSuggestedSystems('finance', 'other', 'large');

    const microNames = micro.map((s) => s.name);
    const largeNames = large.map((s) => s.name);

    expect(microNames).toContain('FreeAgent');
    expect(largeNames).not.toContain('FreeAgent');
  });

  it('operations suggests Slack for small orgs and Teams for large orgs', () => {
    const small = getSuggestedSystems('operations', 'other', 'small');
    const large = getSuggestedSystems('operations', 'other', 'large');

    const smallNames = small.map((s) => s.name);
    const largeNames = large.map((s) => s.name);

    expect(smallNames).toContain('Slack');
    expect(smallNames).not.toContain('Microsoft Teams');

    expect(largeNames).toContain('Microsoft Teams');
    expect(largeNames).not.toContain('Slack');
  });

  it('council governance includes Modern.gov', () => {
    const council = getSuggestedSystems('governance', 'council');
    const names = council.map((s) => s.name);
    expect(names).toContain('Modern.gov');
  });

  it('charity governance does not include Modern.gov', () => {
    const charity = getSuggestedSystems('governance', 'charity');
    const names = charity.map((s) => s.name);
    expect(names).not.toContain('Modern.gov');
  });

  it('data_reporting includes Power BI for medium/large only', () => {
    const medium = getSuggestedSystems('data_reporting', 'other', 'medium');
    const micro = getSuggestedSystems('data_reporting', 'other', 'micro');

    expect(medium.map((s) => s.name)).toContain('Power BI');
    expect(micro.map((s) => s.name)).not.toContain('Power BI');
  });

  it('returns empty array for unknown function type', () => {
    // TypeScript would catch this, but testing runtime safety
    const results = getSuggestedSystems('nonexistent' as StandardFunction, 'charity');
    expect(results).toEqual([]);
  });
});
