import { FC, PropsWithChildren } from 'react';

const PostLayout: FC<PropsWithChildren> = ({ children }) => {
  return <div>PostLayout {children}</div>;
};

export default PostLayout;
