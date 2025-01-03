import { render } from '@testing-library/react';
import Navbar from './navbar';
import NavbarItem from './navbar-item';

describe('NavbarItem', () => {
  it('should render without crashing', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarItem>Home</NavbarItem>
      </Navbar>,
    );
    expect(getByText('Home')).toBeInTheDocument();
  });

  it('should apply active class when isActive is true', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarItem isActive>Home</NavbarItem>
      </Navbar>,
    );
    expect(getByText('Home')).toHaveAttribute('data-active', 'true');
  });

  it('should not apply active class when isActive is false', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarItem isActive={false}>Home</NavbarItem>
      </Navbar>,
    );
    expect(getByText('Home')).not.toHaveAttribute('data-active');
  });

  it('should render custom component if "as" prop is provided', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarItem as="div">Home</NavbarItem>
      </Navbar>,
    );
    expect(getByText('Home').tagName).toBe('DIV');
  });

  it('should apply custom className', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarItem className="custom-class">Home</NavbarItem>
      </Navbar>,
    );
    expect(getByText('Home')).toHaveClass('custom-class');
  });
});
