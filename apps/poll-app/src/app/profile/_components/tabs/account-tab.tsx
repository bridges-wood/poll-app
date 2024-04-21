import { Separator } from '@org/ui-kit/ui/separator';
import AccountUpdateForm from '../account-update-form';

const AccountTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mt-4">Account</h2>
      <p className="text-sm text-muted-foreground">
        Manage how we contact you.
      </p>
      <Separator className="my-3" />
      <AccountUpdateForm />
    </div>
  );
};

export default AccountTab;
