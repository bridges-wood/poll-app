import { render, screen, fireEvent } from '@testing-library/react';
import NavbarMenuToggle, { NavbarMenuToggleProps } from './navbar-menu-toggle';
import { useNavbarContext } from './navbar-context';

jest.mock('./navbar-context', () => ({
  useNavbarContext: jest.fn(),
}));

const mockUseNavbarContext = useNavbarContext as jest.Mock;

describe('NavbarMenuToggle', () => {
  const defaultProps: NavbarMenuToggleProps = {
    icon: <span>Icon</span>,
  };

  beforeEach(() => {
    mockUseNavbarContext.mockReturnValue({
      slots: {
        toggle: jest.fn(),
        toggleIcon: jest.fn(),
        srOnly: jest.fn(),
      },
      classNames: {
        toggle: 'toggle-class',
        toggleIcon: 'toggle-icon-class',
      },
      isMenuOpen: false,
      setIsMenuOpen: jest.fn(),
    });
  });

  it('should render the toggle button', () => {
    render(<NavbarMenuToggle {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should display the icon', () => {
    render(<NavbarMenuToggle {...defaultProps} />);
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('should display function icons', () => {
    const icon = (isOpen: boolean) => (isOpen ? <span>Close</span> : <span>Open</span>);
    render(<NavbarMenuToggle {...defaultProps} icon={icon} />);
    expect(screen.getByText('Open')).toBeInTheDocument()
  });

  

  it('should call setIsMenuOpen when clicked', () => {
    const setIsMenuOpen = jest.fn();
    mockUseNavbarContext.mockReturnValueOnce({
      ...mockUseNavbarContext(),
      setIsMenuOpen,
    });

    render(<NavbarMenuToggle {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(setIsMenuOpen).toHaveBeenCalledWith(true);
  });

  it('should display the correct aria-label when menu is open', () => {
    mockUseNavbarContext.mockReturnValueOnce({
      ...mockUseNavbarContext(),
      isMenuOpen: true,
    });

    render(<NavbarMenuToggle {...defaultProps} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close menu');
  });

  it('should display the correct aria-label when menu is closed', () => {
    render(<NavbarMenuToggle {...defaultProps} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Open menu');
  });

  it('should display custom srOnlyText when provided', () => {
    render(<NavbarMenuToggle {...defaultProps} srOnlyText="Custom text" />);
    expect(screen.getByText('Custom text')).toBeInTheDocument();
  });
});