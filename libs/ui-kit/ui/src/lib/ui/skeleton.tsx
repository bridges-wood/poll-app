'use client';

import { cn } from '@org/ui-kit/util';
import { ComponentRef, forwardRef, HTMLAttributes } from 'react';

const Skeleton = forwardRef<
  ComponentRef<'div'>,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('bg-background-muted animate-pulse rounded-md', className)}
      {...props}
      data-testid="skeleton"
    />
  );
});

export { Skeleton };
