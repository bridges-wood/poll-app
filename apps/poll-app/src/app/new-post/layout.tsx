import { FC, PropsWithChildren } from 'react';

const NewPostLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="grid h-[calc(100vh_-_64px)] place-items-center">
      {children}
    </div>
  );
};

export default NewPostLayout;
