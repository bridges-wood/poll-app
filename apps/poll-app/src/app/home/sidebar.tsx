import ProfileIcon from '@poll-app/components/profile/ProfileIcon';
import { Suspense } from 'react';

const HomeSidebar = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileIcon />
      </Suspense>
      <div>HomeSidebar</div>
    </>
  );
};

export default HomeSidebar;
