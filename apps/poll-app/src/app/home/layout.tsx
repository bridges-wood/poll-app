import { FC, PropsWithChildren, ReactNode } from 'react';
import Sidebar from './sidebar';

interface HomeLayoutProps {
  feed: ReactNode;
}

const HomeLayout: FC<PropsWithChildren<HomeLayoutProps>> = ({
  children: _children,
  feed,
}) => {
  return (
    <div className="h-[calc(100vh-96px)]">
      <div className="grid h-full gap-5 md:grid-cols-12">
        <Sidebar className="fixed mt-4 h-[calc(100vh-96px)] pb-8 max-sm:hidden md:col-span-2 md:col-start-1" />
        <main className="grid h-full place-items-center md:col-span-12 md:col-start-1">
          {feed}
        </main>
      </div>
    </div>
  );
};

export default HomeLayout;
