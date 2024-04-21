import { tv, type VariantProps } from 'tailwind-variants';
import { dataFocusVisibleClasses } from '../../utils/classes';

/**
 * Input wrapper **Tailwind Variants** component.
 */
const input = tv({
  slots: {
    base: 'group flex flex-col h-9 rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors data-[focus=true]:ring-1 data-[focus=true]:ring-ring data-[focus=true]:outline-none',
    mainWrapper: 'h-full',
    inputWrapper:
      'relative w-full inline-flex tap-highlight flex-row items-center px-3 gap-3',
    innerWrapper: 'inline-flex w-full items-center h-full box-border',
    input: [
      'w-full font-normal bg-transparent !outline-none',
      'data-[has-start-content=true]:ps-1.5',
      'data-[has-end-content=true]:pe-1.5',
    ],
    clearButton: [
      'p-2',
      '-m-2',
      'z-10',
      'hidden',
      'absolute',
      'right-2',
      'rtl:right-auto',
      'rtl:left-2',
      'appearance-none',
      'outline-none',
      'select-none',
      'opacity-0',
      'hover:!opacity-100',
      'cursor-pointer',
      'active:!opacity-70',
      'rounded-full',
      // focus ring
      ...dataFocusVisibleClasses,
    ],
  },
  variants: {
    fullWidth: {
      true: {
        base: 'w-full',
      },
    },
    isClearable: {
      true: {
        innerWrapper: 'relative',
        input: 'peer pr-6 rtl:pr-0 rtl:pl-6',
        clearButton:
          'peer-data-[filled=true]:opacity-70 peer-data-[filled=true]:block',
      },
    },
    isDisabled: {
      true: {
        base: 'opacity-disabled pointer-events-none',
        inputWrapper: 'pointer-events-none',
        label: 'pointer-events-none',
      },
    },
    isMultiline: {
      true: {
        label: 'relative',
        inputWrapper: '!h-auto',
        innerWrapper: 'items-start group-data-[has-label=true]:items-start',
        input: 'resize-none data-[hide-scroll=true]:scrollbar-hide',
      },
    },
    disableAnimation: {
      true: {
        input: 'transition-none',
        inputWrapper: 'transition-none',
        label: 'transition-none',
      },
      false: {
        inputWrapper:
          'transition-background motion-reduce:transition-none !duration-150',
        label: [
          'will-change-auto',
          '!duration-200',
          '!ease-out',
          'motion-reduce:transition-none',
          'transition-[transform,color,left,opacity]',
        ],
        clearButton: ['transition-opacity', 'motion-reduce:transition-none'],
      },
    },
  },
  defaultVariants: {
    fullWidth: true,
    isDisabled: false,
    isMultiline: false,
    disableAnimation: false,
  },
  compoundVariants: [
    {
      isMultiline: true,
      disableAnimation: false,
      class: {
        input: 'transition-height !duration-100 motion-reduce:transition-none',
      },
    },
  ],
});

export type InputVariantProps = VariantProps<typeof input>;
export type InputSlots = keyof ReturnType<typeof input>;

export { input };
