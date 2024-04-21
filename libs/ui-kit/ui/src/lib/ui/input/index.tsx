'use client';

import { CrossCircledIcon } from '@radix-ui/react-icons';
import { useMemo } from 'react';
import { forwardRef } from '../../utils';
import { UseInputProps, useInput } from './use-input';

export interface InputProps extends Omit<UseInputProps, 'isMultiLine'> {}

const Input = forwardRef<'input', InputProps>((props, ref) => {
  const {
    Component,
    isClearable,
    startContent,
    endContent,
    getBaseProps,
    getInputProps,
    getInnerWrapperProps,
    getClearButtonProps,
  } = useInput({ ...props, ref });

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
          <input {...getInputProps()} />
          {end}
        </div>
      );
    }

    return (
      <div {...getInnerWrapperProps()}>
        <input {...getInputProps()} />
      </div>
    );
  }, [startContent, end, getInnerWrapperProps, getInputProps]);

  return <Component {...getBaseProps()}>{innerWrapper}</Component>;
});
Input.displayName = 'Input';

export { Input };
