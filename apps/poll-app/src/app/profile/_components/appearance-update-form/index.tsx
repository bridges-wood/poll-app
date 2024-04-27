'use client';

import { Label } from '@org/ui-kit/ui/label';
import { RadioGroup, RadioGroupItem } from '@org/ui-kit/ui/radio-group';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { DarkPreview, LightPreview, SystemPreview } from './app-previews';

const AppearanceUpdateForm = () => {
  const { setTheme, theme } = useTheme();
  const [derivedValue, setDerivedValue] = useState<string | undefined>('');
  // TODO: prevent delay in updating theme on first load

  useEffect(() => {
    setDerivedValue(theme);
  }, [theme]);

  return (
    <div>
      <div className="mb-4">
        <Label>Theme</Label>
        <p className="text-muted-foreground mb-1 text-xs">
          Select the theme for the app.
        </p>
        <RadioGroup
          value={derivedValue}
          onValueChange={(theme) => setTheme(theme)}
          className="mt-2 grid max-w-3xl grid-cols-1 md:grid-cols-3 md:grid-rows-1 md:gap-4"
        >
          <div className="md:space-y-2">
            <Label
              htmlFor="light"
              className="[&:has([data-state=checked])>div]:border-primary flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 md:block"
            >
              <RadioGroupItem value="light" className="md:sr-only" id="light" />
              <LightPreview />
              <span className="text-center font-normal md:block md:w-full md:p-2">
                Light
              </span>
            </Label>
          </div>
          <div className="md:space-y-2">
            <Label
              htmlFor="dark"
              className="[&:has([data-state=checked])>div]:border-primary flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 md:block"
              onClick={() => setTheme('dark')}
            >
              <RadioGroupItem value="dark" className="md:sr-only" />
              <DarkPreview />
              <span className="text-center font-normal md:block md:w-full md:p-2">
                Dark
              </span>
            </Label>
          </div>
          <div className="md:space-y-2">
            <Label
              htmlFor="dark"
              className="[&:has([data-state=checked])>div]:border-primary flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 md:block"
              onClick={() => setTheme('system')}
            >
              <RadioGroupItem value="system" className="md:sr-only" />
              <SystemPreview />
              <span className="text-center font-normal md:block md:w-full md:p-2">
                System
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default AppearanceUpdateForm;
