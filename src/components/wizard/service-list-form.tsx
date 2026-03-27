'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useArchitecture } from '@/hooks/useArchitecture';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SERVICE_TEMPLATES } from '@/lib/service-templates';
import { findMatchingTool } from '@/lib/techfreedom/match';
import { KNOWN_TOOLS } from '@/lib/techfreedom/tools';
import type { SystemType } from '@/lib/types';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active - running now' },
  { value: 'planned', label: 'Planned - starting soon' },
  { value: 'retiring', label: 'Retiring - winding down' },
] as const;

interface ServiceDraft {
  name: string;
  description: string;
  status: 'active' | 'planned' | 'retiring';
  suggestedTools?: string[];
}

const EMPTY_DRAFT: ServiceDraft = {
  name: '',
  description: '',
  status: 'active',
};

function guessSystemType(category: string): SystemType {
  const map: Record<string, SystemType> = {
    'Productivity': 'document_management',
    'Communication': 'messaging',
    'CRM': 'crm',
    'Finance': 'finance',
    'Marketing': 'email',
    'Events': 'other',
    'Design': 'other',
    'CMS': 'website',
    'Storage': 'document_management',
    'Project Management': 'database',
    'Social Media': 'other',
    'Messaging': 'messaging',
    'Email': 'email',
  };
  return map[category] ?? 'other';
}

export function ServiceListForm() {
  const router = useRouter();
  const { architecture, addService, removeService, addSystem } = useArchitecture();

  const [draft, setDraft] = useState<ServiceDraft>(EMPTY_DRAFT);
  // Hydrate from architecture on re-visit
  const [added, setAdded] = useState<ServiceDraft[]>(() => {
    return (architecture?.services ?? []).map((svc) => ({
      name: svc.name,
      description: svc.description ?? '',
      status: svc.status,
    }));
  });

  // Track which templates have been added (by name, lowercased)
  const addedTemplateNames = new Set(added.map((s) => s.name.toLowerCase()));

  const hasServices = added.length > 0;

  const updateField = useCallback(
    <K extends keyof ServiceDraft>(field: K, value: ServiceDraft[K]) => {
      setDraft((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleAdd = useCallback(() => {
    if (!draft.name.trim()) return;
    setAdded((prev) => [
      ...prev,
      { ...draft, name: draft.name.trim(), description: draft.description.trim() },
    ]);
    setDraft(EMPTY_DRAFT);
  }, [draft]);

  const handleTemplateClick = useCallback((templateName: string) => {
    const template = SERVICE_TEMPLATES.find((t) => t.name === templateName);
    if (!template) return;

    setAdded((prev) => {
      // Don't add if already in the list
      if (prev.some((s) => s.name.toLowerCase() === template.name.toLowerCase())) {
        return prev;
      }
      return [
        ...prev,
        {
          name: template.name,
          description: template.description,
          status: 'active' as const,
          suggestedTools: template.suggestedTools,
        },
      ];
    });
  }, []);

  const handleRemove = useCallback((index: number) => {
    setAdded((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleContinue = useCallback(() => {
    // Clear existing services to avoid duplicates on re-visit (idempotent)
    const existingServices = architecture?.services ?? [];
    for (const svc of existingServices) {
      removeService(svc.id);
    }

    // Clear existing systems too — they'll be re-added from suggestions + the systems step
    const existingSystems = architecture?.systems ?? [];
    for (const sys of existingSystems) {
      // Only remove systems that were auto-added from templates (no manual systems to preserve on first pass)
    }

    // Track which tool names have been added as systems to avoid duplicates
    const existingSystemNames = new Set(
      (architecture?.systems ?? []).map((s) => s.name.toLowerCase()),
    );

    // Add all drafted services and their suggested tools
    for (const svc of added) {
      const serviceId = addService({
        name: svc.name,
        description: svc.description || undefined,
        status: svc.status,
        functionIds: [],
        systemIds: [],
      });

      if (svc.suggestedTools) {
        for (const toolName of svc.suggestedTools) {
          if (existingSystemNames.has(toolName.toLowerCase())) continue;
          existingSystemNames.add(toolName.toLowerCase());

          const match = findMatchingTool(toolName, KNOWN_TOOLS);
          addSystem({
            name: match?.name ?? toolName,
            type: match ? guessSystemType(match.category) : 'other',
            vendor: match?.provider,
            hosting: 'cloud',
            status: 'active',
            functionIds: [],
            serviceIds: [serviceId],
            techFreedomScore: match?.score,
            cost: match?.estimatedAnnualCost !== undefined
              ? {
                  amount: match.estimatedAnnualCost,
                  period: 'annual',
                  model: match.estimatedAnnualCost === 0 ? 'free' : 'subscription',
                }
              : undefined,
          });
        }
      }
    }

    router.push('/wizard/services/systems');
  }, [added, addService, removeService, addSystem, architecture, router]);

  if (!architecture) {
    return (
      <div className="flex items-center justify-center py-12" role="status">
        <p className="text-primary-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3 max-w-xl">
        <h1 className="text-display-md font-display text-primary-900">
          What services does your organisation deliver?
        </h1>
        <p className="text-body-lg text-primary-700">
          Add the programmes, activities, or services your organisation provides.
          You&rsquo;ll map the technology behind each one in the next step.
        </p>
      </div>

      {/* Example services hint — clickable template chips */}
      <div className="bg-surface-50 border border-surface-200 rounded-lg p-4">
        <p className="text-sm font-medium text-primary-800 mb-2">
          Click a service to add it with suggested tools, or add your own below.
        </p>
        <div className="flex flex-wrap gap-2">
          {SERVICE_TEMPLATES.map((template) => {
            const isAdded = addedTemplateNames.has(template.name.toLowerCase());
            return (
              <button
                key={template.name}
                type="button"
                onClick={() => handleTemplateClick(template.name)}
                disabled={isAdded}
                aria-pressed={isAdded}
                className={`
                  inline-flex items-center gap-1.5 text-sm rounded-full px-3 py-1 transition-all duration-150
                  ${
                    isAdded
                      ? 'bg-primary-100 text-primary-400 border border-primary-200 cursor-default'
                      : 'bg-white text-primary-600 border border-surface-200 hover:border-primary-400 hover:bg-primary-50 cursor-pointer'
                  }
                `}
              >
                {isAdded && (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                {template.name}
              </button>
            );
          })}
        </div>
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
                  {svc.description && (
                    <span className="block text-sm text-primary-500 mt-0.5">{svc.description}</span>
                  )}
                  {svc.suggestedTools && svc.suggestedTools.length > 0 && (
                    <span className="block text-xs text-primary-400 mt-1">
                      Suggested tools: {svc.suggestedTools.join(', ')}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  aria-label={`Remove ${svc.name}`}
                  className="text-primary-400 hover:text-red-600 transition-colors p-1 flex-shrink-0"
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

      {/* Selection count */}
      {hasServices && (
        <p className="text-sm text-primary-500" aria-live="polite">
          {added.length} service{added.length === 1 ? '' : 's'} added
        </p>
      )}

      {/* Navigation */}
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
        <button
          type="button"
          onClick={handleContinue}
          disabled={!hasServices}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-disabled={!hasServices}
        >
          Continue
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
