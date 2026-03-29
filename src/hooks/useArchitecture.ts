'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createElement } from 'react';
import type {
  Architecture,
  Organisation,
  System,
  OrgFunction,
  Service,
  DataCategory,
  Integration,
  Owner,
  MappingPath,
} from '@/lib/types';
import type { StorageAdapter } from '@/lib/storage/adapter';
import { LocalStorageAdapter } from '@/lib/storage/local';
import { v4 as uuidv4 } from 'uuid';

// ─── Context value shape ───

export interface ArchitectureContextValue {
  architecture: Architecture | null;
  isLoading: boolean;

  // Organisation
  updateOrganisation: (org: Partial<Organisation>) => void;

  // Functions
  addFunction: (fn: Omit<OrgFunction, 'id'>) => string;
  updateFunction: (id: string, updates: Partial<Omit<OrgFunction, 'id'>>) => void;
  removeFunction: (id: string) => void;

  // Services
  addService: (svc: Omit<Service, 'id'>) => string;
  updateService: (id: string, updates: Partial<Omit<Service, 'id'>>) => void;
  removeService: (id: string) => void;

  // Systems
  addSystem: (system: Omit<System, 'id'>) => string;
  updateSystem: (id: string, updates: Partial<Omit<System, 'id'>>) => void;
  removeSystem: (id: string) => void;

  // Data categories
  addDataCategory: (dc: Omit<DataCategory, 'id'>) => string;
  removeDataCategory: (id: string) => void;

  // Integrations
  addIntegration: (intg: Omit<Integration, 'id'>) => string;
  removeIntegration: (id: string) => void;

  // Owners
  addOwner: (owner: Omit<Owner, 'id'>) => string;
  removeOwner: (id: string) => void;

  // Bulk replace
  replaceArchitecture: (arch: Architecture) => void;

  // Metadata
  setTechFreedomEnabled: (enabled: boolean) => void;

  // Persistence
  save: () => Promise<void>;
  clear: () => Promise<void>;
  getArchitecture: () => Architecture | null;
}

const ArchitectureContext = createContext<ArchitectureContextValue | null>(null);

// ─── Helper: create a blank Architecture ───

function createBlankArchitecture(mappingPath: MappingPath = 'function_first'): Architecture {
  const now = new Date().toISOString();
  return {
    organisation: {
      id: uuidv4(),
      name: '',
      type: 'charity',
      createdAt: now,
      updatedAt: now,
    },
    functions: [],
    services: [],
    systems: [],
    dataCategories: [],
    integrations: [],
    owners: [],
    metadata: {
      version: '1.0.0',
      exportedAt: now,
      stackmapVersion: '0.1.0',
      mappingPath,
      techFreedomEnabled: false,
    },
  };
}

// ─── Provider props ───

export interface ArchitectureProviderProps {
  children: ReactNode;
  adapter?: StorageAdapter;
  mappingPath?: MappingPath;
}

// ─── Provider component ───

export function ArchitectureProvider({
  children,
  adapter,
  mappingPath = 'function_first',
}: ArchitectureProviderProps) {
  const storageAdapter = adapter ?? new LocalStorageAdapter();
  const [architecture, setArchitecture] = useState<Architecture | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    let cancelled = false;
    storageAdapter.load().then((loaded) => {
      if (!cancelled) {
        setArchitecture(loaded ?? createBlankArchitecture(mappingPath));
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to storage whenever architecture changes
  useEffect(() => {
    if (!isLoading && architecture) {
      storageAdapter.save(architecture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [architecture, isLoading]);

  // Generic updater that bumps organisation.updatedAt
  const updateArch = useCallback(
    (updater: (prev: Architecture) => Architecture) => {
      setArchitecture((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        return {
          ...next,
          organisation: {
            ...next.organisation,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [],
  );

  // ─── Organisation ───

  const updateOrganisation = useCallback(
    (org: Partial<Organisation>) => {
      updateArch((prev) => ({
        ...prev,
        organisation: { ...prev.organisation, ...org },
      }));
    },
    [updateArch],
  );

  // ─── Functions ───

  const addFunction = useCallback(
    (fn: Omit<OrgFunction, 'id'>): string => {
      const id = uuidv4();
      updateArch((prev) => ({
        ...prev,
        functions: [...prev.functions, { ...fn, id }],
      }));
      return id;
    },
    [updateArch],
  );

  const updateFunction = useCallback(
    (id: string, updates: Partial<Omit<OrgFunction, 'id'>>) => {
      updateArch((prev) => ({
        ...prev,
        functions: prev.functions.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      }));
    },
    [updateArch],
  );

  const removeFunction = useCallback(
    (id: string) => {
      updateArch((prev) => ({
        ...prev,
        functions: prev.functions.filter((f) => f.id !== id),
      }));
    },
    [updateArch],
  );

  // ─── Services ───

  const addService = useCallback(
    (svc: Omit<Service, 'id'>): string => {
      const id = uuidv4();
      updateArch((prev) => ({
        ...prev,
        services: [...prev.services, { ...svc, id }],
      }));
      return id;
    },
    [updateArch],
  );

  const updateService = useCallback(
    (id: string, updates: Partial<Omit<Service, 'id'>>) => {
      updateArch((prev) => ({
        ...prev,
        services: prev.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
    },
    [updateArch],
  );

  const removeService = useCallback(
    (id: string) => {
      updateArch((prev) => ({
        ...prev,
        services: prev.services.filter((s) => s.id !== id),
      }));
    },
    [updateArch],
  );

  // ─── Systems ───

  const addSystem = useCallback(
    (system: Omit<System, 'id'>): string => {
      const id = uuidv4();
      updateArch((prev) => ({
        ...prev,
        systems: [...prev.systems, { ...system, id }],
      }));
      return id;
    },
    [updateArch],
  );

  const updateSystem = useCallback(
    (id: string, updates: Partial<Omit<System, 'id'>>) => {
      updateArch((prev) => ({
        ...prev,
        systems: prev.systems.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
    },
    [updateArch],
  );

  const removeSystem = useCallback(
    (id: string) => {
      updateArch((prev) => ({
        ...prev,
        systems: prev.systems.filter((s) => s.id !== id),
      }));
    },
    [updateArch],
  );

  // ─── Data Categories ───

  const addDataCategory = useCallback(
    (dc: Omit<DataCategory, 'id'>): string => {
      const id = uuidv4();
      updateArch((prev) => ({
        ...prev,
        dataCategories: [...prev.dataCategories, { ...dc, id }],
      }));
      return id;
    },
    [updateArch],
  );

  const removeDataCategory = useCallback(
    (id: string) => {
      updateArch((prev) => ({
        ...prev,
        dataCategories: prev.dataCategories.filter((dc) => dc.id !== id),
      }));
    },
    [updateArch],
  );

  // ─── Integrations ───

  const addIntegration = useCallback(
    (intg: Omit<Integration, 'id'>): string => {
      const id = uuidv4();
      updateArch((prev) => ({
        ...prev,
        integrations: [...prev.integrations, { ...intg, id }],
      }));
      return id;
    },
    [updateArch],
  );

  const removeIntegration = useCallback(
    (id: string) => {
      updateArch((prev) => ({
        ...prev,
        integrations: prev.integrations.filter((i) => i.id !== id),
      }));
    },
    [updateArch],
  );

  // ─── Owners ───

  const addOwner = useCallback(
    (owner: Omit<Owner, 'id'>): string => {
      const id = uuidv4();
      updateArch((prev) => ({
        ...prev,
        owners: [...prev.owners, { ...owner, id }],
      }));
      return id;
    },
    [updateArch],
  );

  const removeOwner = useCallback(
    (id: string) => {
      updateArch((prev) => ({
        ...prev,
        owners: prev.owners.filter((o) => o.id !== id),
      }));
    },
    [updateArch],
  );

  // ─── Bulk replace ───

  const replaceArchitecture = useCallback((arch: Architecture) => {
    setArchitecture(arch);
  }, []);

  // ─── Metadata ───

  const setTechFreedomEnabled = useCallback(
    (enabled: boolean) => {
      updateArch((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, techFreedomEnabled: enabled },
      }));
    },
    [updateArch],
  );

  // ─── Persistence ───

  const save = useCallback(async () => {
    if (architecture) {
      await storageAdapter.save(architecture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [architecture]);

  const clear = useCallback(async () => {
    await storageAdapter.clear();
    setArchitecture(createBlankArchitecture(mappingPath));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getArchitecture = useCallback(() => architecture, [architecture]);

  const value: ArchitectureContextValue = {
    architecture,
    isLoading,
    updateOrganisation,
    addFunction,
    updateFunction,
    removeFunction,
    addService,
    updateService,
    removeService,
    addSystem,
    updateSystem,
    removeSystem,
    addDataCategory,
    removeDataCategory,
    addIntegration,
    removeIntegration,
    addOwner,
    removeOwner,
    replaceArchitecture,
    setTechFreedomEnabled,
    save,
    clear,
    getArchitecture,
  };

  return createElement(ArchitectureContext.Provider, { value }, children);
}

// ─── Hook ───

export function useArchitecture(): ArchitectureContextValue {
  const context = useContext(ArchitectureContext);
  if (!context) {
    throw new Error('useArchitecture must be used within an ArchitectureProvider');
  }
  return context;
}
