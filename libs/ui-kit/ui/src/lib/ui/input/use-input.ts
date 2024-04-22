import { useFocusRing } from '@react-aria/focus';
import { useFocusWithin, useHover, usePress } from '@react-aria/interactions';
import { AriaTextFieldOptions, useTextField } from '@react-aria/textfield';
import { chain, mergeProps } from '@react-aria/utils';
import { useControlledState } from '@react-stately/utils';
import { AriaTextFieldProps } from '@react-types/textfield';
import _ from 'lodash';
import { ReactNode, Ref, useCallback, useMemo, useState } from 'react';
import { mapPropsVariants, useDOMRef } from '../../utils';
import { clsx } from '../../utils/clsx';
import { filterDOMProps } from '../../utils/filter-dom-props';
import { dataAttr, objectToDeps } from '../../utils/functions';
import { safeAriaLabel } from '../../utils/text';
import { HTMLProps, PropGetter } from '../../utils/types';
import { SlotsToClasses } from '../theme/utils';
import { InputSlots, InputVariantProps, input } from './styles';

export interface Props<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
> extends Omit<HTMLProps<'input'>, keyof InputVariantProps> {
  /**
   * Ref to the DOM node.
   */
  ref?: Ref<T>;
  /**
   * Ref to the container DOM node.
   */
  baseRef?: Ref<HTMLDivElement>;
  /**
   * Ref to the inner wrapper DOM node.
   * This is the element that wraps the input and the start/end content when passed.
   */
  innerWrapperRef?: Ref<HTMLDivElement>;
  /**
   * Element to be rendered in the left side of the input.
   */
  startContent?: ReactNode;
  /**
   * Element to be rendered in the right side of the input.
   * If you pass this prop and the `onClear` prop, the passed element will have the clear utton props and it will be rendered instead of the default clear button.
   */
  endContent?: ReactNode;
  /**
   * If `true`, the input will be replaced by a skeleton element.
   */
  skeleton?: boolean;
  /**
   * Classname or list of classes to change the classNames of the element.
   * If `className` is passed, it will be added to the base slot.
   *
   * @example
   * ```tsx
   * <Input classNames={{
   *  base: 'base-classes',
   *  mainWrapper: 'main-wrapper-classes',
   *  innerWrapper: 'inner-wrapper-classes',
   *  input: 'input-classes',
   *  clearWrapper: 'clear-wrapper-classes',
   * }} />
   * ```
   */
  classnames?: SlotsToClasses<InputSlots>;
  /**
   * Callback fired when the value is cleared.
   * If you pass this prop, the clear button will be shown.
   */
  onClear?: () => void;
  /**
   * React aria onChange event.
   */
  onValueChange?: (value: string) => void;
}

type AutoCapitalize = AriaTextFieldOptions<'input'>['autoCapitalize'];

export type UseInputProps<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
> = Props<T> &
  Omit<AriaTextFieldProps, 'onChange' | 'validationBehaviour'> &
  InputVariantProps;

export function useInput<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
>(originalProps: UseInputProps<T>) {
  const [props, variantProps] = mapPropsVariants(
    originalProps,
    input.variantKeys,
  );

  const {
    ref,
    as,
    type,
    baseRef,
    className,
    classnames: classNames,
    autoFocus,
    startContent,
    endContent,
    skeleton,
    onClear,
    onChange,
    innerWrapperRef: innerWrapperRefProp,
    onValueChange = () => {},
    ...otherProps
  } = props;

  const handleValueChange = useCallback(
    (value: string | undefined) => {
      onValueChange(value ?? '');
    },
    [onValueChange],
  );

  const [isFocusWithin, setFocusWithin] = useState(false);

  const Component = as || 'div';

  const domRef = useDOMRef<T>(ref);
  const baseDomRef = useDOMRef<HTMLDivElement>(baseRef);
  const innerWrapperRef = useDOMRef<HTMLDivElement>(innerWrapperRefProp);

  const [inputValue, setInputValue] = useControlledState<string | undefined>(
    props.value,
    props.defaultValue ?? '',
    handleValueChange,
  );

  const isFilledByDefault = ['date', 'time', 'month', 'week', 'range'].includes(
    type!,
  );
  const isFilled = !_.isEmpty(inputValue) || isFilledByDefault;
  const isFilledWithin = isFilled || isFocusWithin;
  const baseStyles = clsx(
    classNames?.base,
    className,
    isFilled ? 'is-filled' : '',
  );
  const isMultiline = originalProps.isMultiline;

  const handleClear = useCallback(() => {
    setInputValue('');
    onClear?.();
    domRef.current?.focus();
  }, [setInputValue, onClear]);

  const { inputProps } = useTextField(
    {
      ...originalProps,
      validationBehavior: 'native',
      autoCapitalize: originalProps.autoCapitalize as AutoCapitalize,
      value: domRef?.current?.value ?? inputValue,
      'aria-label': safeAriaLabel(
        originalProps?.['aria-label'],
        originalProps?.label,
        originalProps?.placeholder,
      ),
      inputElementType: isMultiline ? 'textarea' : 'input',
      onChange: setInputValue,
    },
    domRef,
  );

  const { isFocusVisible, isFocused, focusProps } = useFocusRing({
    autoFocus,
    isTextInput: true,
  });

  const { isHovered, hoverProps } = useHover({
    isDisabled: !!originalProps?.isDisabled,
  });

  const {
    focusProps: clearFocusProps,
    isFocusVisible: isClearButtonFocusVisible,
  } = useFocusRing();

  const { focusWithinProps } = useFocusWithin({
    onFocusWithinChange: setFocusWithin,
  });

  const { pressProps: clearPressProps } = usePress({
    isDisabled: !!originalProps?.isDisabled,
    onPress: handleClear,
  });

  const isClearable = !!onClear || originalProps.isClearable;
  const hasPlaceholder = !!props.placeholder;
  const isPlaceholderShown = domRef.current
    ? (!domRef.current.value ||
        domRef.current.value === '' ||
        !inputValue ||
        inputValue === '') &&
      hasPlaceholder
    : false;

  const hasStartContent = !!startContent;

  const slots = useMemo(
    () =>
      input({
        ...variantProps,
        isClearable,
      }),
    [objectToDeps(variantProps), isClearable, hasStartContent],
  );

  const getBaseProps: PropGetter = useCallback(
    (props = {}) => ({
      ref: baseDomRef,
      className: slots.base({ class: baseStyles }),
      'data-slot': 'base',
      'data-filled': dataAttr(
        isFilled || hasPlaceholder || hasStartContent || isPlaceholderShown,
      ),
      'data-filled-within': dataAttr(
        isFilled || hasPlaceholder || hasStartContent || isPlaceholderShown,
      ),
      'data-focus-within': dataAttr(isFocusWithin),
      'data-focus-visible': dataAttr(isFocusVisible),
      'data-readonly': dataAttr(originalProps.isReadOnly),
      'data-focus': dataAttr(isFocused),
      'data-hover': dataAttr(isHovered),
      'data-required': dataAttr(originalProps.isRequired),
      'data-disabled': dataAttr(originalProps.isDisabled),
      'data-has-value': dataAttr(!isPlaceholderShown),
      ...focusWithinProps,
      ...props,
    }),
    [
      slots,
      baseStyles,
      isFilled,
      isFocused,
      isHovered,
      isPlaceholderShown,
      hasStartContent,
      isFocusWithin,
      isFocusVisible,
      isFilledWithin,
      hasPlaceholder,
      focusWithinProps,
      originalProps.readOnly,
      originalProps.isRequired,
      originalProps.isDisabled,
    ],
  );

  const getInputProps: PropGetter = useCallback(
    (props = {}) => ({
      ref: domRef,
      'data-slot': 'input',
      'data-filled': dataAttr(isFilled),
      'data-filled-within': dataAttr(isFilledWithin),
      'data-has-start-content': dataAttr(hasStartContent),
      'data-has-end-content': dataAttr(!!endContent),
      className: slots.input({
        class: clsx(classNames?.input, isFilled ? 'is-filled' : ''),
      }),
      ...mergeProps(
        focusProps,
        inputProps,
        filterDOMProps(otherProps, {
          enabled: true,
          labelable: false,
          omitEventNames: new Set(Object.keys(inputProps)),
        }),
        props,
      ),
      required: originalProps.isRequired,
      'aria-readonly': dataAttr(originalProps.isReadOnly),
      'aria-required': dataAttr(originalProps.isRequired),
      onChange: chain(inputProps.onChange, onChange),
    }),
    [
      slots,
      inputValue,
      focusProps,
      inputProps,
      otherProps,
      isFilled,
      isFilledWithin,
      hasStartContent,
      endContent,
      classNames?.input,
      originalProps.isReadOnly,
      originalProps.isRequired,
      onChange,
    ],
  );

  const getInnerWrapperProps: PropGetter = useCallback(
    (props = {}) => ({
      ...props,
      ref: innerWrapperRef,
      'data-slot': 'inner-wrapper',
      onClick: (e) => {
        if (domRef.current && e.currentTarget === e.target) {
          domRef.current.focus();
        }
      },
      className: slots.innerWrapper({
        class: clsx(classNames?.innerWrapper, props?.className),
      }),
    }),
    [slots, classNames?.innerWrapper],
  );

  const getMainWrapperProps: PropGetter = useCallback(
    (props = {}) => ({
      ...props,
      'data-slot': 'main-wrapper',
      className: slots.mainWrapper({
        class: clsx(classNames?.mainWrapper, props?.className),
      }),
    }),
    [slots, classNames?.mainWrapper],
  );

  const getClearButtonProps: PropGetter = useCallback(
    (props = {}) => ({
      ...props,
      role: 'button',
      tabIndex: 0,
      'data-slot': 'clear-button',
      'data-focus-visible': dataAttr(isClearButtonFocusVisible),
      className: slots.clearButton({
        class: clsx(classNames?.clearButton, props?.className),
      }),
      ...mergeProps(clearPressProps, clearFocusProps),
    }),
    [
      slots,
      isClearButtonFocusVisible,
      clearPressProps,
      clearFocusProps,
      classNames?.clearButton,
    ],
  );

  return {
    Component,
    classNames,
    domRef,
    startContent,
    endContent,
    skeleton,
    isClearable,
    hasStartContent,
    hasPlaceholder,
    getBaseProps,
    getInputProps,
    getMainWrapperProps,
    getInnerWrapperProps,
    getClearButtonProps,
  };
}

export type UseInputReturn = ReturnType<typeof useInput>;
