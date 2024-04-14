import { FC, PropsWithChildren, ReactNode } from 'react';
import Header from './header';
import Sidebar from './sidebar';

interface Props {
  feed: ReactNode;
}

const HomeLayout: FC<PropsWithChildren<Props>> = ({ children, feed }) => {
  return (
    <div>
      <Header />
      <div className="grid md:grid-cols-12 gap-5">
        <Sidebar />
        <main className="md:col-span-9 grid place-items-center md:h-screen">
          {feed}
          {children}
        </main>
      </div>
    </div>
  );
};

export default HomeLayout;
