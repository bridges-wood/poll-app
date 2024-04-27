import { useNavbarContext } from '.';
import { forwardRef, useDOMRef } from '../../utils';
import { clsx } from '../../utils/clsx';
import { HTMLProps } from '../../utils/types';

export interface NavbarBrandProps extends HTMLProps<'div'> {
  children?: React.ReactNode | React.ReactNode[];
}

const NavbarBrand = forwardRef<'div', NavbarBrandProps>((props, ref) => {
  const { as, className, children, ...otherProps } = props;

  const Component = as || 'div';
  const domRef = useDOMRef(ref);

  const { slots, classNames } = useNavbarContext();

  const styles = clsx(classNames?.brand, className);

  return (
    <Component
      ref={domRef}
      className={slots.brand?.({ class: styles })}
      {...otherProps}
    >
      {children}
    </Component>
  );
});

NavbarBrand.displayName = 'NextUI.NavbarBrand';

export default NavbarBrand;
