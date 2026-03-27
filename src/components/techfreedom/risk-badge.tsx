import { totalScore, riskLevel } from '@/lib/techfreedom/risk';
import type { TechFreedomScore, RiskLevel } from '@/lib/techfreedom/types';

export interface RiskBadgeProps {
  score: TechFreedomScore;
}

const levelColours: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-800 border-green-300',
  moderate: 'bg-amber-100 text-amber-800 border-amber-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  critical: 'bg-red-100 text-red-800 border-red-300',
};

const levelLabels: Record<RiskLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  critical: 'Critical',
};

export function RiskBadge({ score }: RiskBadgeProps) {
  const total = totalScore(score);
  const level = riskLevel(total);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium font-body ${levelColours[level]}`}
      aria-label={`Risk score ${total} out of 25, ${levelLabels[level]}`}
    >
      {total}/25 {levelLabels[level]}
    </span>
  );
}
