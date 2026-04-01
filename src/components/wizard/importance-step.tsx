'use client';

import { useState } from 'react';
import { useArchitecture } from '@/hooks/useArchitecture';
import { getImportanceTier, IMPORTANCE_TIERS } from '@/lib/importance';
import type { SystemType, System } from '@/lib/types';

const SYSTEM_TYPES: { value: SystemType; label: string }[] = [
  { value: 'crm', label: 'CRM' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'HR' },
  { value: 'case_management', label: 'Case management' },
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email / marketing' },
  { value: 'document_management', label: 'Documents' },
  { value: 'database', label: 'Database' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'messaging', label: 'Messaging' },
  { value: 'other', label: 'Other' },
];

const TIER_COLORS: Record<string, string> = {
  core: 'text-green-700 bg-green-100',
  important: 'text-amber-700 bg-amber-100',
  peripheral: 'text-stone-600 bg-stone-100',
};

interface ShadowFormState {
  name: string;
  type: SystemType;
  notes: string;
}

const emptyShadowForm: ShadowFormState = { name: '', type: 'other', notes: '' };

export function ImportanceStep() {
  const { architecture, updateSystem, addSystem } = useArchitecture();
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  const [shadowForms, setShadowForms] = useState<Record<string, ShadowFormState>>({});
  const [tierDefsOpen, setTierDefsOpen] = useState(true);

  if (!architecture) return null;

  const { functions, systems } = architecture;

  // Group non-shadow systems by function
  const systemsByFunction = new Map<string, System[]>();
  for (const fn of functions) {
    systemsByFunction.set(
      fn.id,
      systems.filter(s => s.functionIds.includes(fn.id) && !s.isShadow),
    );
  }

  // Unlinked non-shadow systems
  const linkedIds = new Set(
    functions.flatMap(fn => systemsByFunction.get(fn.id)?.map(s => s.id) ?? []),
  );
  const unlinked = systems.filter(s => !linkedIds.has(s.id) && !s.isShadow);

  // Shadow systems grouped by function
  const shadowByFunction = new Map<string, System[]>();
  for (const fn of functions) {
    shadowByFunction.set(fn.id, systems.filter(s => s.functionIds.includes(fn.id) && s.isShadow));
  }

  function handleSliderChange(systemId: string, value: number) {
    updateSystem(systemId, { importance: value });
  }

  function toggleShadowForm(key: string) {
    setExpandedForms(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    if (!shadowForms[key]) {
      setShadowForms(prev => ({ ...prev, [key]: { ...emptyShadowForm } }));
    }
  }

  function handleShadowSubmit(functionId: string, formKey: string) {
    const form = shadowForms[formKey];
    if (!form?.name.trim()) return;
    addSystem({
      name: form.name.trim(),
      type: form.type,
      hosting: 'unknown',
      status: 'active',
      functionIds: functionId ? [functionId] : [],
      serviceIds: [],
      notes: form.notes || undefined,
      isShadow: true,
    });
    setShadowForms(prev => ({ ...prev, [formKey]: { ...emptyShadowForm } }));
    setExpandedForms(prev => {
      const next = new Set(prev);
      next.delete(formKey);
      return next;
    });
  }

  function renderShadowForm(functionId: string, formKey: string) {
    if (!expandedForms.has(formKey)) return null;
    const form = shadowForms[formKey] ?? emptyShadowForm;
    return (
      <div className="mt-2 p-3 border border-dashed border-surface-300 rounded-lg space-y-2 bg-surface-50">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tool name"
            value={form.name}
            onChange={e => setShadowForms(prev => ({
              ...prev, [formKey]: { ...prev[formKey], name: e.target.value },
            }))}
            className="flex-1 px-3 py-1.5 text-sm border border-surface-300 rounded-lg"
            aria-label="Shadow tool name"
          />
          <select
            value={form.type}
            onChange={e => setShadowForms(prev => ({
              ...prev, [formKey]: { ...prev[formKey], type: e.target.value as SystemType },
            }))}
            className="px-3 py-1.5 text-sm border border-surface-300 rounded-lg"
            aria-label="Shadow tool type"
          >
            {SYSTEM_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={e => setShadowForms(prev => ({
            ...prev, [formKey]: { ...prev[formKey], notes: e.target.value },
          }))}
          className="w-full px-3 py-1.5 text-sm border border-surface-300 rounded-lg"
          aria-label="Shadow tool notes"
        />
        <button
          type="button"
          onClick={() => handleShadowSubmit(functionId, formKey)}
          disabled={!form.name.trim()}
          className="btn-primary text-sm"
        >
          Add
        </button>
      </div>
    );
  }

  function renderSystemCard(system: System) {
    const tier = getImportanceTier(system.importance);
    return (
      <div
        key={system.id}
        className={`p-3 rounded-lg border ${system.isShadow ? 'border-dashed border-surface-400' : 'border-surface-200'} bg-white space-y-2`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-primary-900">{system.name}</span>
          <div className="flex items-center gap-2">
            {system.isShadow && (
              <span className="text-xs bg-surface-200 text-surface-600 rounded px-1.5 py-0.5">Shadow</span>
            )}
            {tier && (
              <span className={`text-xs rounded px-1.5 py-0.5 font-medium ${TIER_COLORS[tier.tier]}`}>
                {tier.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={10}
            value={system.importance ?? 5}
            onChange={e => handleSliderChange(system.id, parseInt(e.target.value, 10))}
            className="flex-1 accent-primary-600"
            aria-label={`Importance of ${system.name}`}
          />
          <span className="text-sm font-mono w-6 text-right text-primary-700">
            {system.importance ?? 5}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 py-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900">
          How important is each tool?
        </h1>
        <p className="text-primary-600 mt-1">
          Rate how critical each system is to your organisation. This helps prioritise investment and understand risk.
        </p>
      </div>

      {/* Tier definitions */}
      <button
        type="button"
        onClick={() => setTierDefsOpen(!tierDefsOpen)}
        className="text-sm text-primary-600 underline underline-offset-2"
        aria-expanded={tierDefsOpen}
      >
        {tierDefsOpen ? 'Hide' : 'Show'} importance levels
      </button>
      {tierDefsOpen && (
        <div className="grid gap-2 sm:grid-cols-3" role="list" aria-label="Importance tier definitions">
          {IMPORTANCE_TIERS.map(t => (
            <div key={t.key} className="p-3 rounded-lg border border-surface-200 bg-surface-50" role="listitem">
              <p className="font-semibold text-sm" style={{ color: t.color }}>{t.label} ({t.min}-{t.max})</p>
              <p className="text-xs text-primary-600 mt-0.5">
                {t.key === 'core' && 'Operations would stop without this tool'}
                {t.key === 'important' && 'Valuable but you could work around its loss temporarily'}
                {t.key === 'peripheral' && 'Nice to have, easy to replace or drop'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Systems grouped by function */}
      {functions.filter(fn => fn.isActive).map(fn => {
        const fnSystems = systemsByFunction.get(fn.id) ?? [];
        const fnShadow = shadowByFunction.get(fn.id) ?? [];
        const formKey = `shadow-${fn.id}`;
        return (
          <section key={fn.id} className="space-y-3">
            <h2 className="font-display font-semibold text-primary-800 text-lg">{fn.name}</h2>
            {fnSystems.length === 0 && fnShadow.length === 0 && (
              <p className="text-sm text-primary-400 italic">No systems mapped to this function</p>
            )}
            {fnSystems.map(s => renderSystemCard(s))}
            {fnShadow.map(s => renderSystemCard(s))}
            <p className="text-sm text-primary-500 italic">
              Are there tools people use informally for {fn.name}?
            </p>
            <button
              type="button"
              onClick={() => toggleShadowForm(formKey)}
              className="btn-secondary text-sm"
              aria-label={`Add shadow tool for ${fn.name}`}
            >
              {expandedForms.has(formKey) ? 'Cancel' : 'Add shadow tool'}
            </button>
            {renderShadowForm(fn.id, formKey)}
          </section>
        );
      })}

      {/* Unlinked systems */}
      {unlinked.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-semibold text-primary-800 text-lg">Other systems</h2>
          {unlinked.map(s => renderSystemCard(s))}
        </section>
      )}

      {/* General shadow prompt */}
      <section className="space-y-2">
        <p className="text-sm text-primary-500 italic">
          Any other tools people use that are not part of the official setup?
        </p>
        <button
          type="button"
          onClick={() => toggleShadowForm('shadow-general')}
          className="btn-secondary text-sm"
          aria-label="Add shadow tool"
        >
          {expandedForms.has('shadow-general') ? 'Cancel' : 'Add shadow tool'}
        </button>
        {renderShadowForm('', 'shadow-general')}
      </section>
    </div>
  );
}
