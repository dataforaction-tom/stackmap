import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { ImportDialog } from '@/components/import/import-dialog';
import type { Architecture } from '@/lib/types';

function makeValidArchitecture(): Architecture {
  return {
    organisation: {
      id: 'org-1',
      name: 'Test Org',
      type: 'charity',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    functions: [
      { id: 'f1', name: 'Finance', type: 'finance', isActive: true },
      { id: 'f2', name: 'People', type: 'people', isActive: true },
    ],
    services: [
      {
        id: 's1',
        name: 'Advice Line',
        status: 'active',
        functionIds: ['f1'],
        systemIds: ['sys1'],
      },
    ],
    systems: [
      {
        id: 'sys1',
        name: 'Salesforce',
        type: 'crm',
        hosting: 'cloud',
        status: 'active',
        functionIds: ['f1'],
        serviceIds: ['s1'],
      },
      {
        id: 'sys2',
        name: 'Xero',
        type: 'finance',
        hosting: 'cloud',
        status: 'active',
        functionIds: ['f1'],
        serviceIds: [],
      },
      {
        id: 'sys3',
        name: 'BreatheHR',
        type: 'hr',
        hosting: 'cloud',
        status: 'active',
        functionIds: ['f2'],
        serviceIds: [],
      },
    ],
    dataCategories: [],
    integrations: [],
    owners: [{ id: 'o1', name: 'Jane', isExternal: false }],
    metadata: {
      version: '1',
      exportedAt: '2024-01-01T00:00:00Z',
      stackmapVersion: '0.1.0',
      mappingPath: 'function_first',
    },
  };
}

function createFile(content: string, name: string, type: string): File {
  return new File([content], name, { type });
}

describe('ImportDialog', () => {
  it('has no accessibility violations when open', async () => {
    const { container } = render(
      <ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows format picker with JSON and CSV options', () => {
    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.getByText(/json/i)).toBeInTheDocument();
    expect(screen.getByText(/csv/i)).toBeInTheDocument();
  });

  it('is not visible when open is false', () => {
    render(<ImportDialog open={false} onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape key', async () => {
    const onClose = vi.fn();
    render(<ImportDialog open onClose={onClose} onImport={vi.fn()} />);
    await userEvent.setup().keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('advances to file step when JSON format is selected', async () => {
    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/json/i));
    expect(screen.getByText(/select a .json file/i)).toBeInTheDocument();
  });

  it('advances to file step when CSV format is selected', async () => {
    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/csv/i));
    expect(screen.getByText(/select a .csv file/i)).toBeInTheDocument();
  });

  it('shows back button on file step', async () => {
    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/json/i));
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('goes back to format picker when back button is clicked', async () => {
    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/json/i));
    await user.click(screen.getByRole('button', { name: /back/i }));
    // Should be back on format picker
    expect(screen.getByText(/full architecture/i)).toBeInTheDocument();
  });

  it('shows JSON preview with summary counts after valid JSON file upload', async () => {
    const arch = makeValidArchitecture();
    const file = createFile(JSON.stringify(arch), 'stack.json', 'application/json');

    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/json/i));

    const input = screen.getByLabelText(/select a .json file/i);
    await user.upload(input, file);

    // Should show preview with counts (text split across elements, so use substring matcher)
    expect(await screen.findByText((_, el) =>
      el?.tagName === 'LI' && /2\s+functions/.test(el.textContent ?? ''),
    )).toBeInTheDocument();
    expect(screen.getByText((_, el) =>
      el?.tagName === 'LI' && /3\s+systems/.test(el.textContent ?? ''),
    )).toBeInTheDocument();
    expect(screen.getByText((_, el) =>
      el?.tagName === 'LI' && /1\s+service/.test(el.textContent ?? ''),
    )).toBeInTheDocument();
    expect(screen.getByText((_, el) =>
      el?.tagName === 'LI' && /1\s+owner/.test(el.textContent ?? ''),
    )).toBeInTheDocument();
  });

  it('calls onImport with validated architecture when Replace button is clicked', async () => {
    const arch = makeValidArchitecture();
    const file = createFile(JSON.stringify(arch), 'stack.json', 'application/json');
    const onImport = vi.fn();

    render(<ImportDialog open onClose={vi.fn()} onImport={onImport} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/json/i));

    const input = screen.getByLabelText(/select a .json file/i);
    await user.upload(input, file);

    await screen.findByText((_, el) =>
      el?.tagName === 'LI' && /2\s+functions/.test(el.textContent ?? ''),
    );
    await user.click(screen.getByRole('button', { name: /replace current data/i }));

    expect(onImport).toHaveBeenCalledTimes(1);
    const importedArch = onImport.mock.calls[0][0] as Architecture;
    expect(importedArch.systems).toHaveLength(3);
    expect(importedArch.functions).toHaveLength(2);
  });

  it('shows error step for invalid JSON', async () => {
    const file = createFile('not json at all', 'bad.json', 'application/json');

    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/json/i));

    const input = screen.getByLabelText(/select a .json file/i);
    await user.upload(input, file);

    expect(await screen.findByText(/isn.*t valid json/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows Zod validation errors as a list', async () => {
    // Valid JSON but wrong structure
    const file = createFile(JSON.stringify({ foo: 'bar' }), 'bad.json', 'application/json');

    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/json/i));

    const input = screen.getByLabelText(/select a .json file/i);
    await user.upload(input, file);

    expect(await screen.findByText(/doesn.*t match the stackmap format/i)).toBeInTheDocument();
    // Should show a list of errors
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('goes back to file step when try again is clicked', async () => {
    const file = createFile('not json', 'bad.json', 'application/json');

    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/json/i));

    const input = screen.getByLabelText(/select a .json file/i);
    await user.upload(input, file);

    await screen.findByText(/isn.*t valid json/i);
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.getByText(/select a .json file/i)).toBeInTheDocument();
  });

  it('shows CSV preview with row count after valid CSV upload', async () => {
    const csv = 'name,type,vendor\nSalesforce,crm,Salesforce\nXero,finance,Xero\n';
    const file = createFile(csv, 'systems.csv', 'text/csv');

    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/csv/i));

    const input = screen.getByLabelText(/select a .csv file/i);
    await user.upload(input, file);

    // Placeholder CSV preview should show row count
    expect(await screen.findByText((_, el) =>
      el?.tagName === 'P' && /Found\s+2\s+systems/.test(el.textContent ?? ''),
    )).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import 2 systems/i })).toBeInTheDocument();
  });

  it('shows error for invalid CSV (no name column)', async () => {
    const csv = 'foo,bar\n1,2\n';
    const file = createFile(csv, 'bad.csv', 'text/csv');

    render(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/csv/i));

    const input = screen.getByLabelText(/select a .csv file/i);
    await user.upload(input, file);

    expect(await screen.findByText(/no name column found/i)).toBeInTheDocument();
  });

  it('resets state when dialog is closed and reopened', async () => {
    const { rerender } = render(
      <ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText(/json/i));
    expect(screen.getByText(/select a .json file/i)).toBeInTheDocument();

    // Close dialog
    rerender(<ImportDialog open={false} onClose={vi.fn()} onImport={vi.fn()} />);
    // Reopen dialog
    rerender(<ImportDialog open onClose={vi.fn()} onImport={vi.fn()} />);

    // Should be back on format picker
    expect(screen.getByText(/full architecture/i)).toBeInTheDocument();
  });
});
