import { render } from '@testing-library/react';
import Navbar from './navbar';
import NavbarContent from './navbar-content';

describe('NavbarContent', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <Navbar>
        <NavbarContent>
          <li>Item 1</li>
          <li>Item 2</li>
        </NavbarContent>
      </Navbar>,
    );

    expect(getByText('Item 1')).toBeInTheDocument();
    expect(getByText('Item 2')).toBeInTheDocument();
  });

  it('should apply justify class correctly', () => {
    const { getByRole } = render(
      <Navbar>
        <NavbarContent justify="end">
          <li>Item 1</li>
        </NavbarContent>
      </Navbar>,
    );

    const ulElement = getByRole('list');
    expect(ulElement).toHaveAttribute('data-justify', 'end');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Navbar>
        <NavbarContent className="custom-class">
          <li>Item 1</li>
        </NavbarContent>
      </Navbar>,
    );

    const ulElement = container.querySelector('ul');
    expect(ulElement).toHaveClass('custom-class');
  });

  it('should use default justify value', () => {
    const { getByRole } = render(
      <Navbar>
        <NavbarContent>
          <li>Item 1</li>
        </NavbarContent>
      </Navbar>,
    );

    const ulElement = getByRole('list');
    expect(ulElement).toHaveAttribute('data-justify', 'start');
  });
});
