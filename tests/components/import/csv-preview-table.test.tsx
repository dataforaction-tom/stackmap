import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { CsvPreviewTable } from '@/components/import/csv-preview-table';
import type { CsvSystemRow } from '@/lib/import';

const sampleRows: CsvSystemRow[] = [
  {
    name: 'Salesforce',
    vendor: 'Salesforce',
    type: 'crm',
    matchedType: 'crm',
    cost: 1200,
    matchedFunction: 'fundraising',
    function: 'fundraising',
    completeness: 'full',
  },
  {
    name: 'Wiki',
    matchedType: 'other',
    completeness: 'minimal',
  },
];

describe('CsvPreviewTable', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <CsvPreviewTable rows={sampleRows} onChange={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders all rows', () => {
    render(<CsvPreviewTable rows={sampleRows} onChange={vi.fn()} />);
    // Salesforce appears in both name and vendor inputs
    expect(screen.getAllByDisplayValue('Salesforce')).toHaveLength(2);
    expect(screen.getByDisplayValue('Wiki')).toBeInTheDocument();
  });

  it('highlights incomplete cells with amber background', () => {
    render(<CsvPreviewTable rows={sampleRows} onChange={vi.fn()} />);
    // Wiki row vendor cell should have amber styling
    const vendorCell = document.querySelector(
      '[data-row="1"][data-col="vendor"]',
    );
    expect(vendorCell?.className).toContain('bg-amber-50');
  });

  it('highlights complete cells with green background', () => {
    render(<CsvPreviewTable rows={sampleRows} onChange={vi.fn()} />);
    // Salesforce row vendor cell should have green styling
    const vendorCell = document.querySelector(
      '[data-row="0"][data-col="vendor"]',
    );
    expect(vendorCell?.className).toContain('bg-green-50');
  });

  it('allows editing a cell and calls onChange', async () => {
    const onChange = vi.fn();
    render(<CsvPreviewTable rows={sampleRows} onChange={onChange} />);
    const user = userEvent.setup();
    const nameInput = screen.getByDisplayValue('Wiki');
    await user.clear(nameInput);
    await user.type(nameInput, 'Internal Wiki');
    expect(onChange).toHaveBeenCalled();
  });

  it('pre-selects matched type in dropdown', () => {
    render(<CsvPreviewTable rows={sampleRows} onChange={vi.fn()} />);
    // Salesforce row should have CRM selected
    const typeSelect = document.querySelector(
      '[data-row="0"][data-col="type"] select',
    ) as HTMLSelectElement;
    expect(typeSelect?.value).toBe('crm');
  });

  it('pre-selects matched function in dropdown', () => {
    render(<CsvPreviewTable rows={sampleRows} onChange={vi.fn()} />);
    const fnSelect = document.querySelector(
      '[data-row="0"][data-col="function"] select',
    ) as HTMLSelectElement;
    expect(fnSelect?.value).toBe('fundraising');
  });

  it('shows empty option for function when not matched', () => {
    render(<CsvPreviewTable rows={sampleRows} onChange={vi.fn()} />);
    const fnSelect = document.querySelector(
      '[data-row="1"][data-col="function"] select',
    ) as HTMLSelectElement;
    expect(fnSelect?.value).toBe('');
  });

  it('calls onChange when type dropdown changes', async () => {
    const onChange = vi.fn();
    render(<CsvPreviewTable rows={sampleRows} onChange={onChange} />);
    const user = userEvent.setup();
    const typeSelect = document.querySelector(
      '[data-row="1"][data-col="type"] select',
    ) as HTMLSelectElement;
    await user.selectOptions(typeSelect, 'website');
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall[1].matchedType).toBe('website');
  });

  it('renders table headers', () => {
    render(<CsvPreviewTable rows={sampleRows} onChange={vi.fn()} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Vendor')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Cost')).toBeInTheDocument();
    expect(screen.getByText('Function')).toBeInTheDocument();
  });
});
