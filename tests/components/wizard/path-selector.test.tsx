import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PathSelectorPage from '@/app/wizard/page';

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const clearMock = vi.fn().mockResolvedValue(undefined);

const emptyArch = {
  organisation: { id: '1', name: '', type: 'charity', createdAt: '', updatedAt: '' },
  functions: [],
  services: [],
  systems: [],
  dataCategories: [],
  integrations: [],
  owners: [],
  metadata: { version: '1', exportedAt: '', stackmapVersion: '0.1.0', mappingPath: 'function_first', techFreedomEnabled: false },
};

const populatedArch = {
  ...emptyArch,
  functions: [
    { id: 'f1', name: 'Finance', type: 'finance', isActive: true },
    { id: 'f2', name: 'People', type: 'people', isActive: true },
  ],
  systems: [
    { id: 's1', name: 'Xero', type: 'finance', hosting: 'cloud', status: 'active', functionIds: ['f1'], serviceIds: [] },
  ],
};

let mockArchitecture = emptyArch;

vi.mock('@/hooks/useArchitecture', () => ({
  useArchitecture: () => ({
    architecture: mockArchitecture,
    isLoading: false,
    clear: clearMock,
  }),
}));

describe('PathSelectorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockArchitecture = emptyArch;
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PathSelectorPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders the page heading', () => {
    render(<PathSelectorPage />);
    expect(
      screen.getByRole('heading', { name: /how would you like to begin/i }),
    ).toBeInTheDocument();
  });

  it('renders both path options', () => {
    render(<PathSelectorPage />);
    expect(screen.getByText('Start with what we do')).toBeInTheDocument();
    expect(screen.getByText('Start with what we deliver')).toBeInTheDocument();
  });

  it('shows descriptions for each path', () => {
    render(<PathSelectorPage />);
    expect(
      screen.getByText(/common organisational functions/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/clear service offerings/i),
    ).toBeInTheDocument();
  });

  it('links function-first card to /wizard/functions', () => {
    render(<PathSelectorPage />);
    const functionLink = screen.getByText('Start with what we do').closest('a');
    expect(functionLink).toHaveAttribute('href', '/wizard/functions');
  });

  it('links service-first card to /wizard/services', () => {
    render(<PathSelectorPage />);
    const serviceLink = screen.getByText('Start with what we deliver').closest('a');
    expect(serviceLink).toHaveAttribute('href', '/wizard/services');
  });

  it('renders a list of mapping options', () => {
    render(<PathSelectorPage />);
    const list = screen.getByRole('list', { name: /mapping path options/i });
    expect(list).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('does not show existing data banner when architecture is empty', () => {
    render(<PathSelectorPage />);
    expect(screen.queryByText(/existing map/i)).not.toBeInTheDocument();
  });

  it('shows existing data banner when architecture has data', () => {
    mockArchitecture = populatedArch;
    render(<PathSelectorPage />);
    expect(screen.getByText(/existing map/i)).toBeInTheDocument();
    expect(screen.getByText(/3 items/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start fresh/i })).toBeInTheDocument();
  });

  it('shows confirmation when Start fresh is clicked', async () => {
    const user = userEvent.setup();
    mockArchitecture = populatedArch;
    render(<PathSelectorPage />);

    await user.click(screen.getByRole('button', { name: /start fresh/i }));
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes, clear everything/i })).toBeInTheDocument();
  });

  it('calls clear when confirmed', async () => {
    const user = userEvent.setup();
    mockArchitecture = populatedArch;
    render(<PathSelectorPage />);

    await user.click(screen.getByRole('button', { name: /start fresh/i }));
    await user.click(screen.getByRole('button', { name: /yes, clear everything/i }));
    expect(clearMock).toHaveBeenCalled();
  });

  it('cancels confirmation with Keep my data', async () => {
    const user = userEvent.setup();
    mockArchitecture = populatedArch;
    render(<PathSelectorPage />);

    await user.click(screen.getByRole('button', { name: /start fresh/i }));
    await user.click(screen.getByRole('button', { name: /keep my data/i }));
    expect(screen.queryByText(/cannot be undone/i)).not.toBeInTheDocument();
    expect(clearMock).not.toHaveBeenCalled();
  });
});
