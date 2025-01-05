import dynamic from 'next/dynamic';
import { JSX, PropsWithChildren } from 'react';

export const ClientOnly = (
  props: PropsWithChildren<{ skeleton?: JSX.Element }>,
) => {
  const DynamicComponent = dynamic(() => Promise.resolve(ClientOnlyComponent), {
    ssr: false,
    loading: () => props.skeleton || null,
  });

  return <DynamicComponent>{props.children}</DynamicComponent>;
};

export function ClientOnlyComponent({ children }: PropsWithChildren) {
  return children;
}

export default ClientOnly;
