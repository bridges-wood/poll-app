import { mergeProps } from '@react-aria/utils';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { forwardRef } from '../../utils';
import { pickChildren } from '../../utils/children';
import { NavbarProvider } from './navbar-context';
import NavbarMenu from './navbar-menu';
import { hideOnScrollVariants } from './navbar-transitions';
import { UseNavbarProps, useNavbar } from './use-navbar';

export interface NavbarProps extends Omit<UseNavbarProps, 'hideOnScroll'> {
  children?: React.ReactNode | React.ReactNode[];
}

const Navbar = forwardRef<'div', NavbarProps>((props, ref) => {
  const { children, ...otherProps } = props;

  const context = useNavbar({ ...otherProps, ref });

  const Component = context.Component;

  const [childrenWithoutMenu, menu] = pickChildren(children, NavbarMenu);

  const content = (
    <>
      <header {...context.getWrapperProps()}>{childrenWithoutMenu}</header>
      {menu}
    </>
  );

  return (
    <NavbarProvider value={context}>
      {context.shouldHideOnScroll ? (
        <LazyMotion features={domAnimation}>
          <m.nav
            animate={context.isHidden ? 'hidden' : 'visible'}
            initial={false}
            variants={hideOnScrollVariants}
            {...mergeProps(context.getBaseProps(), context.motionProps)}
          >
            {content}
          </m.nav>
        </LazyMotion>
      ) : (
        <Component {...context.getBaseProps()}>{content}</Component>
      )}
    </NavbarProvider>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
