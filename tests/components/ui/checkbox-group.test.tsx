import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { CheckboxGroup, type CheckboxGroupItem } from '@/components/ui/checkbox-group';

const items: CheckboxGroupItem[] = [
  { value: 'hr', label: 'HR' },
  { value: 'finance', label: 'Finance', description: 'Financial management' },
  { value: 'it', label: 'IT', disabled: true },
];

function renderGroup(overrides: Partial<React.ComponentProps<typeof CheckboxGroup>> = {}) {
  const onChange = vi.fn();
  const result = render(
    <CheckboxGroup
      legend="Functions"
      items={items}
      value={[]}
      onChange={onChange}
      {...overrides}
    />,
  );
  return { ...result, onChange };
}

describe('CheckboxGroup', () => {
  it('has no accessibility violations', async () => {
    const { container } = renderGroup();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders legend and all checkboxes', () => {
    renderGroup();
    expect(screen.getByText('Functions')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    expect(screen.getByLabelText('HR')).toBeInTheDocument();
    expect(screen.getByLabelText('Finance')).toBeInTheDocument();
  });

  it('shows item descriptions', () => {
    renderGroup();
    expect(screen.getByText('Financial management')).toBeInTheDocument();
  });

  it('handles checking an item', async () => {
    const user = userEvent.setup();
    const { onChange } = renderGroup();
    await user.click(screen.getByLabelText('HR'));
    expect(onChange).toHaveBeenCalledWith(['hr']);
  });

  it('handles unchecking an item', async () => {
    const user = userEvent.setup();
    const { onChange } = renderGroup({ value: ['hr', 'finance'] });
    await user.click(screen.getByLabelText('HR'));
    expect(onChange).toHaveBeenCalledWith(['finance']);
  });

  it('disables individual items', () => {
    renderGroup();
    expect(screen.getByLabelText('IT')).toBeDisabled();
  });

  it('shows error state', () => {
    renderGroup({ error: 'Select at least one' });
    expect(screen.getByRole('alert')).toHaveTextContent('Select at least one');
  });

  it('has no a11y violations with error', async () => {
    const { container } = renderGroup({ error: 'Select at least one' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('checks items that are in value array', () => {
    renderGroup({ value: ['hr'] });
    expect(screen.getByLabelText('HR')).toBeChecked();
    expect(screen.getByLabelText('Finance')).not.toBeChecked();
  });
});
