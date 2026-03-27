import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { RiskDetails } from '@/components/techfreedom/risk-details';
import type { TechFreedomScore } from '@/lib/techfreedom/types';

const autoScore: TechFreedomScore = {
  jurisdiction: 3,
  continuity: 2,
  surveillance: 4,
  lockIn: 3,
  costExposure: 2,
  isAutoScored: true,
};

const manualScore: TechFreedomScore = {
  jurisdiction: 3,
  continuity: 2,
  surveillance: 4,
  lockIn: 3,
  costExposure: 2,
  isAutoScored: false,
};

describe('RiskDetails', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<RiskDetails score={autoScore} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders a disclosure with summary text', () => {
    render(<RiskDetails score={autoScore} />);
    expect(screen.getByText('View risk details')).toBeInTheDocument();
  });

  it('renders all 5 risk dimensions', async () => {
    const user = userEvent.setup();
    render(<RiskDetails score={autoScore} />);
    await user.click(screen.getByText('View risk details'));

    expect(screen.getByText('Jurisdiction')).toBeInTheDocument();
    expect(screen.getByText('Continuity')).toBeInTheDocument();
    expect(screen.getByText('Surveillance')).toBeInTheDocument();
    expect(screen.getByText('Lock-in')).toBeInTheDocument();
    expect(screen.getByText('Cost Exposure')).toBeInTheDocument();
  });

  it('shows "Auto-scored" label when isAutoScored is true', async () => {
    const user = userEvent.setup();
    render(<RiskDetails score={autoScore} />);
    await user.click(screen.getByText('View risk details'));

    expect(screen.getByText('Auto-scored')).toBeInTheDocument();
  });

  it('shows "Manually assessed" label when isAutoScored is false', async () => {
    const user = userEvent.setup();
    render(<RiskDetails score={manualScore} />);
    await user.click(screen.getByText('View risk details'));

    expect(screen.getByText('Manually assessed')).toBeInTheDocument();
  });

  it('renders score selects as disabled when readOnly', async () => {
    const user = userEvent.setup();
    render(<RiskDetails score={autoScore} readOnly />);
    await user.click(screen.getByText('View risk details'));

    const selects = screen.getAllByRole('combobox');
    for (const select of selects) {
      expect(select).toBeDisabled();
    }
  });

  it('renders score selects as disabled when no onChange provided', async () => {
    const user = userEvent.setup();
    render(<RiskDetails score={autoScore} />);
    await user.click(screen.getByText('View risk details'));

    const selects = screen.getAllByRole('combobox');
    for (const select of selects) {
      expect(select).toBeDisabled();
    }
  });

  it('calls onChange when a score is changed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RiskDetails score={autoScore} onChange={onChange} />);
    await user.click(screen.getByText('View risk details'));

    const selects = screen.getAllByRole('combobox');
    // Change the first dimension (Jurisdiction) from 3 to 5
    await user.selectOptions(selects[0], '5');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        jurisdiction: 5,
        isAutoScored: true,
      }),
    );
  });

  it('has no a11y violations when expanded with onChange', async () => {
    const user = userEvent.setup();
    const { container } = render(<RiskDetails score={autoScore} onChange={vi.fn()} />);
    await user.click(screen.getByText('View risk details'));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
