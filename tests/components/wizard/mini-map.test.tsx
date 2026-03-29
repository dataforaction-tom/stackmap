import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MiniMap } from '@/components/wizard/mini-map';
import type { ArchitectureContextValue } from '@/hooks/useArchitecture';
import type { Architecture } from '@/lib/types';

// ─── Blank architecture ───

const blank: Architecture = {
  organisation: { id: '1', name: '', type: 'charity', createdAt: '', updatedAt: '' },
  functions: [],
  services: [],
  systems: [],
  dataCategories: [],
  integrations: [],
  owners: [],
  metadata: { version: '1', exportedAt: '', stackmapVersion: '0.1.0', mappingPath: 'function_first' },
};

// ─── Mock context ───

const mockContextValue: ArchitectureContextValue = {
  architecture: blank,
  isLoading: false,
  updateOrganisation: vi.fn(),
  addFunction: vi.fn().mockReturnValue(''),
  updateFunction: vi.fn(),
  removeFunction: vi.fn(),
  addService: vi.fn().mockReturnValue(''),
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
  setTechFreedomEnabled: vi.fn(),
  save: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(undefined),
  getArchitecture: vi.fn().mockReturnValue(null),
};

vi.mock('@/hooks/useArchitecture', () => ({
  useArchitecture: () => mockContextValue,
}));

// ─── Helpers ───

function setArchitecture(arch: Architecture) {
  mockContextValue.architecture = arch;
}

// ─── Tests ───

describe('MiniMap', () => {
  beforeEach(() => {
    setArchitecture(blank);
  });

  it('has no axe violations', async () => {
    const { container } = render(<MiniMap />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders SVG with role="img" and aria-label', () => {
    render(<MiniMap />);
    const svg = screen.getByRole('img');
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg).toHaveAttribute('aria-label');
  });

  it('shows empty state text when no entities', () => {
    render(<MiniMap />);
    expect(screen.getByText('Your map will appear here')).toBeInTheDocument();
  });

  it('renders function blocks when functions exist', () => {
    setArchitecture({
      ...blank,
      functions: [
        { id: 'f1', name: 'Finance', type: 'finance', isActive: true },
        { id: 'f2', name: 'People', type: 'people', isActive: true },
      ],
    });
    render(<MiniMap />);
    const svg = screen.getByRole('img');
    const rects = svg.querySelectorAll('rect[data-function-id]');
    expect(rects.length).toBe(2);
  });

  it('renders system nodes when systems exist', () => {
    setArchitecture({
      ...blank,
      functions: [{ id: 'f1', name: 'Finance', type: 'finance', isActive: true }],
      systems: [
        { id: 's1', name: 'Xero', type: 'finance', hosting: 'cloud', status: 'active', functionIds: ['f1'], serviceIds: [] },
      ],
    });
    render(<MiniMap />);
    const svg = screen.getByRole('img');
    const circles = svg.querySelectorAll('circle[data-system-id]');
    expect(circles.length).toBe(1);
  });

  it('renders integration lines when integrations exist', () => {
    setArchitecture({
      ...blank,
      functions: [{ id: 'f1', name: 'Finance', type: 'finance', isActive: true }],
      systems: [
        { id: 's1', name: 'Xero', type: 'finance', hosting: 'cloud', status: 'active', functionIds: ['f1'], serviceIds: [] },
        { id: 's2', name: 'Slack', type: 'messaging', hosting: 'cloud', status: 'active', functionIds: ['f1'], serviceIds: [] },
      ],
      integrations: [
        { id: 'i1', sourceSystemId: 's1', targetSystemId: 's2', type: 'api', direction: 'one_way', frequency: 'real_time', reliability: 'reliable' },
      ],
    });
    render(<MiniMap />);
    const svg = screen.getByRole('img');
    const paths = svg.querySelectorAll('path[data-integration-id]');
    expect(paths.length).toBe(1);
  });

  it('uses colour coding for function blocks', () => {
    setArchitecture({
      ...blank,
      functions: [{ id: 'f1', name: 'Finance', type: 'finance', isActive: true }],
    });
    render(<MiniMap />);
    const svg = screen.getByRole('img');
    const rect = svg.querySelector('rect[data-function-id="f1"]');
    expect(rect).toHaveAttribute('fill', '#34d399');
  });

  it('renders shared systems in a separate section when system has multiple functionIds', () => {
    setArchitecture({
      ...blank,
      functions: [
        { id: 'f1', name: 'Finance', type: 'finance', isActive: true },
        { id: 'f2', name: 'People', type: 'people', isActive: true },
      ],
      systems: [
        { id: 's1', name: 'SharedSys', type: 'crm', hosting: 'cloud', status: 'active', functionIds: ['f1', 'f2'], serviceIds: [] },
      ],
    });
    render(<MiniMap />);
    const svg = screen.getByRole('img');

    // Should use data-shared-system-id, not data-system-id
    const sharedGroup = svg.querySelector('g[data-shared-system-id="s1"]');
    expect(sharedGroup).toBeInTheDocument();
    expect(svg.querySelector('circle[data-system-id="s1"]')).not.toBeInTheDocument();

    // Should have function-colour dots (one per function)
    const sharedDots = svg.querySelectorAll('circle[data-function-dot]');
    expect(sharedDots.length).toBe(2);

    // Should have a "Shared" label
    expect(screen.getByText('Shared')).toBeInTheDocument();
  });

  it('renders single-function systems under their parent function', () => {
    setArchitecture({
      ...blank,
      functions: [
        { id: 'f1', name: 'Finance', type: 'finance', isActive: true },
        { id: 'f2', name: 'People', type: 'people', isActive: true },
      ],
      systems: [
        { id: 's1', name: 'Xero', type: 'finance', hosting: 'cloud', status: 'active', functionIds: ['f1'], serviceIds: [] },
        { id: 's2', name: 'SharedSys', type: 'crm', hosting: 'cloud', status: 'active', functionIds: ['f1', 'f2'], serviceIds: [] },
      ],
    });
    render(<MiniMap />);
    const svg = screen.getByRole('img');

    // Single-function system uses data-system-id
    expect(svg.querySelector('circle[data-system-id="s1"]')).toBeInTheDocument();
    // Shared system uses data-shared-system-id
    expect(svg.querySelector('g[data-shared-system-id="s2"]')).toBeInTheDocument();
    expect(svg.querySelector('circle[data-system-id="s2"]')).not.toBeInTheDocument();
  });
});
