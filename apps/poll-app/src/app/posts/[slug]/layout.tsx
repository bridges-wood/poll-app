import { FC, PropsWithChildren } from 'react';

const PostLayout: FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>;
};

export default PostLayout;
