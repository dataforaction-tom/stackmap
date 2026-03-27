import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { RiskBadge } from '@/components/techfreedom/risk-badge';
import type { TechFreedomScore } from '@/lib/techfreedom/types';

const lowScore: TechFreedomScore = {
  jurisdiction: 1,
  continuity: 2,
  surveillance: 1,
  lockIn: 1,
  costExposure: 2,
  isAutoScored: false,
};

const moderateScore: TechFreedomScore = {
  jurisdiction: 3,
  continuity: 3,
  surveillance: 2,
  lockIn: 3,
  costExposure: 3,
  isAutoScored: true,
};

const highScore: TechFreedomScore = {
  jurisdiction: 4,
  continuity: 3,
  surveillance: 4,
  lockIn: 3,
  costExposure: 3,
  isAutoScored: true,
};

const criticalScore: TechFreedomScore = {
  jurisdiction: 5,
  continuity: 4,
  surveillance: 5,
  lockIn: 4,
  costExposure: 4,
  isAutoScored: true,
};

describe('RiskBadge', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<RiskBadge score={moderateScore} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders total score and risk level', () => {
    render(<RiskBadge score={moderateScore} />);
    expect(screen.getByText(/14\/25/)).toBeInTheDocument();
    expect(screen.getByText(/Moderate/i)).toBeInTheDocument();
  });

  it('uses green colour for low risk', () => {
    const { container } = render(<RiskBadge score={lowScore} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toMatch(/green/);
  });

  it('uses amber colour for moderate risk', () => {
    const { container } = render(<RiskBadge score={moderateScore} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toMatch(/amber/);
  });

  it('uses orange colour for high risk', () => {
    const { container } = render(<RiskBadge score={highScore} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toMatch(/orange/);
  });

  it('uses red colour for critical risk', () => {
    const { container } = render(<RiskBadge score={criticalScore} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toMatch(/red/);
  });

  it('has an aria-label for screen readers', () => {
    render(<RiskBadge score={moderateScore} />);
    const badge = screen.getByLabelText(/risk score 14 out of 25/i);
    expect(badge).toBeInTheDocument();
  });
});
