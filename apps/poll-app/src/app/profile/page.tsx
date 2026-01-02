import { Separator } from '@org/ui-kit/ui/separator';
import { Suspense } from 'react';
import ProfileTabs from './_components/profile-tabs';

const ProfilePage = () => {
  return (
    <div className="h-[calc(100vh-64px)] w-full max-w-4xl pt-8 2xl:h-[calc(84vh-64px)]">
      <h1 className="mb-2 text-5xl">Settings</h1>
      <p className="text-md text-muted-foreground">
        Manage your account settings and set preferences.
      </p>
      <Separator className="my-4" />
      <Suspense fallback={'Loading...'}>
        <ProfileTabs />
      </Suspense>
    </div>
  );
};

export default ProfilePage;
