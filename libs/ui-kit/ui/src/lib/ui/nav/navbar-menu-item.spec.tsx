import { render } from '@testing-library/react';
import { act, Ref } from 'react';
import Navbar from './navbar';
import NavbarMenu from './navbar-menu';
import NavbarMenuItem from './navbar-menu-item';
import NavbarMenuToggle from './navbar-menu-toggle';

describe('Navbar menu item', () => {
  it('should render correctly', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarMenuItem>Item 1</NavbarMenuItem>
      </Navbar>,
    );
    expect(getByText('Item 1')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarMenuItem className="custom-class">Item 2</NavbarMenuItem>
      </Navbar>,
    );
    expect(getByText('Item 2')).toHaveClass('custom-class');
  });

  it('should set data-active attribute when isActive is true', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarMenuItem isActive>Item 3</NavbarMenuItem>
      </Navbar>,
    );
    expect(getByText('Item 3')).toHaveAttribute('data-active', 'true');
  });

  it('should not set data-active attribute when isActive is false', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarMenuItem>Item 4</NavbarMenuItem>
      </Navbar>,
    );
    expect(getByText('Item 4')).not.toHaveAttribute('data-active');
  });

  it('should set data-open attribute when menu is open', () => {
    const { getByText, getByTestId } = render(
      <Navbar>
        <NavbarMenuToggle data-testid="toggle" />
        <NavbarMenu>
          <NavbarMenuItem>Item 5</NavbarMenuItem>
        </NavbarMenu>
      </Navbar>,
    );

    act(() => getByTestId('toggle').click());
    expect(getByText('Item 5')).toHaveAttribute('data-open', 'true');
  });

  it('should not set data-open attribute when menu is closed', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarMenuItem>Item 6</NavbarMenuItem>
      </Navbar>,
    );
    expect(getByText('Item 6')).not.toHaveAttribute('data-open');
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarMenuItem>
          <span>Item 7</span>
        </NavbarMenuItem>
      </Navbar>,
    );
    expect(getByText('Item 7')).toBeInTheDocument();
  });

  
});
