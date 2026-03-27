import type { Architecture } from '@/lib/types';
import type { StorageAdapter } from './adapter';

export const STORAGE_KEY = 'stackmap_architecture';

interface LocalStorageAdapterOptions {
  forceInMemory?: boolean;
}

export class LocalStorageAdapter implements StorageAdapter {
  private inMemoryStore: string | null = null;
  private readonly useMemory: boolean;

  constructor(options?: LocalStorageAdapterOptions) {
    this.useMemory = options?.forceInMemory ?? !LocalStorageAdapter.isLocalStorageAvailable();
  }

  private static isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__stackmap_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  async load(): Promise<Architecture | null> {
    try {
      const raw = this.useMemory
        ? this.inMemoryStore
        : localStorage.getItem(STORAGE_KEY);

      if (raw === null || raw === undefined) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (parsed === null || parsed === undefined) {
        return null;
      }

      return parsed as Architecture;
    } catch {
      // Corrupt data — clear it
      if (this.useMemory) {
        this.inMemoryStore = null;
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      return null;
    }
  }

  async save(arch: Architecture): Promise<void> {
    const json = JSON.stringify(arch);
    if (this.useMemory) {
      this.inMemoryStore = json;
    } else {
      localStorage.setItem(STORAGE_KEY, json);
    }
  }

  async clear(): Promise<void> {
    if (this.useMemory) {
      this.inMemoryStore = null;
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
