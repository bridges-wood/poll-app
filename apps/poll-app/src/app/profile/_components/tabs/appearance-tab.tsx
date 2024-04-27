import { Separator } from '@org/ui-kit/ui/separator';
import { Suspense } from 'react';
import AppearanceUpdateForm from '../appearance-update-form';

const AppearanceTab = () => {
  return (
    <div>
      <h2 className="mt-4 text-2xl font-semibold">Appearance</h2>
      <p className="text-muted-foreground text-sm">Choose how the app looks.</p>
      <Separator className="my-3" />
      <Suspense fallback={'Loading...'}>
        <AppearanceUpdateForm />
      </Suspense>
    </div>
  );
};

export default AppearanceTab;
