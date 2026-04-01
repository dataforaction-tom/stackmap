import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { BullseyeDiagram } from '@/components/wizard/bullseye-diagram';
import type { System, OrgFunction } from '@/lib/types';

const mockFunctions: OrgFunction[] = [
  { id: 'fn-1', name: 'Finance', type: 'finance', isActive: true },
];

const mockSystems: System[] = [
  {
    id: 'sys-1', name: 'Xero', type: 'finance', hosting: 'cloud',
    status: 'active', functionIds: ['fn-1'], serviceIds: [], importance: 9,
  },
  {
    id: 'sys-2', name: 'Slack', type: 'messaging', hosting: 'cloud',
    status: 'active', functionIds: ['fn-1'], serviceIds: [], importance: 5,
  },
  {
    id: 'sys-3', name: 'Notepad', type: 'other', hosting: 'cloud',
    status: 'active', functionIds: ['fn-1'], serviceIds: [], importance: 2,
  },
  {
    id: 'sys-4', name: 'WhatsApp', type: 'messaging', hosting: 'cloud',
    status: 'active', functionIds: [], serviceIds: [], isShadow: true,
  },
];

describe('BullseyeDiagram', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <BullseyeDiagram systems={mockSystems} functions={mockFunctions} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders an SVG with role img', () => {
    render(<BullseyeDiagram systems={mockSystems} functions={mockFunctions} />);
    const svg = screen.getByRole('img', { name: /importance/i });
    expect(svg).toBeInTheDocument();
  });

  it('renders three ring labels', () => {
    render(<BullseyeDiagram systems={mockSystems} functions={mockFunctions} />);
    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Peripheral')).toBeInTheDocument();
  });

  it('renders system labels', () => {
    render(<BullseyeDiagram systems={mockSystems} functions={mockFunctions} />);
    expect(screen.getByText('Xero')).toBeInTheDocument();
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.getByText('Notepad')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('renders shadow systems with dashed stroke', () => {
    const { container } = render(
      <BullseyeDiagram systems={mockSystems} functions={mockFunctions} />
    );
    // WhatsApp is shadow with no score — its circle should have a dasharray
    const circles = container.querySelectorAll('circle');
    const whatsappCircle = Array.from(circles).find(c => {
      const label = c.nextElementSibling;
      return label?.textContent === 'WhatsApp';
    });
    expect(whatsappCircle?.getAttribute('stroke-dasharray')).toBeTruthy();
  });

  it('handles empty systems array', () => {
    const { container } = render(
      <BullseyeDiagram systems={[]} functions={[]} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
