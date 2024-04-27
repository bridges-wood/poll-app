import { FC, PropsWithChildren } from 'react';

const LoginLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="grid h-[calc(100vh_-_64px)] place-items-center 2xl:h-[calc(84vh_-_64px)]">
      {children}
    </div>
  );
};

export default LoginLayout;
