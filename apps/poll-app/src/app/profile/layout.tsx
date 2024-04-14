import { Box } from '@radix-ui/themes';
import { FC, PropsWithChildren } from 'react';

const ProfileLayout: FC<PropsWithChildren> = ({ children }) => {
  return <Box className="grid place-items-center h-screen">{children}</Box>;
};

export default ProfileLayout;
