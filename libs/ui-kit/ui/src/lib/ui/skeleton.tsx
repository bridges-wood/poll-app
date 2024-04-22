'use client';

import { cn } from '@org/ui-kit/util';
import React from 'react';

const Skeleton = React.forwardRef<
  React.ElementRef<'div'>,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('bg-primary/10 animate-pulse rounded-md', className)}
      {...props}
    />
  );
});

export { Skeleton };
