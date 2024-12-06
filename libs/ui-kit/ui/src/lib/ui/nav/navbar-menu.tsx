import { Overlay } from '@react-aria/overlays';
import { mergeProps } from '@react-aria/utils';
import {
  AnimatePresence,
  domAnimation,
  HTMLMotionProps,
  LazyMotion,
  m,
} from 'framer-motion';
import { ReactElement, useCallback } from 'react';
import { RemoveScroll } from 'react-remove-scroll';

import { forwardRef, useDOMRef } from '../../utils';
import { clsx } from '../../utils/clsx';
import { dataAttr } from '../../utils/functions';
import { HTMLProps } from '../../utils/types';
import { useNavbarContext } from './navbar-context';
import { menuVariants } from './navbar-menu-transitions';

export interface NavbarMenuProps extends HTMLProps<'ul'> {
  children?: React.ReactNode;
  /**
   * The container element in which the navbar menu overlay portal will be placed.
   * @default document.body
   */
  portalContainer?: Element;
  /**
   * The props to modify the framer motion animation. Use the `variants` API to create your own animation.
   */
  motionProps?: HTMLMotionProps<'ul'>;
}

const NavbarMenu = forwardRef<'ul', NavbarMenuProps>((props, ref) => {
  const {
    className,
    children,
    portalContainer,
    motionProps,
    style,
    ...otherProps
  } = props;
  const domRef = useDOMRef(ref);

  const { slots, isMenuOpen, height, disableAnimation, classNames } =
    useNavbarContext();

  const styles = clsx(classNames?.menu, className);

  const MenuWrapper = useCallback(
    ({ children }: { children: ReactElement }) => {
      return (
        <RemoveScroll forwardProps enabled={isMenuOpen} removeScrollBar={false}>
          {children}
        </RemoveScroll>
      );
    },
    [isMenuOpen],
  );

  const contents = disableAnimation ? (
    <MenuWrapper>
      <ul
        ref={domRef}
        className={slots.menu?.({ class: styles })}
        data-open={dataAttr(isMenuOpen)}
        style={{
          // @ts-expect-error navbar-height is a custom property
          '--navbar-height': height,
        }}
        {...otherProps}
      >
        {children}
      </ul>
    </MenuWrapper>
  ) : (
    <AnimatePresence mode="wait">
      {isMenuOpen ? (
        <LazyMotion features={domAnimation}>
          <MenuWrapper>
            <m.ul
              ref={domRef}
              layoutScroll
              animate="enter"
              className={slots.menu?.({ class: styles })}
              data-open={dataAttr(isMenuOpen)}
              exit="exit"
              initial="exit"
              style={{
                // @ts-expect-error navbar-height is a custom property
                '--navbar-height': height,
                ...style,
              }}
              variants={menuVariants}
              {...mergeProps(motionProps, otherProps)}
            >
              {children}
            </m.ul>
          </MenuWrapper>
        </LazyMotion>
      ) : null}
    </AnimatePresence>
  );

  return <Overlay portalContainer={portalContainer}>{contents}</Overlay>;
});

NavbarMenu.displayName = 'NextUI.NavbarMenu';

export default NavbarMenu;
