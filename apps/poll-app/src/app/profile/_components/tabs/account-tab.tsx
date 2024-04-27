import { Separator } from '@org/ui-kit/ui/separator';
import { Suspense } from 'react';
import AccountUpdateForm from '../account-update-form';

const AccountTab = () => {
  return (
    <div>
      <h2 className="mt-4 text-2xl font-semibold">Account</h2>
      <p className="text-muted-foreground text-sm">
        Manage how we contact you.
      </p>
      <Separator className="my-3" />
      <Suspense fallback={'Loading...'}>
        <AccountUpdateForm />
      </Suspense>
    </div>
  );
};

export default AccountTab;
