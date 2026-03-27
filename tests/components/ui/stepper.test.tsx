import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { Stepper, type StepperStep } from '@/components/ui/stepper';

const steps: StepperStep[] = [
  { label: 'Functions' },
  { label: 'Systems', description: 'Map your systems' },
  { label: 'Review' },
];

describe('Stepper', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Stepper steps={steps} currentStep={1} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders all steps', () => {
    render(<Stepper steps={steps} currentStep={0} />);
    expect(screen.getByText('Functions')).toBeInTheDocument();
    expect(screen.getByText('Systems')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('uses role="list"', () => {
    render(<Stepper steps={steps} currentStep={0} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('marks current step with aria-current', () => {
    render(<Stepper steps={steps} currentStep={1} />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).not.toHaveAttribute('aria-current');
    expect(listItems[1]).toHaveAttribute('aria-current', 'step');
    expect(listItems[2]).not.toHaveAttribute('aria-current');
  });

  it('shows step descriptions', () => {
    render(<Stepper steps={steps} currentStep={0} />);
    expect(screen.getByText('Map your systems')).toBeInTheDocument();
  });

  it('makes completed steps clickable when onStepClick provided', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} currentStep={2} onStepClick={onStepClick} />);

    // Completed steps (0, 1) should be buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    await user.click(buttons[0]);
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('does not make future steps clickable', () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} currentStep={0} onStepClick={onStepClick} />);
    // Only current (non-clickable) and upcoming (non-clickable)
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('handles keyboard navigation on completed steps', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} currentStep={2} onStepClick={onStepClick} />);

    const buttons = screen.getAllByRole('button');
    buttons[1].focus();
    await user.keyboard('{Enter}');
    expect(onStepClick).toHaveBeenCalledWith(1);
  });
});
