import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { Card } from '@/components/ui/card';

describe('Card', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Card>Content</Card>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders heading when provided', () => {
    render(<Card heading="Title">Content</Card>);
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
  });

  it('uses correct heading level', () => {
    render(<Card heading="Title" headingLevel="h2">Content</Card>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Title');
  });

  it('applies padding variants', () => {
    const { container, rerender } = render(<Card padding="sm">C</Card>);
    expect(container.firstChild).toHaveClass('p-3');

    rerender(<Card padding="lg">C</Card>);
    expect(container.firstChild).toHaveClass('p-7');

    rerender(<Card padding="none">C</Card>);
    expect(container.firstChild).not.toHaveClass('p-5');
  });

  it('renders as link when interactive', () => {
    render(<Card interactive href="/detail">Click me</Card>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/detail');
  });

  it('has hover/focus classes when interactive', () => {
    render(<Card interactive href="/detail">Click me</Card>);
    const link = screen.getByRole('link');
    expect(link.className).toContain('hover:shadow-md');
  });

  it('has no a11y violations when interactive', async () => {
    const { container } = render(<Card interactive href="/detail">Click me</Card>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
