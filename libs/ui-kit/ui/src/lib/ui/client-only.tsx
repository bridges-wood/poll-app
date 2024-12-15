import { JSX, PropsWithChildren, useEffect, useState } from 'react';

export function ClientOnly({
  children,
  skeleton,
}: PropsWithChildren<{ skeleton?: JSX.Element }>) {
  const [clientReady, setClientReady] = useState<boolean>(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  return clientReady ? <>{children}</> : skeleton || null;
}

export default ClientOnly;
