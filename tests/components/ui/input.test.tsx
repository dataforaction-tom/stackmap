import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Input label="Email" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders label and input', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('handles user typing', async () => {
    const user = userEvent.setup();
    render(<Input label="Name" />);
    const input = screen.getByLabelText('Name');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('shows required indicator', () => {
    render(<Input label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeRequired();
  });

  it('shows helper text', () => {
    render(<Input label="Email" helperText="We will not share your email" />);
    expect(screen.getByText('We will not share your email')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<Input label="Email" error="Email is required" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
  });

  it('associates aria-describedby with helper text', () => {
    render(<Input label="Email" helperText="Help" id="email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-describedby', 'email-helper');
  });

  it('associates aria-describedby with error', () => {
    render(<Input label="Email" error="Bad" id="email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('hides helper text when error is shown', () => {
    render(<Input label="Email" helperText="Help" error="Bad" />);
    expect(screen.queryByText('Help')).not.toBeInTheDocument();
    expect(screen.getByText('Bad')).toBeInTheDocument();
  });

  it('has no a11y violations with error', async () => {
    const { container } = render(<Input label="Email" error="Email is required" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
