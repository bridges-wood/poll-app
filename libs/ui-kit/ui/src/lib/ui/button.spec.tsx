import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders a default button', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button', { name: /default button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass(
      'bg-background-neutral text-foreground-accent-emphasis',
    );
  });

  it('renders a danger button', () => {
    render(<Button variant="danger">Danger Button</Button>);
    const button = screen.getByRole('button', { name: /danger button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass(
      'border-border-danger-emphasis text-foreground-danger',
    );
  });

  it('renders an outline button', () => {
    render(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByRole('button', { name: /outline button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('border-border-muted bg-background-transparent');
  });

  it('renders a ghost button', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    const button = screen.getByRole('button', { name: /ghost button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('hover:bg-accent hover:text-accent-foreground');
  });

  it('renders a link button', () => {
    render(<Button variant="link">Link Button</Button>);
    const button = screen.getByRole('button', { name: /link button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('text-primary underline-offset-4');
  });

  it('renders a small button', () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByRole('button', { name: /small button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-8 rounded-md px-3 text-xs');
  });

  it('renders a large button', () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByRole('button', { name: /large button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-10 rounded-md px-8');
  });

  it('renders an icon button', () => {
    render(<Button size="icon">Icon Button</Button>);
    const button = screen.getByRole('button', { name: /icon button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-9 w-9');
  });

  it('renders a button with custom class', () => {
    render(<Button className="custom-class">Custom Class Button</Button>);
    const button = screen.getByRole('button', { name: /custom class button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('custom-class');
  });

  it('renders a button as a child component', () => {
    render(
      <Button asChild>
        <div>Child Button</div>
      </Button>,
    );
    const button = screen.getByText(/child button/i);
    expect(button).toBeInTheDocument();
  });
});
