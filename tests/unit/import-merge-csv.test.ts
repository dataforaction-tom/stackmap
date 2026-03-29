import { describe, it, expect } from 'vitest';
import { mergeCsvIntoArchitecture } from '@/lib/import/csv-to-architecture';
import type { Architecture } from '@/lib/types';
import type { CsvSystemRow } from '@/lib/import';

const baseArch: Architecture = {
  organisation: {
    id: 'o1',
    name: 'Test Org',
    type: 'charity',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  functions: [{ id: 'f1', name: 'Finance', type: 'finance', isActive: true }],
  services: [],
  systems: [
    {
      id: 's1',
      name: 'Xero',
      type: 'finance',
      hosting: 'cloud',
      status: 'active',
      functionIds: ['f1'],
      serviceIds: [],
    },
  ],
  dataCategories: [],
  integrations: [],
  owners: [],
  metadata: {
    version: '1',
    exportedAt: '2026-01-01',
    stackmapVersion: '0.3.0',
    mappingPath: 'function_first',
  },
};

describe('mergeCsvIntoArchitecture', () => {
  it('appends new systems to existing architecture', () => {
    const rows: CsvSystemRow[] = [
      {
        name: 'Slack',
        vendor: 'Salesforce',
        matchedType: 'messaging',
        matchedFunction: 'communications',
        completeness: 'full',
      },
    ];

    const result = mergeCsvIntoArchitecture(rows, baseArch);

    expect(result.systems.length).toBe(2);
    expect(result.systems[0].name).toBe('Xero');
    expect(result.systems[1].name).toBe('Slack');
  });

  it('reuses existing function when type matches', () => {
    const rows: CsvSystemRow[] = [
      {
        name: 'QuickBooks',
        vendor: 'Intuit',
        matchedType: 'finance',
        matchedFunction: 'finance',
        completeness: 'full',
      },
    ];

    const result = mergeCsvIntoArchitecture(rows, baseArch);

    // Should not create a new finance function
    expect(result.functions.length).toBe(1);
    expect(result.functions[0].id).toBe('f1');
    // New system should reference the existing function
    expect(result.systems[1].functionIds).toEqual(['f1']);
  });

  it('creates new function when type does not exist', () => {
    const rows: CsvSystemRow[] = [
      {
        name: 'Slack',
        vendor: 'Salesforce',
        matchedType: 'messaging',
        matchedFunction: 'communications',
        completeness: 'full',
      },
    ];

    const result = mergeCsvIntoArchitecture(rows, baseArch);

    expect(result.functions.length).toBe(2);
    expect(result.functions[0].type).toBe('finance');
    expect(result.functions[1].type).toBe('communications');
    expect(result.functions[1].name).toBe('Communications');
    // New system should reference the new function
    expect(result.systems[1].functionIds).toEqual([result.functions[1].id]);
  });

  it('preserves all existing data untouched', () => {
    const archWithData: Architecture = {
      ...baseArch,
      services: [
        {
          id: 'svc1',
          name: 'Grants',
          status: 'active',
          functionIds: ['f1'],
          systemIds: ['s1'],
        },
      ],
      dataCategories: [
        {
          id: 'dc1',
          name: 'Financial',
          sensitivity: 'confidential',
          containsPersonalData: false,
          systemIds: ['s1'],
        },
      ],
      integrations: [
        {
          id: 'int1',
          sourceSystemId: 's1',
          targetSystemId: 's1',
          type: 'api',
          direction: 'one_way',
          frequency: 'real_time',
          reliability: 'reliable',
        },
      ],
      owners: [{ id: 'own1', name: 'Alice', isExternal: false }],
    };

    const rows: CsvSystemRow[] = [
      {
        name: 'Trello',
        vendor: 'Atlassian',
        matchedType: 'other',
        completeness: 'partial',
      },
    ];

    const result = mergeCsvIntoArchitecture(rows, archWithData);

    expect(result.services).toEqual(archWithData.services);
    expect(result.dataCategories).toEqual(archWithData.dataCategories);
    expect(result.integrations).toEqual(archWithData.integrations);
    expect(result.owners).toEqual(archWithData.owners);
    expect(result.metadata).toEqual(archWithData.metadata);
    expect(result.organisation.name).toBe('Test Org');
    expect(result.organisation.updatedAt).not.toBe('2026-01-01');
  });
});
