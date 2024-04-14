import ProfileEditForm from '@poll-app/components/profile/profile-edit-form';
import ProfileIcon from '@poll-app/components/profile/profile-icon';
import { Suspense } from 'react';

const ProfilePage = () => {
  return (
    <div>
      <Suspense fallback={'Loading...'}>
        <ProfileIcon size="2xl" editable />
      </Suspense>
      <h1 className="text-center text-5xl">Profile</h1>
      <Suspense fallback={'Loading...'}>
        <ProfileEditForm />
      </Suspense>
    </div>
  );
};

export default ProfilePage;
