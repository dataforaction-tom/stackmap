import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceForm } from '@/components/wizard/service-form';
import type { ArchitectureContextValue } from '@/hooks/useArchitecture';

// ─── Mocks ───

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const addServiceMock = vi.fn().mockReturnValue('mock-svc-id');

const mockContextValue: ArchitectureContextValue = {
  architecture: {
    organisation: { id: '1', name: 'Test Org', type: 'charity', createdAt: '', updatedAt: '' },
    functions: [
      { id: 'fn-1', name: 'Finance', type: 'finance', isActive: true },
      { id: 'fn-2', name: 'Fundraising', type: 'fundraising', isActive: true },
    ],
    services: [],
    systems: [],
    dataCategories: [],
    integrations: [],
    owners: [],
    metadata: { version: '1.0.0', exportedAt: '', stackmapVersion: '0.1.0', mappingPath: 'function_first' },
  },
  isLoading: false,
  updateOrganisation: vi.fn(),
  addFunction: vi.fn().mockReturnValue(''),
  updateFunction: vi.fn(),
  removeFunction: vi.fn(),
  addService: addServiceMock,
  updateService: vi.fn(),
  removeService: vi.fn(),
  addSystem: vi.fn().mockReturnValue(''),
  updateSystem: vi.fn(),
  removeSystem: vi.fn(),
  addDataCategory: vi.fn().mockReturnValue(''),
  removeDataCategory: vi.fn(),
  addIntegration: vi.fn().mockReturnValue(''),
  removeIntegration: vi.fn(),
  addOwner: vi.fn().mockReturnValue(''),
  removeOwner: vi.fn(),
  save: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(undefined),
  getArchitecture: vi.fn().mockReturnValue(null),
};

vi.mock('@/hooks/useArchitecture', () => ({
  useArchitecture: () => mockContextValue,
}));

describe('ServiceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has no accessibility violations on initial screen', async () => {
    const { container } = render(<ServiceForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders the initial choice question', () => {
    render(<ServiceForm />);
    expect(
      screen.getByRole('heading', { name: /do you want to map specific services/i }),
    ).toBeInTheDocument();
  });

  it('has a skip option', () => {
    render(<ServiceForm />);
    expect(screen.getByRole('button', { name: /skip this step/i })).toBeInTheDocument();
  });

  it('navigates to data step when skip is clicked', async () => {
    const user = userEvent.setup();
    render(<ServiceForm />);
    await user.click(screen.getByRole('button', { name: /skip this step/i }));
    expect(pushMock).toHaveBeenCalledWith('/wizard/functions/data');
  });

  it('shows the add form when user chooses yes', async () => {
    const user = userEvent.setup();
    render(<ServiceForm />);
    await user.click(screen.getByRole('button', { name: /yes, add services/i }));
    expect(screen.getByRole('heading', { name: /add your services/i })).toBeInTheDocument();
  });

  it('has no accessibility violations on the add form', async () => {
    const user = userEvent.setup();
    const { container } = render(<ServiceForm />);
    await user.click(screen.getByRole('button', { name: /yes, add services/i }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('can add a service and shows it in the list', async () => {
    const user = userEvent.setup();
    render(<ServiceForm />);
    await user.click(screen.getByRole('button', { name: /yes, add services/i }));

    await user.type(screen.getByLabelText(/service name/i), 'Youth mentoring');
    await user.click(screen.getByRole('button', { name: /add service/i }));

    expect(screen.getByText('Youth mentoring')).toBeInTheDocument();
  });

  it('disables add button when name is empty', async () => {
    const user = userEvent.setup();
    render(<ServiceForm />);
    await user.click(screen.getByRole('button', { name: /yes, add services/i }));

    expect(screen.getByRole('button', { name: /add service/i })).toBeDisabled();
  });

  it('can remove an added service', async () => {
    const user = userEvent.setup();
    render(<ServiceForm />);
    await user.click(screen.getByRole('button', { name: /yes, add services/i }));

    await user.type(screen.getByLabelText(/service name/i), 'Food bank');
    await user.click(screen.getByRole('button', { name: /add service/i }));
    expect(screen.getByText('Food bank')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove food bank/i }));
    expect(screen.queryByText('Food bank')).not.toBeInTheDocument();
  });

  it('calls addService for each added service on continue', async () => {
    const user = userEvent.setup();
    render(<ServiceForm />);
    await user.click(screen.getByRole('button', { name: /yes, add services/i }));

    await user.type(screen.getByLabelText(/service name/i), 'Counselling');
    await user.click(screen.getByRole('button', { name: /add service/i }));
    await user.click(screen.getByRole('button', { name: /^continue$/i }));

    expect(addServiceMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Counselling', status: 'active' }),
    );
    expect(pushMock).toHaveBeenCalledWith('/wizard/functions/data');
  });

  it('shows function checkboxes for linking', async () => {
    const user = userEvent.setup();
    render(<ServiceForm />);
    await user.click(screen.getByRole('button', { name: /yes, add services/i }));

    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Fundraising')).toBeInTheDocument();
  });

  it('has a Back link to systems', () => {
    render(<ServiceForm />);
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute(
      'href',
      '/wizard/functions/systems',
    );
  });
});
