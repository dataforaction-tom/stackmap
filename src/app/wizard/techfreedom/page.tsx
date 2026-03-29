'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useArchitecture } from '@/hooks/useArchitecture';

export default function TechFreedomStepPage() {
  const router = useRouter();
  const { architecture, setTechFreedomEnabled } = useArchitecture();

  const mappingPath = architecture?.metadata?.mappingPath ?? 'function_first';
  const enabled = architecture?.metadata?.techFreedomEnabled ?? false;
  const nextPath = mappingPath === 'service_first' ? '/wizard/services' : '/wizard/functions';

  const handleYes = useCallback(() => {
    setTechFreedomEnabled(true);
    router.push(nextPath);
  }, [setTechFreedomEnabled, router, nextPath]);

  const handleNo = useCallback(() => {
    setTechFreedomEnabled(false);
    router.push(nextPath);
  }, [setTechFreedomEnabled, router, nextPath]);

  if (!architecture) {
    return (
      <div className="flex items-center justify-center py-12" role="status">
        <p className="text-primary-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary-900">
          Do you want to assess technology risk?
        </h1>
        <p className="text-lg text-primary-700 leading-relaxed">
          TechFreedom scores help you understand vendor lock-in, surveillance risk,
          and data sovereignty across your tools. When enabled, Stackmap automatically
          scores known tools and highlights areas of concern.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleYes}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors
            ${enabled
              ? 'bg-primary-600 text-white border-2 border-primary-600'
              : 'border-2 border-surface-300 text-primary-700 hover:border-primary-400 hover:bg-primary-50'}
          `}
        >
          Yes, include risk assessment
        </button>
        <button
          type="button"
          onClick={handleNo}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors
            border-2 border-surface-300 text-primary-700 hover:border-primary-400 hover:bg-primary-50
          `}
        >
          No, skip this
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-surface-200">
        <Link
          href="/wizard"
          className="btn-secondary inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </Link>
      </div>
    </div>
  );
}
