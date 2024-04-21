import { FC, PropsWithChildren } from 'react';

const LoginLayout: FC<PropsWithChildren> = ({ children }) => {
  return <div className="grid place-items-center h-screen">{children}</div>;
};

export default LoginLayout;
