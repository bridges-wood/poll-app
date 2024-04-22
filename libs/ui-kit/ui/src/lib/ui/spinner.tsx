import React from 'react';

interface SpinnerProps extends React.ComponentPropsWithoutRef<'span'> {}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  (props, ref) => {
    return (
      <span
        ref={ref}
        className="border-primary inline-block h-6 w-6 animate-spin rounded-full border-2"
        {...props}
      />
    );
  },
);
Spinner.displayName = 'Spinner';

export { Spinner };
