'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AppConfig } from '@/lib/types';

const CONFIG_KEY = 'stackmap_config';
const DEFAULT_CONFIG: AppConfig = { techFreedomAvailable: true };

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) setConfig(JSON.parse(stored));
    } catch {
      // Ignore parse errors — use default
    }
  }, []);

  const updateConfig = useCallback((updates: Partial<AppConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return { config, updateConfig };
}
