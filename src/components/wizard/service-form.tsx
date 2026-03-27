'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useArchitecture } from '@/hooks/useArchitecture';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CheckboxGroup } from '@/components/ui/checkbox-group';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active - running now' },
  { value: 'planned', label: 'Planned - starting soon' },
  { value: 'retiring', label: 'Retiring - winding down' },
] as const;

interface ServiceDraft {
  name: string;
  description: string;
  status: 'active' | 'planned' | 'retiring';
  functionIds: string[];
  systemIds: string[];
}

const EMPTY_DRAFT: ServiceDraft = {
  name: '',
  description: '',
  status: 'active',
  functionIds: [],
  systemIds: [],
};

export function ServiceForm() {
  const router = useRouter();
  const { architecture, addService, removeService } = useArchitecture();

  // Hydrate from architecture on re-visit
  const [wantsServices, setWantsServices] = useState<boolean | null>(() => {
    const existing = architecture?.services ?? [];
    return existing.length > 0 ? true : null;
  });
  const [draft, setDraft] = useState<ServiceDraft>(EMPTY_DRAFT);
  const [added, setAdded] = useState<ServiceDraft[]>(() => {
    return (architecture?.services ?? []).map((svc) => ({
      name: svc.name,
      description: svc.description ?? '',
      status: svc.status,
      functionIds: svc.functionIds,
      systemIds: svc.systemIds,
    }));
  });

  const functions = architecture?.functions ?? [];
  const systems = architecture?.systems ?? [];

  const updateField = useCallback(
    <K extends keyof ServiceDraft>(field: K, value: ServiceDraft[K]) => {
      setDraft((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const toggleFunction = useCallback((fnId: string) => {
    setDraft((prev) => {
      const has = prev.functionIds.includes(fnId);
      return {
        ...prev,
        functionIds: has
          ? prev.functionIds.filter((id) => id !== fnId)
          : [...prev.functionIds, fnId],
      };
    });
  }, []);

  const handleAdd = useCallback(() => {
    if (!draft.name.trim()) return;
    setAdded((prev) => [...prev, { ...draft, name: draft.name.trim(), description: draft.description.trim() }]);
    setDraft(EMPTY_DRAFT);
  }, [draft]);

  const handleRemove = useCallback((index: number) => {
    setAdded((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleContinue = useCallback(() => {
    // Clear existing services to avoid duplicates on re-visit
    const existingServices = architecture?.services ?? [];
    for (const svc of existingServices) {
      removeService(svc.id);
    }

    for (const svc of added) {
      addService({
        name: svc.name,
        description: svc.description || undefined,
        status: svc.status,
        functionIds: svc.functionIds,
        systemIds: svc.systemIds,
      });
    }
    router.push('/wizard/functions/data');
  }, [added, addService, removeService, architecture, router]);

  const handleSkip = useCallback(() => {
    router.push('/wizard/functions/data');
  }, [router]);

  if (!architecture) {
    return (
      <div className="flex items-center justify-center py-12" role="status">
        <p className="text-primary-600">Loading...</p>
      </div>
    );
  }

  // Initial choice screen
  if (wantsServices === null) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary-900">
            Do you want to map specific services?
          </h1>
          <p className="text-lg text-primary-700">
            Services are the specific programmes or activities your organisation delivers, like
            &ldquo;Youth mentoring&rdquo; or &ldquo;Emergency food parcels&rdquo;. This step is
            optional &mdash; you can skip it if your systems aren&rsquo;t tied to particular services.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setWantsServices(true)}
            className="btn-primary px-6 py-3 rounded-lg font-medium"
          >
            Yes, add services
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="btn-secondary px-6 py-3 rounded-lg font-medium"
          >
            Skip this step
          </button>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-surface-200">
          <Link
            href="/wizard/functions/systems"
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

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary-900">
          Add your services
        </h1>
        <p className="text-lg text-primary-700">
          Tell us about the programmes and activities your organisation delivers.
        </p>
      </div>

      {/* Added services */}
      {added.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-primary-800 uppercase tracking-wide">
            Services added
          </h2>
          <ul className="space-y-2" role="list">
            {added.map((svc, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-white border border-surface-200 rounded-lg p-3"
              >
                <div className="break-words min-w-0">
                  <span className="font-medium text-primary-900 break-words">{svc.name}</span>
                  <span className="text-sm text-primary-500 ml-2">
                    {STATUS_OPTIONS.find((s) => s.value === svc.status)?.label.split(' - ')[0]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  aria-label={`Remove ${svc.name}`}
                  className="text-primary-400 hover:text-red-600 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add service form */}
      <div className="bg-white border border-surface-200 rounded-lg p-4 sm:p-6 space-y-4">
        <h2 className="font-medium text-primary-900">Add a service</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="service-name"
            label="Service name"
            required
            value={draft.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. Youth mentoring programme"
          />

          <Select
            id="service-status"
            label="Status"
            value={draft.status}
            onChange={(e) => updateField('status', e.target.value as ServiceDraft['status'])}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          <div className="sm:col-span-2">
            <Input
              id="service-description"
              label="Description"
              helperText="Optional"
              value={draft.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="A brief description of what this service does"
            />
          </div>
        </div>

        {/* Link to functions */}
        {functions.length > 0 && (
          <CheckboxGroup
            legend="Which functions does this service relate to?"
            items={functions.map((fn) => ({ value: fn.id, label: fn.name }))}
            value={draft.functionIds}
            onChange={(ids) => setDraft((prev) => ({ ...prev, functionIds: ids }))}
          />
        )}

        {/* Link to systems */}
        {systems.length > 0 && (
          <CheckboxGroup
            legend="Which systems support this service?"
            items={systems.map((sys) => ({ value: sys.id, label: sys.name }))}
            value={draft.systemIds}
            onChange={(ids) => setDraft((prev) => ({ ...prev, systemIds: ids }))}
          />
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={!draft.name.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add service
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-200">
        <Link
          href="/wizard/functions/systems"
          className="btn-secondary inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="btn-secondary"
          >
            Skip this step
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="btn-primary inline-flex items-center gap-2"
          >
            Continue
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
