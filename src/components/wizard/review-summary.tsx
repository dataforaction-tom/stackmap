'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useArchitecture } from '@/hooks/useArchitecture';
import { aggregateRisk, totalScore, riskLevel, RISK_DIMENSIONS } from '@/lib/techfreedom/risk';
import { calculateCostSummary, findSystemOverlaps, formatCurrency } from '@/lib/cost-analysis';

/** Colour accents per function type for visual distinction in the summary */
const FUNCTION_COLORS: Record<string, string> = {
  finance: 'border-l-emerald-500',
  governance: 'border-l-blue-500',
  people: 'border-l-violet-500',
  fundraising: 'border-l-amber-500',
  communications: 'border-l-rose-500',
  service_delivery: 'border-l-sky-500',
  operations: 'border-l-stone-500',
  data_reporting: 'border-l-teal-500',
  custom: 'border-l-accent-500',
};

const RISK_COLORS: Record<string, string> = {
  low: 'text-green-700 bg-green-100',
  moderate: 'text-amber-700 bg-amber-100',
  high: 'text-orange-700 bg-orange-100',
  critical: 'text-red-700 bg-red-100',
};

export function ReviewSummary() {
  const pathname = usePathname();
  const basePath = pathname.startsWith('/wizard/services') ? '/wizard/services' : '/wizard/functions';
  const { architecture, save, getArchitecture } = useArchitecture();

  const handleExportJson = useCallback(() => {
    const arch = getArchitecture();
    if (!arch) return;
    const costSummary = calculateCostSummary(arch.systems, arch.functions);
    const exportData = { ...arch, costSummary };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stackmap-${arch.organisation.name || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getArchitecture]);

  const handleSave = useCallback(async () => {
    await save();
  }, [save]);

  if (!architecture) {
    return (
      <div className="flex items-center justify-center py-12" role="status">
        <p className="text-primary-600">Loading...</p>
      </div>
    );
  }

  const { organisation, functions, services, systems, dataCategories, integrations, owners } =
    architecture;

  const techFreedomEnabled = architecture.metadata?.techFreedomEnabled === true;
  const riskSummary = techFreedomEnabled ? aggregateRisk(systems) : null;

  const costSummary = calculateCostSummary(systems, functions);
  const overlaps = findSystemOverlaps(systems, functions);
  const hasCostData = costSummary.systemCount > 0;

  const totalItems = functions.length + systems.length + services.length +
    dataCategories.length + integrations.length + owners.length;

  return (
    <div className="space-y-8">
      {/* Header with achievement feel */}
      <div className="space-y-3 max-w-xl">
        <h1 className="text-display-md font-display text-primary-900">
          Your technology map
        </h1>
        <p className="text-body-lg text-primary-700">
          Well done &mdash; you have mapped{' '}
          <strong className="text-primary-900 font-semibold">{totalItems} items</strong> across
          your organisation. Here is the full picture.
        </p>
      </div>

      {/* Summary stats bar */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Functions', count: functions.length },
          { label: 'Systems', count: systems.length },
          ...(services.length > 0 ? [{ label: 'Services', count: services.length }] : []),
          ...(integrations.length > 0 ? [{ label: 'Integrations', count: integrations.length }] : []),
          ...(owners.length > 0 ? [{ label: 'Owners', count: owners.length }] : []),
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-100 border border-surface-300 rounded-lg px-4 py-2"
          >
            <span className="text-2xl font-display font-bold text-primary-800">{stat.count}</span>
            <span className="text-sm text-primary-500 ml-1.5">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Organisation */}
      <section className="bg-surface-100 border border-surface-300 rounded-lg p-4 sm:p-6 space-y-2">
        <h2 className="font-display font-semibold text-primary-900 text-lg">Organisation</h2>
        <p className="text-primary-700 text-body">
          {organisation.name || 'Not set'} &mdash;{' '}
          {organisation.type === 'charity'
            ? 'Charity'
            : organisation.type === 'social_enterprise'
              ? 'Social Enterprise'
              : organisation.type === 'council'
                ? 'Council'
                : 'Other'}
        </p>
      </section>

      {/* Functions & Systems — grouped with colour coding */}
      <section className="space-y-4">
        <h2 className="font-display font-semibold text-primary-900 text-lg">
          Functions &amp; Systems
        </h2>
        {functions.length === 0 ? (
          <p className="text-primary-500">No functions added.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {functions.map((fn) => {
              const fnSystems = systems.filter((s) => s.functionIds.includes(fn.id));
              const colorClass = FUNCTION_COLORS[fn.type] || 'border-l-primary-500';
              return (
                <div
                  key={fn.id}
                  className={`bg-surface-100 border border-surface-300 border-l-4 ${colorClass} rounded-lg p-4`}
                >
                  <h3 className="font-display font-semibold text-primary-900 text-base">
                    {fn.name}
                  </h3>
                  {fn.description && (
                    <p className="text-sm text-primary-500 mt-0.5">{fn.description}</p>
                  )}
                  {fnSystems.length > 0 && (
                    <ul className="mt-2 space-y-1" role="list">
                      {fnSystems.map((sys) => {
                        const sysScore = sys.techFreedomScore;
                        const sysTotal = sysScore ? totalScore(sysScore) : null;
                        const sysLevel = sysTotal !== null ? riskLevel(sysTotal) : null;
                        return (
                        <li key={sys.id} className="text-sm text-primary-700 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" aria-hidden="true" />
                          {sys.name}
                          {sys.vendor && (
                            <span className="text-primary-400">({sys.vendor})</span>
                          )}
                          {techFreedomEnabled && sysLevel !== null && sysTotal !== null && (
                            <span
                              className={`text-xs font-medium px-1.5 py-0.5 rounded ${RISK_COLORS[sysLevel]}`}
                              data-testid="review-risk-indicator"
                            >
                              {sysTotal}/25 {sysLevel.charAt(0).toUpperCase() + sysLevel.slice(1)}
                            </span>
                          )}
                        </li>
                        );
                      })}
                    </ul>
                  )}
                  {fnSystems.length === 0 && (
                    <p className="text-xs text-primary-400 mt-2 italic">No systems mapped yet</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Systems not linked to any function */}
        {(() => {
          const unlinked = systems.filter(
            (s) => !s.functionIds.some((fId) => functions.some((f) => f.id === fId)),
          );
          if (unlinked.length === 0) return null;
          return (
            <div className="bg-surface-100 border border-surface-300 border-l-4 border-l-surface-400 rounded-lg p-4">
              <h3 className="font-display font-semibold text-primary-800 text-base">Other systems</h3>
              <ul className="mt-2 space-y-1" role="list">
                {unlinked.map((sys) => (
                  <li key={sys.id} className="text-sm text-primary-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" aria-hidden="true" />
                    {sys.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
      </section>

      {/* Technology Risk Summary — only when TechFreedom is enabled and at least one system has a score */}
      {riskSummary && (
        <section className="bg-surface-100 border border-surface-300 rounded-lg p-4 sm:p-6 space-y-3">
          <h2 className="font-display font-semibold text-primary-900 text-lg">
            Technology Risk Summary
          </h2>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white border border-surface-200 rounded-lg px-3 py-2">
              <span className="text-sm text-primary-500">Overall risk: </span>
              <span
                className={`text-sm font-semibold px-1.5 py-0.5 rounded ${RISK_COLORS[riskLevel(riskSummary.averageTotal)]}`}
              >
                {riskLevel(riskSummary.averageTotal).charAt(0).toUpperCase() + riskLevel(riskSummary.averageTotal).slice(1)}
              </span>
            </div>
            <div className="bg-white border border-surface-200 rounded-lg px-3 py-2">
              <span className="text-sm text-primary-500">Worst dimension: </span>
              <span className="text-sm font-semibold text-primary-900">
                {RISK_DIMENSIONS.find((d) => d.key === riskSummary.worstDimension)?.label ?? riskSummary.worstDimension}
              </span>
            </div>
            <div className="bg-white border border-surface-200 rounded-lg px-3 py-2">
              <span className="text-sm text-primary-500">Most critical: </span>
              <span className="text-sm font-semibold text-primary-900">
                {riskSummary.mostCriticalSystem}
              </span>
            </div>
            <div className="bg-white border border-surface-200 rounded-lg px-3 py-2">
              <span className="text-sm text-primary-500">Systems assessed: </span>
              <span className="text-sm font-semibold text-primary-900">
                {riskSummary.systemCount}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {riskSummary.countByLevel.low > 0 && (
              <span className={`px-2 py-1 rounded font-medium ${RISK_COLORS.low}`}>
                {riskSummary.countByLevel.low} Low
              </span>
            )}
            {riskSummary.countByLevel.moderate > 0 && (
              <span className={`px-2 py-1 rounded font-medium ${RISK_COLORS.moderate}`}>
                {riskSummary.countByLevel.moderate} Moderate
              </span>
            )}
            {riskSummary.countByLevel.high > 0 && (
              <span className={`px-2 py-1 rounded font-medium ${RISK_COLORS.high}`}>
                {riskSummary.countByLevel.high} High
              </span>
            )}
            {riskSummary.countByLevel.critical > 0 && (
              <span className={`px-2 py-1 rounded font-medium ${RISK_COLORS.critical}`}>
                {riskSummary.countByLevel.critical} Critical
              </span>
            )}
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section className="bg-surface-100 border border-surface-300 rounded-lg p-4 sm:p-6 space-y-2">
          <h2 className="font-display font-semibold text-primary-900 text-lg">
            Services ({services.length})
          </h2>
          <ul className="space-y-1" role="list">
            {services.map((svc) => (
              <li key={svc.id} className="text-primary-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 flex-shrink-0" aria-hidden="true" />
                {svc.name}
                <span className="text-xs bg-surface-200 text-primary-500 rounded px-1.5 py-0.5">
                  {svc.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Data categories */}
      {dataCategories.length > 0 && (
        <section className="bg-surface-100 border border-surface-300 rounded-lg p-4 sm:p-6 space-y-2">
          <h2 className="font-display font-semibold text-primary-900 text-lg">
            Data categories ({dataCategories.length})
          </h2>
          <ul className="space-y-1.5" role="list">
            {dataCategories.map((dc) => (
              <li key={dc.id} className="text-primary-700 flex items-center gap-2 flex-wrap">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" aria-hidden="true" />
                {dc.name}
                <span className="text-xs bg-surface-200 text-primary-500 rounded px-1.5 py-0.5">
                  {dc.sensitivity}
                </span>
                {dc.containsPersonalData && (
                  <span className="text-xs bg-accent-100 text-accent-800 rounded px-1.5 py-0.5 font-medium">
                    Personal data
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Integrations */}
      {integrations.length > 0 && (
        <section className="bg-surface-100 border border-surface-300 rounded-lg p-4 sm:p-6 space-y-2">
          <h2 className="font-display font-semibold text-primary-900 text-lg">
            Integrations ({integrations.length})
          </h2>
          <ul className="space-y-1.5" role="list">
            {integrations.map((intg) => {
              const source = systems.find((s) => s.id === intg.sourceSystemId)?.name ?? 'Unknown';
              const target = systems.find((s) => s.id === intg.targetSystemId)?.name ?? 'Unknown';
              return (
                <li key={intg.id} className="text-primary-700 flex items-center gap-2">
                  <span className="font-medium text-primary-800">{source}</span>
                  <span className="text-primary-400" aria-label={intg.direction === 'two_way' ? 'connects both ways to' : 'connects to'}>
                    {intg.direction === 'two_way' ? '\u2194' : '\u2192'}
                  </span>
                  <span className="font-medium text-primary-800">{target}</span>
                  <span className="text-xs bg-surface-200 text-primary-500 rounded px-1.5 py-0.5">
                    {intg.type}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Owners */}
      {owners.length > 0 && (
        <section className="bg-surface-100 border border-surface-300 rounded-lg p-4 sm:p-6 space-y-2">
          <h2 className="font-display font-semibold text-primary-900 text-lg">
            Owners ({owners.length})
          </h2>
          <ul className="space-y-1.5" role="list">
            {owners.map((owner) => {
              const ownedSystem = systems.find((s) => s.ownerId === owner.id);
              return (
                <li key={owner.id} className="text-primary-700 flex items-center gap-2 flex-wrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium text-primary-800">{owner.name}</span>
                  {owner.role && (
                    <span className="text-xs bg-surface-200 text-primary-500 rounded px-1.5 py-0.5">
                      {owner.role}
                    </span>
                  )}
                  {owner.isExternal && (
                    <span className="text-xs bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 font-medium">
                      External
                    </span>
                  )}
                  {ownedSystem && (
                    <span className="text-sm text-primary-500">
                      &rarr; {ownedSystem.name}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Cost Overview */}
      {hasCostData && (
        <section className="bg-surface-100 border border-surface-300 rounded-lg p-4 sm:p-6 space-y-4" data-testid="cost-overview">
          <h2 className="font-display font-semibold text-primary-900 text-lg">
            Cost Overview
          </h2>

          {/* Total annual cost */}
          <div className="bg-white border border-surface-200 rounded-lg px-4 py-3">
            <p className="text-sm text-primary-500">Total annual cost</p>
            <p className="text-3xl font-display font-bold text-primary-900">
              {formatCurrency(costSummary.totalAnnual)}
              <span className="text-base font-normal text-primary-500">/year</span>
            </p>
          </div>

          {/* Breakdown by function */}
          {costSummary.byFunction.some((f) => f.total > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-primary-700 mb-2">Breakdown by function</h3>
              <ul className="space-y-1.5" role="list">
                {costSummary.byFunction
                  .filter((f) => f.total > 0)
                  .sort((a, b) => b.total - a.total)
                  .map((f) => (
                    <li key={f.functionId} className="flex items-center justify-between text-sm">
                      <span className="text-primary-700">{f.functionName}</span>
                      <span className={`font-medium ${
                        f.total > 5000
                          ? 'text-red-700'
                          : f.total > 1000
                            ? 'text-amber-700'
                            : 'text-primary-900'
                      }`}>
                        {formatCurrency(f.total)}/year
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Top 3 most expensive */}
          {costSummary.mostExpensive.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-primary-700 mb-2">Most expensive systems</h3>
              <ul className="space-y-1.5" role="list">
                {costSummary.mostExpensive.map((sys) => (
                  <li key={sys.name} className="flex items-center justify-between text-sm">
                    <span className="text-primary-700">{sys.name}</span>
                    <span className={`font-semibold ${
                      sys.annualCost > 5000
                        ? 'text-red-700'
                        : sys.annualCost > 1000
                          ? 'text-amber-700'
                          : 'text-primary-900'
                    }`}>
                      {formatCurrency(sys.annualCost)}/year
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info notes */}
          <div className="flex flex-wrap gap-3 text-xs text-primary-500">
            {costSummary.uncostCount > 0 && (
              <span>{costSummary.uncostCount} {costSummary.uncostCount === 1 ? 'system has' : 'systems have'} no cost information</span>
            )}
            {costSummary.freeCount > 0 && (
              <span>{costSummary.freeCount} {costSummary.freeCount === 1 ? 'system is' : 'systems are'} free</span>
            )}
          </div>
        </section>
      )}

      {/* Potential overlaps */}
      {overlaps.length > 0 && (
        <section className="bg-amber-50 border border-amber-300 rounded-lg p-4 sm:p-6 space-y-3" data-testid="overlap-warnings">
          <h2 className="font-display font-semibold text-amber-900 text-lg">
            Potential overlaps
          </h2>
          <ul className="space-y-2" role="list">
            {overlaps.map((overlap) => (
              <li key={`${overlap.functionId}-${overlap.overlapType}`} className="text-sm text-amber-800">
                <p className="font-medium">
                  You have {overlap.overlapType} under {overlap.functionName}:{' '}
                  {overlap.systems.map((s) => s.name).join(', ')}
                </p>
                <p className="text-amber-700 text-xs mt-0.5">
                  Consider whether both are needed, or if one could replace the other.
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Actions — prominent, celebratory */}
      <div className="bg-primary-900 rounded-xl p-6 sm:p-8 space-y-4">
        <h2 className="font-display font-bold text-primary-100 text-xl">
          What next?
        </h2>
        <p className="text-primary-300 text-sm leading-relaxed max-w-lg">
          Your technology map is ready. View it as a diagram, export the data,
          or save your progress to come back later.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/view/diagram"
            className="bg-accent-500 hover:bg-accent-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm inline-flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-accent-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View diagram
          </Link>
          <button
            type="button"
            onClick={handleExportJson}
            className="bg-primary-700 hover:bg-primary-600 text-primary-100 px-5 py-2.5 rounded-lg font-semibold text-sm inline-flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export as JSON
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary-700 hover:bg-primary-600 text-primary-100 px-5 py-2.5 rounded-lg font-semibold text-sm inline-flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            Save progress
          </button>
        </div>
      </div>

      {/* Back link */}
      <div className="pt-2">
        <Link
          href={`${basePath}/owners`}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to previous step
        </Link>
      </div>
    </div>
  );
}
