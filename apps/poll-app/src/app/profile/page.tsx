import { Separator } from '@org/ui-kit/ui/separator';
import { Suspense } from 'react';
import ProfileTabs from './_components/profile-tabs';

const ProfilePage = () => {
  return (
    <div className="m-8 min-h-screen">
      <h1 className="text-5xl mb-2">Settings</h1>
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
