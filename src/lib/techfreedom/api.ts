import type { KnownTool } from './types';
import { KNOWN_TOOLS } from './tools';

const CACHE_KEY = 'stackmap_techfreedom_tools';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const API_TIMEOUT = 5000;

interface CachedTools {
  tools: KnownTool[];
  fetchedAt: number;
}

export async function fetchKnownTools(): Promise<KnownTool[]> {
  // Check cache first
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedTools = JSON.parse(cached);
        if (Date.now() - parsed.fetchedAt < CACHE_TTL) {
          return parsed.tools;
        }
      }
    } catch {
      // Ignore cache errors
    }
  }

  // Try API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
    const response = await fetch(
      'https://api.techfreedom.eu/api/collections/tools/records?perPage=100',
      { signal: controller.signal },
    );
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`API returned ${response.status}`);

    const data = await response.json();
    const tools: KnownTool[] = data.items.map(
      (item: Record<string, unknown>) => ({
        slug: item.slug as string,
        name: item.name as string,
        provider: item.provider as string,
        category: item.category as string,
        score: {
          jurisdiction: item.jurisdiction as number,
          continuity: item.continuity as number,
          surveillance: item.surveillance as number,
          lockIn: item.lockIn as number,
          costExposure: item.costExposure as number,
          isAutoScored: true,
        },
        keyRisks: (item.keyRisks as string) ?? '',
      }),
    );

    // Cache the result
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ tools, fetchedAt: Date.now() }),
        );
      } catch {
        // Ignore storage errors
      }
    }

    return tools;
  } catch {
    // Fallback to embedded data
    return KNOWN_TOOLS;
  }
}
