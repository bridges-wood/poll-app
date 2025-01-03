import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { createContext } from './context';

describe('createContext', () => {
  it('should throw an error if context is undefined and strict mode is true', () => {
    const [, useContext] = createContext<{ value: string }>({
      strict: true,
      errorMessage: 'Custom error message',
    });

    renderHook(() =>
      expect(() => useContext()).toThrow('Custom error message'),
    );
  });

  it('should not throw an error if context is undefined and strict mode is false', () => {
    const [, useContext] = createContext<{ value: string }>({
      strict: false,
    });

    const { result } = renderHook(() => useContext());

    expect(result.current).toBeUndefined();
  });

  it('should provide context value when wrapped in Provider', () => {
    const [Provider, useContext] = createContext<{ value: string }>({
      strict: true,
    });

    const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
      <Provider value={{ value: 'test' }}>{children}</Provider>
    );

    const { result } = renderHook(() => useContext(), { wrapper });

    expect(result.current).toEqual({ value: 'test' });
  });

  it('should set the display name of the context', () => {
    const [, , Context] = createContext<{ value: string }>({
      name: 'TestContext',
    });

    expect(Context.displayName).toBe('TestContext');
  });

  it('should accept default options', () => {
    const [, useContext, Context] = createContext<{ value: string }>();

    expect(Context.displayName).toBeUndefined();
    renderHook(() =>
      expect(() => useContext()).toThrow(
        'useContext: `context` is undefined. Seems you forgot to wrap component within the Provider',
      ),
    );
  });
});
