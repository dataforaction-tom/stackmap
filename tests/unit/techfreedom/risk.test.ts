import { describe, it, expect } from 'vitest';
import {
  totalScore,
  riskLevel,
  worstDimension,
  aggregateRisk,
  RISK_DIMENSIONS,
} from '@/lib/techfreedom/risk';
import type { TechFreedomScore } from '@/lib/techfreedom/types';

const highRisk: TechFreedomScore = {
  jurisdiction: 5, continuity: 3, surveillance: 5, lockIn: 4, costExposure: 3,
  isAutoScored: true,
};

const lowRisk: TechFreedomScore = {
  jurisdiction: 1, continuity: 2, surveillance: 1, lockIn: 1, costExposure: 2,
  isAutoScored: false,
};

describe('RISK_DIMENSIONS', () => {
  it('has exactly 5 dimensions', () => {
    expect(RISK_DIMENSIONS).toHaveLength(5);
  });

  it('each dimension has key, label, and description', () => {
    for (const dim of RISK_DIMENSIONS) {
      expect(dim).toHaveProperty('key');
      expect(dim).toHaveProperty('label');
      expect(dim).toHaveProperty('description');
    }
  });
});

describe('totalScore', () => {
  it('sums all 5 dimensions', () => {
    expect(totalScore(highRisk)).toBe(20);
  });

  it('returns correct sum for low risk', () => {
    expect(totalScore(lowRisk)).toBe(7);
  });
});

describe('riskLevel', () => {
  it('returns low for 1-10', () => {
    expect(riskLevel(7)).toBe('low');
    expect(riskLevel(10)).toBe('low');
  });

  it('returns moderate for 11-14', () => {
    expect(riskLevel(11)).toBe('moderate');
    expect(riskLevel(14)).toBe('moderate');
  });

  it('returns high for 15-17', () => {
    expect(riskLevel(15)).toBe('high');
    expect(riskLevel(17)).toBe('high');
  });

  it('returns critical for 18+', () => {
    expect(riskLevel(18)).toBe('critical');
    expect(riskLevel(25)).toBe('critical');
  });
});

describe('worstDimension', () => {
  it('returns the highest-scoring dimension key', () => {
    expect(worstDimension(highRisk)).toBe('jurisdiction');
  });

  it('returns first highest when tied', () => {
    const tied: TechFreedomScore = {
      jurisdiction: 3, continuity: 3, surveillance: 3, lockIn: 3, costExposure: 3,
      isAutoScored: true,
    };
    expect(worstDimension(tied)).toBe('jurisdiction');
  });
});

describe('aggregateRisk', () => {
  it('returns null when no systems have scores', () => {
    const systems = [{ id: '1', name: 'Test', type: 'other' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [] }];
    expect(aggregateRisk(systems)).toBeNull();
  });

  it('calculates averages across scored systems', () => {
    const systems = [
      { id: '1', name: 'A', type: 'other' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [], techFreedomScore: highRisk },
      { id: '2', name: 'B', type: 'other' as const, hosting: 'cloud' as const, status: 'active' as const, functionIds: [], serviceIds: [], techFreedomScore: lowRisk },
    ];
    const result = aggregateRisk(systems);
    expect(result).not.toBeNull();
    expect(result!.averageTotal).toBe(13.5);
    expect(result!.systemCount).toBe(2);
    expect(result!.mostCriticalSystem).toBe('A');
  });
});
