import { render } from '@testing-library/react';
import { NavbarProvider, useNavbarContext } from './navbar-context';
import { UseNavbarReturn } from './use-navbar';

describe('NavbarContext', () => {
  it('should throw error if useNavbarContext is used outside of NavbarProvider', () => {
    const TestComponent = () => {
      useNavbarContext();
      return <div />;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useNavbarContext: `context` is undefined. Seems you forgot to wrap component within the Provider',
    );
  });

  it('should not throw error if useNavbarContext is used within NavbarProvider', () => {
    const TestComponent = () => {
      useNavbarContext();
      return <div />;
    };

    expect(() =>
      render(
        <NavbarProvider value={{ height: 1 } as UseNavbarReturn}>
          <TestComponent />
        </NavbarProvider>,
      ),
    ).not.toThrow();
  });
});
