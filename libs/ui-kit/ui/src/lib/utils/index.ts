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
  OmitKeys extends keyof any = never,
>(
  component: React.ForwardRefRenderFunction<
    any,
    RightJoinProps<PropsOf<Component>, Props> & {
      as?: As;
    }
  >,
) {
  return baseForwardRef(component) as InternalForwardRefRenderFunction<
    Component,
    Props,
    OmitKeys
  >;
}

export const mapPropsVariants = <
  T extends Record<string, any>,
  K extends keyof T,
>(
  props: T,
  variantKeys?: K[],
  removeVariantProps = true,
): readonly [Omit<T, K> | T, Pick<T, K> | {}] => {
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

  useImperativeHandle(ref, () => domRef.current);

  return domRef;
};
