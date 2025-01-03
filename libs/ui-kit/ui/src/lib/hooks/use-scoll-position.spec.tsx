import { renderHook } from '@testing-library/react';
import {
  useScrollPosition,
  UseScrollPositionOptions,
} from './use-scroll-position';

describe('useScrollPosition', () => {
  const mockCallback = jest.fn();

  const setup = (options: UseScrollPositionOptions) => {
    return renderHook(() => useScrollPosition(options));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  it('should return initial scroll position', () => {
    const { result } = setup({ isEnabled: true });
    expect(result.current.current).toEqual({ x: 0, y: 0 });
  });

  it('should update result when scroll position changes', async () => {
    const { result } = setup({ isEnabled: true });

    window.scrollX = 100;
    window.scrollY = 200;
    window.dispatchEvent(new Event('scroll'));

    expect(result.current.current).toEqual({ x: 100, y: 200 });
  });

  it('should call callback with updated scroll position', async () => {
    const { result } = setup({ isEnabled: true, callback: mockCallback });

    window.scrollX = 100;
    window.scrollY = 200;
    window.dispatchEvent(new Event('scroll'));

    expect(mockCallback).toHaveBeenCalledWith({
      prevPos: { x: 0, y: 0 },
      currPos: { x: 100, y: 200 },
    });
    expect(result.current.current).toEqual({ x: 100, y: 200 });
  });

  it('should always return 0,0 if the hook is not running in the browser', () => {
    const { window } = global;
    const { result } = renderHook(() => {
      // @ts-expect-error - delete window property
      delete global.window;
      return useScrollPosition({ isEnabled: true, callback: mockCallback });
    });

    expect(result.current.current).toEqual({ x: 0, y: 0 });

    global.window = window;
  });

  it('should not track scroll position when isEnabled is false', () => {
    const { result } = setup({ isEnabled: false, callback: mockCallback });

    window.scrollX = 100;
    window.scrollY = 200;
    window.dispatchEvent(new Event('scroll'));

    expect(mockCallback).not.toHaveBeenCalled();
    expect(result.current.current).toEqual({ x: 0, y: 0 });
  });

  it('should throttle the scroll event handler', () => {
    jest.useFakeTimers();
    const { result } = setup({
      isEnabled: true,
      callback: mockCallback,
      delay: 100,
    });

    window.scrollX = 100;
    window.scrollY = 200;
    window.dispatchEvent(new Event('scroll'));

    expect(mockCallback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(mockCallback).toHaveBeenCalledWith({
      prevPos: { x: 0, y: 0 },
      currPos: { x: 100, y: 200 },
    });
    expect(result.current.current).toEqual({ x: 100, y: 200 });

    jest.useRealTimers();
  });

  it('should only return the latest scroll position when throttling', () => {
    jest.useFakeTimers();
    const { result } = setup({
      isEnabled: true,
      callback: mockCallback,
      delay: 100,
    });

    window.scrollX = 100;
    window.scrollY = 200;
    window.dispatchEvent(new Event('scroll'));

    window.scrollX = 200;
    window.scrollY = 300;
    window.dispatchEvent(new Event('scroll'));

    jest.advanceTimersByTime(100);

    expect(mockCallback).toHaveBeenCalledWith({
      prevPos: { x: 0, y: 0 },
      currPos: { x: 200, y: 300 },
    });
    expect(result.current.current).toEqual({ x: 200, y: 300 });

    jest.useRealTimers();
  });

  it('should track scroll position of a specific element', () => {
    const element = document.createElement('div');
    element.scrollTop = 50;
    element.scrollLeft = 50;
    const elementRef = { current: element };

    const { result } = setup({
      isEnabled: true,
      elementRef,
      callback: mockCallback,
    });

    element.scrollTop = 100;
    element.scrollLeft = 100;
    element.dispatchEvent(new Event('scroll'));

    expect(mockCallback).toHaveBeenCalledWith({
      prevPos: { x: 50, y: 50 },
      currPos: { x: 100, y: 100 },
    });
    expect(result.current.current).toEqual({ x: 100, y: 100 });
  });
});
