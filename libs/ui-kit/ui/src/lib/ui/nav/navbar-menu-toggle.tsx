import { Toggle, ToggleProps } from '@radix-ui/react-toggle';
import { mergeProps } from '@react-aria/utils';
import { ReactNode, useMemo } from 'react';
import { forwardRef, useDOMRef } from '../../utils';
import { clsx } from '../../utils/clsx';
import { dataAttr } from '../../utils/functions';
import { HTMLProps } from '../../utils/types';
import { useNavbarContext } from './navbar-context';

export interface Props extends Omit<HTMLProps<'button'>, keyof ToggleProps> {
  /**
   * The value of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: string;
  /**
   * Text to display for screen readers.
   * @default open/close navigation menu
   */
  srOnlyText?: string;
  /**
   * The icon to display.
   */
  icon?: ReactNode | ((isOpen: boolean) => ReactNode) | null;
}

export type NavbarMenuToggleProps = Props & ToggleProps;

const NavbarMenuToggle = forwardRef<'button', NavbarMenuToggleProps>(
  (props, ref) => {
    const {
      as,
      icon,
      className,
      onChange,
      autoFocus,
      srOnlyText: srOnlyTextProp,
      ...otherProps
    } = props;
    const domRef = useDOMRef<HTMLButtonElement>(ref);

    const { slots, classNames, isMenuOpen, setIsMenuOpen } = useNavbarContext();

    const handleChange = (isOpen: boolean) => {
      setIsMenuOpen(isOpen);
    };

    const toggleStyles = clsx(classNames?.toggle, className);

    const child = useMemo(() => {
      if (typeof icon === 'function') {
        return icon(isMenuOpen);
      }

      return (
        icon || (
          <span
            className={slots.toggleIcon({ class: classNames?.toggleIcon })}
          />
        )
      );
    }, [icon, slots, classNames?.toggleIcon, isMenuOpen]);

    const srOnlyText = useMemo(() => {
      if (srOnlyTextProp) {
        return srOnlyTextProp;
      }

      return isMenuOpen ? 'close navigation menu' : 'open navigation menu';
    }, [srOnlyTextProp, isMenuOpen]);

    return (
      <Toggle
        ref={domRef}
        className={slots.toggle?.({ class: toggleStyles })}
        data-open={dataAttr(isMenuOpen)}
        onPressedChange={handleChange}
        pressed={isMenuOpen}
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        {...mergeProps(otherProps)}
      >
        <span className={slots.srOnly()}>{srOnlyText}</span>
        {child}
      </Toggle>
    );
  },
);

NavbarMenuToggle.displayName = 'NextUI.NavbarMenuToggle';

export default NavbarMenuToggle;
