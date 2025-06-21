/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';
import { useInput, UseInputProps } from './use-input';

describe('useInput', () => {
  const defaultProps: UseInputProps = {
    onValueChange: jest.fn(),
    onClear: jest.fn(),
  };

  it('should initialize with default value', () => {
    const { result } = renderHook(() =>
      useInput({ ...defaultProps, defaultValue: 'test' }),
    );
    expect(result.current.getInputProps().value).toBe('test');
  });

  it('should accept an undefined onValueChange prop', () => {
    const { result } = renderHook(() =>
      useInput({ ...defaultProps, onValueChange: undefined }),
    );

    act(() => {
      result.current
        .getInputProps()
        .onChange?.({
          target: { value: 'new value' },
        } as unknown as ChangeEvent<HTMLInputElement>);
    });
  });

  it('should call onValueChange when value changes', () => {
    const onValueChange = jest.fn();
    const { result } = renderHook(() =>
      useInput({ ...defaultProps, onValueChange }),
    );

    act(() => {
      result.current
        .getInputProps()
        .onChange?.({
          target: { value: 'new value' },
        } as unknown as ChangeEvent<HTMLInputElement>);
    });

    expect(onValueChange).toHaveBeenCalledWith('new value');
  });

  it('should use an empty string as default value when onValueChange is called with undefined', () => {
    const { result } = renderHook(() =>
      useInput({ ...defaultProps, value: 'test' }),
    );

    act(() => {
      result.current
        .getInputProps()
        .onChange?.({
          target: { value: undefined },
        } as unknown as ChangeEvent<HTMLInputElement>);
    });

    expect(defaultProps.onValueChange).toHaveBeenCalledWith('');
  });

  it('should preserve the type setting', () => {
    const { result } = renderHook(() =>
      useInput({ ...defaultProps, type: 'password' }),
    );

    expect(result.current.getInputProps().type).toBe('password');
  });

  it('should ignore type setting when isMultiline is true', () => {
    const { result } = renderHook(() =>
      useInput({ ...defaultProps, isMultiline: true, type: 'password' }),
    );

    expect(result.current.getInputProps().type).toBe(undefined);
  });
});
