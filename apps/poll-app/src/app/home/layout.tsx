import Sidebar from './sidebar';

// interface HomeLayoutProps {
//   feed: ReactNode;
// }

const HomeLayout = ({
  children,
  feed,
}: {
  children: React.ReactNode;
  feed: never;
}) => {
  return (
    <div className="h-[calc(100vh_-_64px)] 2xl:h-[calc(84vh_-_64px)]">
      <div className="grid h-full gap-5 md:grid-cols-12">
        <Sidebar />
        <main className="grid place-items-center md:col-span-9 md:h-screen">
          {feed}
          {children}
        </main>
      </div>
    </div>
  );
};

export default HomeLayout;
