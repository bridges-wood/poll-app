import React from 'react';

type SpinnerProps = React.ComponentPropsWithoutRef<'span'>;

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  (props, ref) => {
    return (
      <span
        ref={ref}
        className="border-border-accent-emphasis inline-block h-6 w-6 animate-spin rounded-full border-2"
        {...props}
      />
    );
  },
);
Spinner.displayName = 'Spinner';

export { Spinner };
