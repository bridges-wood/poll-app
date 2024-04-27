import { forwardRef, useDOMRef } from '../../utils';
import { clsx } from '../../utils/clsx';
import { dataAttr } from '../../utils/functions';
import { HTMLProps } from '../../utils/types';
import { useNavbarContext } from './navbar-context';

export interface NavbarItemProps extends HTMLProps<'li'> {
  children?: React.ReactNode;
  /**
   * Whether the item is active or not.
   * @default false
   */
  isActive?: boolean;
}

const NavbarItem = forwardRef<'li', NavbarItemProps>((props, ref) => {
  const { as, className, children, isActive, ...otherProps } = props;

  const Component = as || 'li';
  const domRef = useDOMRef(ref);

  const { slots, classNames } = useNavbarContext();

  const styles = clsx(classNames?.item, className);

  return (
    <Component
      ref={domRef}
      className={slots.item?.({ class: styles })}
      data-active={dataAttr(isActive)}
      {...otherProps}
    >
      {children}
    </Component>
  );
});

NavbarItem.displayName = 'NextUI.NavbarItem';

export default NavbarItem;
