import { omit, pick } from 'lodash';
import {
  Ref,
  RefObject,
  forwardRef as baseForwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  As,
  InternalForwardRefRenderFunction,
  PropsOf,
  RightJoinProps,
} from './types';

export function forwardRef<
  Component extends As,
  Props extends object,
  OmitKeys extends keyof never = never,
>(
  component: React.ForwardRefRenderFunction<
    never,
    RightJoinProps<PropsOf<Component>, Props> & {
      as?: As;
    }
  >,
) {
  // @ts-expect-error Types of property 'as' are incompatible.
  return baseForwardRef(component) as InternalForwardRefRenderFunction<
    Component,
    Props,
    OmitKeys
  >;
}

export const mapPropsVariants = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
  K extends keyof T,
>(
  props: T,
  variantKeys?: K[],
  removeVariantProps = true,
): readonly [Omit<T, K> | T, Pick<T, K> | object] => {
  if (!variantKeys) {
    return [props, {}];
  }

  const picked = pick(props, variantKeys);

  if (removeVariantProps) {
    const omitted = omit(props, variantKeys);

    return [omitted, picked];
  } else {
    return [props, picked];
  }
};

export const useDOMRef = <T extends HTMLElement = HTMLElement>(
  ref?: RefObject<T | null> | Ref<T | null>,
) => {
  const domRef = useRef<T>(null);

  useImperativeHandle(ref, () => domRef.current as T);

  return domRef;
};
