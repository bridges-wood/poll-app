import { Box } from '@radix-ui/themes';
import { FC, PropsWithChildren } from 'react';
import HomeHeader from './header';
import HomeSidebar from './sidebar';

const HomeLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <HomeHeader />
      <HomeSidebar />
      <Box className="grid place-items-center h-screen">{children}</Box>
    </>
  );
};

export default HomeLayout;
