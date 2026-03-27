import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAdapter, STORAGE_KEY } from '@/lib/storage/local';
import type { Architecture } from '@/lib/types';

const mockArchitecture: Architecture = {
  organisation: {
    id: 'org-1',
    name: 'Acme Corp',
    type: 'charity',

    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  functions: [
    { id: 'fn-1', name: 'Finance', type: 'finance', isActive: true },
  ],
  services: [],
  systems: [
    {
      id: 'sys-1',
      name: 'CRM',
      type: 'crm',
      hosting: 'cloud',
      status: 'active',
      functionIds: ['fn-1'],
      serviceIds: [],
    },
  ],
  dataCategories: [],
  integrations: [],
  owners: [],
  metadata: {
    version: '1.0.0',
    exportedAt: '2026-01-01T00:00:00.000Z',
    stackmapVersion: '0.1.0',
    mappingPath: 'function_first',
  },
};

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter();
  });

  describe('load', () => {
    it('returns null when no data is stored', async () => {
      const result = await adapter.load();
      expect(result).toBeNull();
    });

    it('returns parsed Architecture when valid data exists', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockArchitecture));
      const result = await adapter.load();
      expect(result).toEqual(mockArchitecture);
    });

    it('returns null and clears corrupt data', async () => {
      localStorage.setItem(STORAGE_KEY, '{invalid json!!!');
      const result = await adapter.load();
      expect(result).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('returns null when stored value is "null"', async () => {
      localStorage.setItem(STORAGE_KEY, 'null');
      const result = await adapter.load();
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('persists Architecture to localStorage', async () => {
      await adapter.save(mockArchitecture);
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(mockArchitecture);
    });

    it('overwrites existing data', async () => {
      await adapter.save(mockArchitecture);
      const updated: Architecture = {
        ...mockArchitecture,
        organisation: { ...mockArchitecture.organisation, name: 'Updated Corp' },
      };
      await adapter.save(updated);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.organisation.name).toBe('Updated Corp');
    });
  });

  describe('clear', () => {
    it('removes data from localStorage', async () => {
      await adapter.save(mockArchitecture);
      await adapter.clear();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('does not throw when no data exists', async () => {
      await expect(adapter.clear()).resolves.toBeUndefined();
    });
  });

  describe('SSR fallback (in-memory)', () => {
    it('works when localStorage is unavailable', async () => {
      const memAdapter = new LocalStorageAdapter({ forceInMemory: true });

      // save and load
      await memAdapter.save(mockArchitecture);
      const result = await memAdapter.load();
      expect(result).toEqual(mockArchitecture);

      // clear
      await memAdapter.clear();
      const cleared = await memAdapter.load();
      expect(cleared).toBeNull();
    });
  });
});
