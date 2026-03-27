'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Architecture, System } from '@/lib/types';
import type { RiskDimensionKey } from '@/lib/techfreedom/types';
import {
  totalScore,
  riskLevel,
  worstDimension,
  aggregateRisk,
  RISK_DIMENSIONS,
} from '@/lib/techfreedom/risk';
import { RiskBadge } from '@/components/techfreedom/risk-badge';
import { RadarChart } from '@/components/techfreedom/radar-chart';
import { formatCurrency } from '@/lib/cost-analysis';

export interface TechFreedomViewProps {
  architecture: Architecture | null;
  isLoading?: boolean;
}

type SortColumn = 'name' | RiskDimensionKey | 'total' | 'riskLevel';
type SortDirection = 'asc' | 'desc';

const DIMENSION_KEYS: RiskDimensionKey[] = [
  'jurisdiction',
  'continuity',
  'surveillance',
  'lockIn',
  'costExposure',
];

const LEVEL_ORDER = { low: 0, moderate: 1, high: 2, critical: 3 } as const;

function cellColour(value: number): string {
  if (value <= 2) return 'bg-green-100 text-green-900';
  if (value === 3) return 'bg-amber-100 text-amber-900';
  if (value === 4) return 'bg-orange-100 text-orange-900';
  return 'bg-red-100 text-red-900';
}

function levelBadgeClasses(level: string): string {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'moderate':
      return 'bg-amber-100 text-amber-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-surface-100 text-primary-700';
  }
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-lg border border-surface-200 p-6 animate-pulse">
        <div className="h-8 bg-surface-100 rounded w-64 mb-6" />
        <div className="h-48 bg-surface-100 rounded mb-6" />
        <div className="h-64 bg-surface-100 rounded" />
      </div>
    </div>
  );
}

function EmptyState({ reviewPath }: { reviewPath: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
      <h2 className="text-2xl font-bold text-primary-900 font-display mb-4">
        No systems have been risk-assessed yet
      </h2>
      <p className="text-primary-600 mb-8">
        Enable TechFreedom in the wizard and add systems to see their risk
        assessment here.
      </p>
      <Link
        href={reviewPath}
        className="btn-primary px-6 py-2.5 rounded-lg inline-flex items-center gap-2"
      >
        Edit your map
      </Link>
    </div>
  );
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) {
    return (
      <span className="ml-1 text-primary-300" aria-hidden="true">
        &#8597;
      </span>
    );
  }
  return (
    <span className="ml-1 text-primary-600" aria-hidden="true">
      {direction === 'asc' ? '\u2191' : '\u2193'}
    </span>
  );
}

export function TechFreedomView({ architecture, isLoading }: TechFreedomViewProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const reviewPath = architecture?.metadata.mappingPath === 'service_first'
    ? '/wizard/services/review'
    : '/wizard/functions/review';

  const scoredSystems = useMemo(() => {
    if (!architecture) return [];
    return architecture.systems.filter((s) => s.techFreedomScore !== undefined);
  }, [architecture]);

  const aggregate = useMemo(() => {
    if (!architecture) return null;
    return aggregateRisk(architecture.systems);
  }, [architecture]);

  const sortedSystems = useMemo(() => {
    const systems = [...scoredSystems];
    systems.sort((a, b) => {
      const scoreA = a.techFreedomScore!;
      const scoreB = b.techFreedomScore!;
      let comparison = 0;

      switch (sortColumn) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'total':
          comparison = totalScore(scoreA) - totalScore(scoreB);
          break;
        case 'riskLevel': {
          const levelA = riskLevel(totalScore(scoreA));
          const levelB = riskLevel(totalScore(scoreB));
          comparison = LEVEL_ORDER[levelA] - LEVEL_ORDER[levelB];
          break;
        }
        default:
          // Dimension key
          comparison = scoreA[sortColumn as RiskDimensionKey] - scoreB[sortColumn as RiskDimensionKey];
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return systems;
  }, [scoredSystems, sortColumn, sortDirection]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!aggregate || scoredSystems.length === 0) {
    return <EmptyState reviewPath={reviewPath} />;
  }

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection(column === 'name' ? 'asc' : 'desc');
    }
  }

  function toggleRow(systemId: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(systemId)) {
        next.delete(systemId);
      } else {
        next.add(systemId);
      }
      return next;
    });
  }

  const overallLevel = riskLevel(Math.round(aggregate.averageTotal));
  const worstDim = RISK_DIMENSIONS.find((d) => d.key === aggregate.worstDimension);

  const countParts: string[] = [];
  if (aggregate.countByLevel.critical > 0)
    countParts.push(`${aggregate.countByLevel.critical} Critical`);
  if (aggregate.countByLevel.high > 0)
    countParts.push(`${aggregate.countByLevel.high} High`);
  if (aggregate.countByLevel.moderate > 0)
    countParts.push(`${aggregate.countByLevel.moderate} Moderate`);
  if (aggregate.countByLevel.low > 0)
    countParts.push(`${aggregate.countByLevel.low} Low`);

  const columnDefs: { key: SortColumn; label: string }[] = [
    { key: 'name', label: 'System' },
    ...RISK_DIMENSIONS.map((d) => ({ key: d.key as SortColumn, label: d.label })),
    { key: 'total', label: 'Total' },
    { key: 'riskLevel', label: 'Risk Level' },
  ];

  // Check if any scored system has cost data
  const hasCostData = scoredSystems.some((s) => s.cost !== undefined);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-display">
            Technology Risk Assessment
          </h1>
          <p className="text-sm text-primary-600 mt-1">
            {architecture?.organisation.name || 'Your organisation'}
          </p>
        </div>
        <Link
          href={reviewPath}
          className="btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-1.5"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              d="M2 7h10M6 3l-4 4 4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Edit your map
        </Link>
      </div>

      {/* Summary panel */}
      <div className="bg-white rounded-lg border border-surface-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-primary-900 font-display mb-4">
          Overall Risk Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-primary-500 mb-1">Overall risk</p>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${levelBadgeClasses(overallLevel)}`}
            >
              {overallLevel.charAt(0).toUpperCase() + overallLevel.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-sm text-primary-500 mb-1">Worst dimension</p>
            <p className="text-primary-900 font-medium">
              {worstDim?.label ?? aggregate.worstDimension}
            </p>
          </div>
          <div>
            <p className="text-sm text-primary-500 mb-1">Most critical system</p>
            <p className="text-primary-900 font-medium">
              {aggregate.mostCriticalSystem}
            </p>
          </div>
          <div>
            <p className="text-sm text-primary-500 mb-1">
              {aggregate.systemCount} systems assessed
            </p>
            <p className="text-primary-900 font-medium text-sm">
              {countParts.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Radar chart + table layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Radar chart */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-surface-200 p-6 flex items-center justify-center">
          <RadarChart scores={aggregate.averages} size={280} />
        </div>

        {/* Heatmap table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-surface-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  {columnDefs.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider cursor-pointer select-none hover:bg-surface-100 transition-colors"
                      onClick={() => handleSort(col.key)}
                      aria-sort={
                        sortColumn === col.key
                          ? sortDirection === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <span className="inline-flex items-center">
                        {col.label}
                        <SortIcon
                          active={sortColumn === col.key}
                          direction={sortDirection}
                        />
                      </span>
                    </th>
                  ))}
                  {hasCostData && (
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider"
                    >
                      Cost
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedSystems.map((system) => {
                  const score = system.techFreedomScore!;
                  const total = totalScore(score);
                  const level = riskLevel(total);
                  const isExpanded = expandedRows.has(system.id);

                  return (
                    <HeatmapRow
                      key={system.id}
                      system={system}
                      score={score}
                      total={total}
                      level={level}
                      isExpanded={isExpanded}
                      onToggle={() => toggleRow(system.id)}
                      showCost={hasCostData}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

interface HeatmapRowProps {
  system: System;
  score: NonNullable<System['techFreedomScore']>;
  total: number;
  level: string;
  isExpanded: boolean;
  onToggle: () => void;
  showCost?: boolean;
}

function HeatmapRow({ system, score, total, level, isExpanded, onToggle, showCost }: HeatmapRowProps) {
  return (
    <>
      <tr
        className="border-b border-surface-100 hover:bg-surface-50 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-3 py-2.5 font-medium text-primary-900">
          {system.name}
        </td>
        {DIMENSION_KEYS.map((key) => (
          <td
            key={key}
            className={`px-3 py-2.5 text-center font-medium ${cellColour(score[key])}`}
          >
            {score[key]}
          </td>
        ))}
        <td
          className={`px-3 py-2.5 text-center font-bold ${cellColour(Math.ceil(total / 5))}`}
        >
          {total}
        </td>
        <td className="px-3 py-2.5">
          <RiskBadge score={score} />
        </td>
        {showCost && (
          <td className="px-3 py-2.5 text-sm text-primary-700">
            {system.cost ? (
              system.cost.model === 'free' ? (
                <span className="text-green-700">Free</span>
              ) : (
                formatCurrency(
                  system.cost.period === 'monthly'
                    ? system.cost.amount * 12
                    : system.cost.amount,
                ) + '/year'
              )
            ) : (
              <span className="text-primary-400">&mdash;</span>
            )}
          </td>
        )}
      </tr>
      {isExpanded && score.overrides && score.overrides.length > 0 && (
        <tr className="bg-surface-50">
          <td colSpan={showCost ? 9 : 8} className="px-6 py-3 text-sm text-primary-700">
            <p className="font-medium mb-1">Key risks:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {score.overrides.map((risk, i) => (
                <li key={i}>{risk}</li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}
