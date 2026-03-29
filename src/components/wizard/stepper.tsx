'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Step {
  label: string;
  path: string;
}

const FUNCTION_FIRST_STEPS: Step[] = [
  { label: 'Choose path', path: '/wizard' },
  { label: 'Risk assessment', path: '/wizard/techfreedom' },
  { label: 'Functions', path: '/wizard/functions' },
  { label: 'Systems', path: '/wizard/functions/systems' },
  { label: 'Services', path: '/wizard/functions/services' },
  { label: 'Data', path: '/wizard/functions/data' },
  { label: 'Integrations', path: '/wizard/functions/integrations' },
  { label: 'Owners', path: '/wizard/functions/owners' },
  { label: 'Review', path: '/wizard/functions/review' },
];

const SERVICE_FIRST_STEPS: Step[] = [
  { label: 'Choose path', path: '/wizard' },
  { label: 'Risk assessment', path: '/wizard/techfreedom' },
  { label: 'Services', path: '/wizard/services' },
  { label: 'Systems', path: '/wizard/services/systems' },
  { label: 'Functions', path: '/wizard/services/functions' },
  { label: 'Data', path: '/wizard/services/data' },
  { label: 'Integrations', path: '/wizard/services/integrations' },
  { label: 'Owners', path: '/wizard/services/owners' },
  { label: 'Review', path: '/wizard/services/review' },
];

function StepCircle({ isComplete, isCurrent, index }: { isComplete: boolean; isCurrent: boolean; index: number }) {
  return (
    <span
      className={`
        flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
        transition-colors duration-150
        ${isComplete ? 'bg-primary-600 text-white' : ''}
        ${isCurrent ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500' : ''}
        ${!isComplete && !isCurrent ? 'bg-surface-200 text-surface-400' : ''}
      `}
      aria-hidden="true"
    >
      {isComplete ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        index + 1
      )}
    </span>
  );
}

function StepLabel({ label, isComplete, isCurrent }: { label: string; isComplete: boolean; isCurrent: boolean }) {
  return (
    <span
      className={`
        text-sm font-medium whitespace-nowrap
        ${isCurrent ? 'text-primary-800' : ''}
        ${isComplete ? 'text-primary-600' : ''}
        ${!isComplete && !isCurrent ? 'text-surface-400' : ''}
      `}
      aria-current={isCurrent ? 'step' : undefined}
    >
      {label}
    </span>
  );
}

export function Stepper() {
  const pathname = usePathname();
  const steps = pathname.startsWith('/wizard/services') ? SERVICE_FIRST_STEPS : FUNCTION_FIRST_STEPS;
  const currentIndex = steps.findIndex((s) => s.path === pathname);

  return (
    <nav aria-label="Wizard progress" className="w-full max-w-3xl mx-auto px-4 py-6">
      {/* Mobile compact view */}
      <div className="sm:hidden flex items-center justify-between px-2">
        {currentIndex > 0 ? (
          <Link
            href={steps[currentIndex - 1].path}
            className="p-2 text-primary-600 text-sm hover:underline"
            aria-label={`Previous step: ${steps[currentIndex - 1].label}`}
          >
            &larr; {steps[currentIndex - 1].label}
          </Link>
        ) : (
          <span />
        )}
        <span className="text-sm font-medium text-primary-700 font-body">
          {currentIndex >= 0 ? steps[currentIndex].label : ''} ({currentIndex + 1}/{steps.length})
        </span>
        {currentIndex < steps.length - 1 && currentIndex >= 0 ? (
          <Link
            href={steps[currentIndex + 1].path}
            className="p-2 text-primary-600 text-sm hover:underline"
            aria-label={`Next step: ${steps[currentIndex + 1].label}`}
          >
            {steps[currentIndex + 1].label} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>
      <ol className="hidden sm:flex items-center gap-2" role="list">
        {steps.map((step, index) => {
          const isComplete = currentIndex > index;
          const isCurrent = currentIndex === index;

          return (
            <li
              key={step.path}
              className="flex items-center gap-2 flex-1 last:flex-none"
            >
              {isComplete ? (
                <Link
                  href={step.path}
                  className="flex items-center gap-2 min-h-[44px] hover:opacity-80 transition-opacity"
                >
                  <StepCircle isComplete={isComplete} isCurrent={isCurrent} index={index} />
                  <StepLabel label={step.label} isComplete={isComplete} isCurrent={isCurrent} />
                </Link>
              ) : (
                <div className="flex items-center gap-2 min-h-[44px]">
                  <StepCircle isComplete={isComplete} isCurrent={isCurrent} index={index} />
                  <StepLabel label={step.label} isComplete={isComplete} isCurrent={isCurrent} />
                </div>
              )}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2
                    ${isComplete ? 'bg-primary-500' : 'bg-surface-200'}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
