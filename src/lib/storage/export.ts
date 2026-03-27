import type { Architecture } from '@/lib/types';

/**
 * Serialise an Architecture object to pretty-printed JSON.
 */
export function exportAsJson(arch: Architecture): string {
  return JSON.stringify(arch, null, 2);
}

/**
 * Trigger a browser download of the Architecture as a JSON file.
 */
export function downloadJson(
  arch: Architecture,
  filename: string = 'stackmap-architecture.json',
): void {
  const json = exportAsJson(arch);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}
