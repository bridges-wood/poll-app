import { render } from '@testing-library/react';
import Navbar from './navbar';
import NavbarBrand from './navbar-brand';

describe('NavbarBrand', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <Navbar>
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    );
    expect(container).toBeInTheDocument();
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    );
    expect(getByText('Brand')).toBeInTheDocument();
  });

  it('should apply custom class names', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarBrand className="custom-class">Brand</NavbarBrand>
      </Navbar>,
    );
    expect(getByText('Brand')).toHaveClass('custom-class');
  });

  it('should use the correct component type', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarBrand as="span">Brand</NavbarBrand>
      </Navbar>,
    );

    expect(getByText('Brand').nodeName).toBe('SPAN');
  });
});
