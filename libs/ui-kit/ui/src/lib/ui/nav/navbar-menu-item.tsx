import { forwardRef, useDOMRef } from '../../utils';
import { clsx } from '../../utils/clsx';
import { dataAttr } from '../../utils/functions';
import { HTMLProps } from '../../utils/types';
import { useNavbarContext } from './navbar-context';

export interface NavbarMenuItemProps extends HTMLProps<'li'> {
  /**
   * Whether the item is active or not.
   * @default false
   */
  isActive?: boolean;
  children?: React.ReactNode;
}

const NavbarMenuItem = forwardRef<'li', NavbarMenuItemProps>((props, ref) => {
  const { className, children, isActive, ...otherProps } = props;

  const domRef = useDOMRef(ref);

  const { slots, isMenuOpen, classNames } = useNavbarContext();

  const styles = clsx(classNames?.menuItem, className);

  return (
    <li
      ref={domRef}
      className={slots.menuItem?.({ class: styles })}
      data-active={dataAttr(isActive)}
      data-open={dataAttr(isMenuOpen)}
      {...otherProps}
    >
      {children}
    </li>
  );
});

NavbarMenuItem.displayName = 'NextUI.NavbarMenuItem';

export default NavbarMenuItem;
