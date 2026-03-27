import type { TechFreedomScore, RiskDimensionKey, RiskLevel, RiskDimension, AggregateRisk } from './types';

export const RISK_DIMENSIONS: RiskDimension[] = [
  { key: 'jurisdiction', label: 'Jurisdiction', description: 'Where does your data live, and under whose laws?' },
  { key: 'continuity', label: 'Continuity', description: 'What happens if this platform changes or disappears?' },
  { key: 'surveillance', label: 'Surveillance', description: 'How much does this tool track about you and the people you serve?' },
  { key: 'lockIn', label: 'Lock-in', description: 'How difficult would it be to switch away?' },
  { key: 'costExposure', label: 'Cost Exposure', description: 'How exposed are you to price changes?' },
];

const DIMENSION_KEYS: RiskDimensionKey[] = ['jurisdiction', 'continuity', 'surveillance', 'lockIn', 'costExposure'];

export function totalScore(score: TechFreedomScore): number {
  return DIMENSION_KEYS.reduce((sum, key) => sum + score[key], 0);
}

export function riskLevel(total: number): RiskLevel {
  if (total <= 10) return 'low';
  if (total <= 14) return 'moderate';
  if (total <= 17) return 'high';
  return 'critical';
}

export function worstDimension(score: TechFreedomScore): RiskDimensionKey {
  let worst: RiskDimensionKey = 'jurisdiction';
  let max = 0;
  for (const key of DIMENSION_KEYS) {
    if (score[key] > max) {
      max = score[key];
      worst = key;
    }
  }
  return worst;
}

/** Minimal system shape for aggregation — avoids coupling to the full System type until Task 3 */
interface SystemWithOptionalScore {
  id: string;
  name: string;
  techFreedomScore?: TechFreedomScore;
}

export function aggregateRisk(systems: SystemWithOptionalScore[]): AggregateRisk | null {
  const scored = systems.filter(
    (s): s is SystemWithOptionalScore & { techFreedomScore: TechFreedomScore } =>
      s.techFreedomScore !== undefined,
  );
  if (scored.length === 0) return null;

  const averages: Record<string, number> = {};
  for (const key of DIMENSION_KEYS) {
    averages[key] = scored.reduce((sum, s) => sum + s.techFreedomScore[key], 0) / scored.length;
  }

  const avgTotal = Object.values(averages).reduce((a, b) => a + b, 0);

  let mostCritical = scored[0];
  for (const s of scored) {
    if (totalScore(s.techFreedomScore) > totalScore(mostCritical.techFreedomScore)) {
      mostCritical = s;
    }
  }

  const countByLevel: Record<RiskLevel, number> = { low: 0, moderate: 0, high: 0, critical: 0 };
  for (const s of scored) {
    countByLevel[riskLevel(totalScore(s.techFreedomScore))]++;
  }

  return {
    averages: averages as Record<RiskDimensionKey, number>,
    averageTotal: avgTotal,
    worstDimension: worstDimension({ ...averages, isAutoScored: false } as TechFreedomScore),
    mostCriticalSystem: mostCritical.name,
    systemCount: scored.length,
    countByLevel,
  };
}
