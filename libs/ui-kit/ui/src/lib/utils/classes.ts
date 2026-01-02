/**
 * focus classNames when the element is focused by keyboard.
 */
export const focusVisibleClasses = [
  'focus-visible:z-10',
  'focus-visible:outline-2',
  'focus-visible:outline-focus',
  'focus-visible:outline-offset-2',
];

export const dataFocusVisibleClasses = [
  'outline-hidden',
  'data-[focus-visible=true]:z-10',
  'data-[focus-visible=true]:outline-1',
  'data-[focus-visible=true]:outline-ring',
  'data-[focus-visible=true]:outline-offset-[-6px]',
];

export const groupDataFocusVisibleClasses = [
  'outline-hidden',
  'group-data-[focus-visible=true]:z-10',
  'group-data-[focus-visible=true]:ring-2',
  'group-data-[focus-visible=true]:ring-focus',
  'group-data-[focus-visible=true]:ring-offset-2',
  'group-data-[focus-visible=true]:ring-offset-background',
];

export const ringClasses = [
  'outline-hidden',
  'ring-2',
  'ring-focus',
  'ring-offset-2',
  'ring-offset-background',
];

/**
 * This classes centers the element by using absolute positioning.
 */
export const translateCenterClasses = [
  'absolute',
  'top-1/2',
  'left-1/2',
  '-translate-x-1/2',
  '-translate-y-1/2',
];

export const absoluteFullClasses = ['absolute', 'inset-0'];
