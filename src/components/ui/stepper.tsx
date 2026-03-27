'use client';

export interface StepperStep {
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Progress">
      {/* Mobile compact view */}
      <p className="sm:hidden text-sm font-medium text-primary-700 font-body text-center" aria-hidden="true">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.label}
      </p>
      <ol role="list" className="hidden sm:flex sm:flex-row sm:items-center gap-2 sm:gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          const isClickable = isCompleted && !!onStepClick;

          return (
            <li
              key={step.label}
              className="flex items-center sm:flex-1"
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Connector line (not for first step) */}
              {index > 0 && (
                <div
                  className={[
                    'hidden sm:block h-0.5 flex-1 mx-2',
                    isCompleted || isCurrent ? 'bg-primary-500' : 'bg-surface-300',
                  ].join(' ')}
                  aria-hidden="true"
                />
              )}

              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(index)}
                  className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg min-h-[44px] min-w-[44px] px-2 py-1"
                >
                  <StepIndicator
                    index={index}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isUpcoming={isUpcoming}
                  />
                  <StepLabel
                    step={step}
                    isCurrent={isCurrent}
                    isUpcoming={isUpcoming}
                    isClickable={isClickable}
                  />
                </button>
              ) : (
                <span className="flex items-center gap-2 min-h-[44px] px-2 py-1">
                  <StepIndicator
                    index={index}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isUpcoming={isUpcoming}
                  />
                  <StepLabel
                    step={step}
                    isCurrent={isCurrent}
                    isUpcoming={isUpcoming}
                    isClickable={false}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepIndicator({
  index,
  isCompleted,
  isCurrent,
  isUpcoming,
}: {
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
}) {
  const baseClasses = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium';

  if (isCompleted) {
    return (
      <span className={`${baseClasses} bg-primary-600 text-white`} aria-hidden="true">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  if (isCurrent) {
    return (
      <span className={`${baseClasses} border-2 border-primary-600 bg-white text-primary-600`} aria-hidden="true">
        {index + 1}
      </span>
    );
  }

  return (
    <span
      className={`${baseClasses} border-2 border-surface-300 bg-white text-primary-400`}
      aria-hidden="true"
    >
      {index + 1}
    </span>
  );
}

function StepLabel({
  step,
  isCurrent,
  isUpcoming,
  isClickable,
}: {
  step: StepperStep;
  isCurrent: boolean;
  isUpcoming: boolean;
  isClickable: boolean;
}) {
  return (
    <span className="flex flex-col min-w-0">
      <span
        className={[
          'text-sm font-medium font-body truncate',
          isCurrent
            ? 'text-primary-800'
            : isUpcoming
              ? 'text-primary-400'
              : 'text-primary-700',
          isClickable ? 'group-hover:text-primary-600 group-hover:underline' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {step.label}
      </span>
      {step.description && (
        <span className="text-xs text-primary-500 font-body truncate">{step.description}</span>
      )}
    </span>
  );
}
