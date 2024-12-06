'use client';

import { CrossCircledIcon } from '@radix-ui/react-icons';
import { useMemo } from 'react';
import { forwardRef } from '../../utils';
import { Skeleton } from '../skeleton';
import { UseInputProps, useInput } from './use-input';

export type InputProps = Omit<UseInputProps, 'isMultiLine'>;

const Input = forwardRef<'input', InputProps>((props, ref) => {
  const {
    Component,
    isClearable,
    startContent,
    endContent,
    skeleton,
    getBaseProps,
    getInputProps,
    getInnerWrapperProps,
    getClearButtonProps,
  } = useInput({ ...props, ref });

  const input = useMemo(() => {
    if (skeleton) {
      return (
        <Skeleton
          {...getInputProps()}
          ref={null} // Remove ref from skeleton
          className="h-6 w-full rounded-full data-[has-end-content=true]:me-1.5 data-[has-start-content=true]:ms-1.5"
        />
      );
    }

    return <input {...getInputProps()} />;
  }, [skeleton, getInputProps]);

  const end = useMemo(() => {
    if (isClearable) {
      return (
        <span {...getClearButtonProps()}>
          {endContent || <CrossCircledIcon />}
        </span>
      );
    }

    return endContent;
  }, [isClearable, getClearButtonProps]);

  const innerWrapper = useMemo(() => {
    if (startContent || end) {
      return (
        <div {...getInnerWrapperProps()}>
          {startContent}
          {input}
          {end}
        </div>
      );
    }

    return <div {...getInnerWrapperProps()}>{input}</div>;
  }, [startContent, end, getInnerWrapperProps, getInputProps]);

  return <Component {...getBaseProps()}>{innerWrapper}</Component>;
});
Input.displayName = 'Input';

export { Input };
