import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { RadarChart } from '@/components/techfreedom/radar-chart';
import type { RiskDimensionKey } from '@/lib/techfreedom/types';

const scores: Record<RiskDimensionKey, number> = {
  jurisdiction: 3,
  continuity: 2,
  surveillance: 4,
  lockIn: 3,
  costExposure: 2,
};

describe('RadarChart', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<RadarChart scores={scores} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders an SVG element', () => {
    const { container } = render(<RadarChart scores={scores} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has role="img" on the SVG', () => {
    render(<RadarChart scores={scores} />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  it('has a descriptive aria-label', () => {
    render(<RadarChart scores={scores} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('aria-label', expect.stringMatching(/radar chart/i));
  });

  it('renders axis labels for all 5 dimensions', () => {
    render(<RadarChart scores={scores} />);
    expect(screen.getByText('Jurisdiction')).toBeInTheDocument();
    expect(screen.getByText('Continuity')).toBeInTheDocument();
    expect(screen.getByText('Surveillance')).toBeInTheDocument();
    expect(screen.getByText('Lock-in')).toBeInTheDocument();
    expect(screen.getByText('Cost Exposure')).toBeInTheDocument();
  });

  it('renders grid lines', () => {
    const { container } = render(<RadarChart scores={scores} />);
    const polygons = container.querySelectorAll('polygon');
    // At least 5 grid polygons (one per level) plus 1 data polygon
    expect(polygons.length).toBeGreaterThanOrEqual(6);
  });

  it('accepts a custom size prop', () => {
    const { container } = render(<RadarChart scores={scores} size={400} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '400');
    expect(svg).toHaveAttribute('height', '400');
  });
});
