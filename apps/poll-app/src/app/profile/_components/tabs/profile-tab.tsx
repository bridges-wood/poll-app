import { Separator } from '@org/ui-kit/ui/separator';
import ProfileEditForm from '../profile-update-form';

const ProfileTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mt-4">Profile</h2>
      <p className="text-sm text-muted-foreground">
        This is how others will see you on the site.
      </p>
      <Separator className="my-3" />
      <ProfileEditForm />
    </div>
  );
};

export default ProfileTab;
