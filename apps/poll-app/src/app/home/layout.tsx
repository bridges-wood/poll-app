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
    <div>
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
