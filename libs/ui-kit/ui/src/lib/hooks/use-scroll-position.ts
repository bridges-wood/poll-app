import { RefObject, useEffect, useRef } from 'react';

const isBrowser = () => typeof window !== 'undefined';

export type ScrollValue = { x: number; y: number };

function getScrollPosition(
  element: HTMLElement | undefined | null,
): ScrollValue {
  if (!isBrowser()) return { x: 0, y: 0 };
  if (!element) {
    return { x: window.scrollX, y: window.scrollY };
  }

  return { x: element.scrollLeft, y: element.scrollTop };
}

export interface UseScrollPositionOptions {
  /**
   * The wait time in milliseconds before triggering the callback.
   */
  delay?: number;
  /**
   * Whether the scroll position should be tracked or not.
   * @default true
   */
  isEnabled?: boolean;
  /**
   * The element to track the scroll position for.
   */
  elementRef?: React.RefObject<HTMLElement> | null;
  /**
   * The callback function to be called when the scroll position changes.
   */
  callback?: ({
    prevPos,
    currPos,
  }: {
    prevPos: ScrollValue;
    currPos: ScrollValue;
  }) => void;
}

/**
 * Returns the current scroll position of the window or a specific element. The scroll position is updated when the user scrolls and the callback is called with the previous and current scroll positions.
 * @param props The options for the scroll position hook.
 * @returns The initial scroll position.
 */
export const useScrollPosition = (
  props: UseScrollPositionOptions,
): RefObject<ScrollValue> => {
  const { elementRef, delay, callback, isEnabled } = props;

  const position = useRef<ScrollValue>(
    isEnabled ? getScrollPosition(elementRef?.current) : { x: 0, y: 0 },
  );

  const throttleTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handler = () => {
    const currPos = getScrollPosition(elementRef?.current);

    if (typeof callback === 'function') {
      callback({ prevPos: position.current, currPos });
    }

    position.current = currPos;
    throttleTimeout.current = undefined;
  };

  useEffect(() => {
    if (!isEnabled || !isBrowser()) return;

    const handleScroll = () => {
      if (delay) {
        if (!throttleTimeout.current) {
          throttleTimeout.current = setTimeout(handler, delay);
        }
      } else {
        handler();
      }
    };

    const target = elementRef?.current || window;

    target.addEventListener('scroll', handleScroll);

    return () => target.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, isEnabled, elementRef]);

  return position;
};
