import { Separator } from '@org/ui-kit/ui/separator';
import { Suspense } from 'react';
import ProfileEditForm from '../profile-update-form';

const ProfileTab = () => {
  return (
    <div>
      <h2 className="mt-4 text-2xl font-semibold">Profile</h2>
      <p className="text-muted-foreground text-sm">
        This is how others will see you on the site.
      </p>
      <Separator className="my-3" />
      <Suspense fallback={<ProfileEditForm skeleton />}>
        <ProfileEditForm />
      </Suspense>
    </div>
  );
};

export default ProfileTab;
