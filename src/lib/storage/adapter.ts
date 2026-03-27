import type { Architecture } from '@/lib/types';

export interface StorageAdapter {
  load(): Promise<Architecture | null>;
  save(arch: Architecture): Promise<void>;
  clear(): Promise<void>;
}
