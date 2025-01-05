import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from './theme-toggle';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('ThemeToggle', () => {
  const renderComponent = () =>
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );

  it('should render the ThemeToggle component', () => {
    renderComponent();
    expect(
      screen.getByRole('button', { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });

  it('should display the SunIcon when theme is light', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /toggle theme/i }));
    await user.click(screen.getByText(/light/i));

    expect(
      screen.getByRole('button', { name: /toggle theme/i }),
    ).toContainElement(screen.getByTestId('sun-icon'));
  });

  it('should display the MoonIcon when theme is dark', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /toggle theme/i }));
    await user.click(screen.getByText(/dark/i));

    expect(
      screen.getByRole('button', { name: /toggle theme/i }),
    ).toContainElement(screen.getByTestId('moon-icon'));
  });

  it('should display the DesktopIcon when theme is system', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /toggle theme/i }));
    await user.click(screen.getByText(/system/i));

    expect(
      screen.getByRole('button', { name: /toggle theme/i }),
    ).toContainElement(screen.getByTestId('desktop-icon'));
  });

  it('should change theme when a different option is selected', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /toggle theme/i }));
    await user.click(screen.getByText(/dark/i));
    expect(
      screen.getByRole('button', { name: /toggle theme/i }),
    ).toContainElement(screen.getByTestId('moon-icon'));

    await user.click(screen.getByRole('button', { name: /toggle theme/i }));
    await user.click(screen.getByText(/light/i));
    expect(
      screen.getByRole('button', { name: /toggle theme/i }),
    ).toContainElement(screen.getByTestId('sun-icon'));
  });
});
