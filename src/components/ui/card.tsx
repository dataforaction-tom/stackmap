import { forwardRef, type HTMLAttributes, type AnchorHTMLAttributes } from 'react';

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
} as const;

type CardPadding = keyof typeof paddingStyles;

interface CardBaseProps {
  padding?: CardPadding;
  heading?: string;
  headingLevel?: 'h2' | 'h3' | 'h4';
}

export type CardStaticProps = CardBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof CardBaseProps> & {
    interactive?: false;
    href?: never;
  };

export type CardInteractiveProps = CardBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CardBaseProps> & {
    interactive: true;
    href: string;
  };

export type CardProps = CardStaticProps | CardInteractiveProps;

export const Card = forwardRef<HTMLDivElement | HTMLAnchorElement, CardProps>(function Card(
  props,
  ref,
) {
  const {
    padding = 'md',
    heading,
    headingLevel: HeadingTag = 'h3',
    children,
    className = '',
    ...rest
  } = props;

  const baseClasses = [
    'rounded-xl border border-surface-300 bg-white',
    paddingStyles[padding],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {heading && (
        <HeadingTag className="font-display text-lg font-semibold text-primary-900 mb-2">
          {heading}
        </HeadingTag>
      )}
      {children}
    </>
  );

  if (props.interactive) {
    const { interactive: _, heading: _h, headingLevel: _hl, padding: _p, className: _c, ...anchorProps } =
      rest as Omit<CardInteractiveProps, 'children'>;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={[
          baseClasses,
          'block cursor-pointer transition-shadow duration-150',
          'hover:shadow-md hover:border-primary-300',
          'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        ].join(' ')}
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  const { interactive: _, heading: _h, headingLevel: _hl, padding: _p, className: _c, ...divProps } =
    rest as Omit<CardStaticProps, 'children'>;
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={baseClasses} {...divProps}>
      {content}
    </div>
  );
});
