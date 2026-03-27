'use client';

import { useArchitecture } from '@/hooks/useArchitecture';

export function MapStats() {
  const { architecture } = useArchitecture();
  if (!architecture) return null;

  const { functions, systems, integrations, owners } = architecture;

  const stats = [
    { label: 'function', count: functions.length, icon: '\u25aa' },
    { label: 'system', count: systems.length, icon: '\u25cf' },
    { label: 'integration', count: integrations.length, icon: '\u27f7' },
    { label: 'owner', count: owners.length, icon: '\u25c9' },
  ].filter((s) => s.count > 0);

  return (
    <div aria-live="polite" aria-label="Architecture summary" className="space-y-1">
      {stats.length === 0 ? (
        <p className="text-sm text-primary-400">No items yet</p>
      ) : (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-primary-700 list-none p-0 m-0">
          {stats.map((s) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-primary-400 text-xs">{s.icon}</span>
              <span className="font-medium tabular-nums">{s.count}</span>
              <span>{s.count === 1 ? s.label : `${s.label}s`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
