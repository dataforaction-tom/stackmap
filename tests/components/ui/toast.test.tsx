import { render, screen, act } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ToastProvider, useToast } from '@/components/ui/toast';

// Helper that triggers toasts programmatically to avoid userEvent + fakeTimers conflicts
function TestHarness({ autoType, autoMessage, autoDuration }: { autoType?: string; autoMessage?: string; autoDuration?: number }) {
  const { toast } = useToast();
  return (
    <div>
      <button
        data-testid="trigger"
        onClick={() => toast((autoType ?? 'success') as any, autoMessage ?? 'Test message', autoDuration)}
      >
        Trigger
      </button>
    </div>
  );
}

function renderToast(props: { type?: string; message?: string; duration?: number } = {}) {
  return render(
    <ToastProvider>
      <TestHarness autoType={props.type} autoMessage={props.message} autoDuration={props.duration} />
    </ToastProvider>,
  );
}

function clickTrigger() {
  act(() => {
    screen.getByTestId('trigger').click();
  });
}

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('has no accessibility violations when showing a toast', async () => {
    // Use real timers for axe - no timing dependency
    const { container } = renderToast({ duration: 60000 });
    clickTrigger();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows toast message on trigger', () => {
    vi.useFakeTimers();
    renderToast();
    clickTrigger();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('shows different toast types', () => {
    vi.useFakeTimers();
    renderToast({ type: 'error', message: 'Failed!' });
    clickTrigger();
    expect(screen.getByText('Failed!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('auto-dismisses after duration', () => {
    vi.useFakeTimers();
    renderToast({ duration: 200 });
    clickTrigger();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('can be manually dismissed', () => {
    vi.useFakeTimers();
    renderToast();
    clickTrigger();
    expect(screen.getByText('Test message')).toBeInTheDocument();

    act(() => {
      screen.getByLabelText('Dismiss notification').click();
    });

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('uses role="alert" on toast messages', () => {
    vi.useFakeTimers();
    renderToast({ type: 'info', message: 'FYI' });
    clickTrigger();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has aria-live region', () => {
    const { container } = renderToast();
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('throws when useToast is used outside provider', () => {
    function BadComponent() {
      useToast();
      return null;
    }
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BadComponent />)).toThrow(
      'useToast must be used within a ToastProvider',
    );
    spy.mockRestore();
  });
});
