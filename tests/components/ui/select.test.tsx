import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { Select } from '@/components/ui/select';

function renderSelect(props: Partial<React.ComponentProps<typeof Select>> = {}) {
  return render(
    <Select label="Country" {...props}>
      <option value="">Select a country</option>
      <option value="uk">United Kingdom</option>
      <option value="ie">Ireland</option>
    </Select>,
  );
}

describe('Select', () => {
  it('has no accessibility violations', async () => {
    const { container } = renderSelect();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders label and select', () => {
    renderSelect();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles user selection', async () => {
    const user = userEvent.setup();
    renderSelect();
    await user.selectOptions(screen.getByRole('combobox'), 'uk');
    expect(screen.getByRole('combobox')).toHaveValue('uk');
  });

  it('shows required indicator', () => {
    renderSelect({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    renderSelect({ helperText: 'Choose your country' });
    expect(screen.getByText('Choose your country')).toBeInTheDocument();
  });

  it('shows error state', () => {
    renderSelect({ error: 'Country is required' });
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Country is required');
  });

  it('has no a11y violations with error', async () => {
    const { container } = renderSelect({ error: 'Required' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
