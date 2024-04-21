import { Separator } from '@org/ui-kit/ui/separator';
import AppearanceUpdateForm from '../appearance-update-form';

const AppearanceTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mt-4">Appearance</h2>
      <p className="text-sm text-muted-foreground">Choose how the app looks.</p>
      <Separator className="my-3" />
      <AppearanceUpdateForm />
    </div>
  );
};

export default AppearanceTab;
