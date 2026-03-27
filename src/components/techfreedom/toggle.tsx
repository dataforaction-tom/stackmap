'use client';

import { useAppConfig } from '@/hooks/useAppConfig';
import { useArchitecture } from '@/hooks/useArchitecture';

export function TechFreedomToggle() {
  const { config } = useAppConfig();
  const { architecture, isLoading, setTechFreedomEnabled } = useArchitecture();

  if (!config.techFreedomAvailable || isLoading || !architecture) {
    return null;
  }

  const enabled = architecture.metadata.techFreedomEnabled ?? false;

  return (
    <div className="bg-surface-50 border border-surface-200 rounded-lg px-4 py-3">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setTechFreedomEnabled(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-1"
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-primary-800">
            Include TechFreedom risk assessment
          </span>
          <span className="text-xs text-surface-600 leading-relaxed">
            Assess your technology stack against five risk dimensions: jurisdiction, continuity,
            surveillance, lock-in, and cost exposure.
          </span>
        </div>
      </label>
    </div>
  );
}
