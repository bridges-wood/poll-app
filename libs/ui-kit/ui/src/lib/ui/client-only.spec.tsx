import { render, screen, waitFor } from '@testing-library/react';
import preloadAll from 'jest-next-dynamic';
import ClientOnly from './client-only';

describe('ClientOnly', () => {
  it('renders children when client is ready', async () => {
    await preloadAll();

    render(
      <ClientOnly>
        <div data-testid="child">Child Content</div>
      </ClientOnly>,
    );

    const element = await waitFor(() => screen.getByTestId('child'));

    expect(element).toBeInTheDocument();
  });

  it('renders skeleton when client is not ready', async () => {
    render(
      <ClientOnly skeleton={<div data-testid="skeleton">Loading...</div>}>
        <div data-testid="child">Child Content</div>
      </ClientOnly>,
    );

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument(),
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders null when client is not ready and no skeleton is provided', async () => {
    const { container } = render(
      <ClientOnly>
        <div data-testid="child">Child Content</div>
      </ClientOnly>,
    );

    expect(container).toBeEmptyDOMElement();

    await waitFor(() =>
      expect(screen.queryByTestId('child')).not.toBeInTheDocument(),
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
