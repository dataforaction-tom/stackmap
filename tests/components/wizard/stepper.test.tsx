import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Stepper } from '@/components/wizard/stepper';

// ─── Mock usePathname ───

let mockPathname = '/wizard/functions';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// ─── Mock next/link ───

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  mockPathname = '/wizard/functions';
});

describe('Wizard Stepper', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Stepper />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders 10 steps for function-first path', () => {
    render(<Stepper />);
    const nav = screen.getByRole('navigation', { name: /wizard progress/i });
    const list = nav.querySelector('ol');
    const items = list?.querySelectorAll('li');
    expect(items).toHaveLength(10);
  });

  it('renders 10 steps for service-first path', () => {
    mockPathname = '/wizard/services';
    render(<Stepper />);
    const nav = screen.getByRole('navigation', { name: /wizard progress/i });
    const list = nav.querySelector('ol');
    const items = list?.querySelectorAll('li');
    expect(items).toHaveLength(10);
  });

  it('includes Importance step as step 5 in function-first path', () => {
    mockPathname = '/wizard/functions/importance';
    render(<Stepper />);
    const step = screen.getByText('Importance');
    expect(step).toBeInTheDocument();
    expect(step).toHaveAttribute('aria-current', 'step');
  });

  it('includes Risk assessment step as step 2', () => {
    mockPathname = '/wizard/techfreedom';
    render(<Stepper />);
    const step = screen.getByText('Risk assessment');
    expect(step).toBeInTheDocument();
    expect(step).toHaveAttribute('aria-current', 'step');
  });

  it('marks the current step with aria-current', () => {
    mockPathname = '/wizard/functions';
    render(<Stepper />);
    const current = screen.getByText('Functions');
    expect(current).toHaveAttribute('aria-current', 'step');
  });

  it('uses service-first steps when on a service path', () => {
    mockPathname = '/wizard/services/systems';
    render(<Stepper />);
    // In service-first, step 3 is Systems (after Choose path, Risk assessment, Services)
    const current = screen.getByText('Systems');
    expect(current).toHaveAttribute('aria-current', 'step');
  });

  it('renders completed steps as links', () => {
    mockPathname = '/wizard/functions/systems';
    render(<Stepper />);
    // Choose path, Risk assessment, and Functions should be completed (links)
    const nav = screen.getByRole('navigation', { name: /wizard progress/i });
    const links = nav.querySelectorAll('ol a');
    expect(links.length).toBe(3);
  });
});
