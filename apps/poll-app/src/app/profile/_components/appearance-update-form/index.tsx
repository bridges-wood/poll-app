'use client';

import { Label } from '@org/ui-kit/ui/label';
import { RadioGroup, RadioGroupItem } from '@org/ui-kit/ui/radio-group';
import { useTheme } from 'next-themes';
import { useState } from 'react';

const LightPreview = () => (
  <div className="border-muted hover:border-accent items-center rounded-md border-2 p-1">
    <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
      <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
        <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]"></div>
        <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]"></div>
      </div>
      <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
        <div className="h-4 w-4 rounded-full bg-[#ecedef]"></div>
        <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]"></div>
      </div>
      <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
        <div className="h-4 w-4 rounded-full bg-[#ecedef]"></div>
        <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]"></div>
      </div>
    </div>
  </div>
);

const DarkPreview = () => (
  <div className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground items-center rounded-md border-2 p-1">
    <div className="space-y-2 rounded-sm bg-slate-950 p-2">
      <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
        <div className="h-2 w-[80px] rounded-lg bg-slate-400"></div>
        <div className="h-2 w-[100px] rounded-lg bg-slate-400"></div>
      </div>
      <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
        <div className="h-4 w-4 rounded-full bg-slate-400"></div>
        <div className="h-2 w-[100px] rounded-lg bg-slate-400"></div>
      </div>
      <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
        <div className="h-4 w-4 rounded-full bg-slate-400"></div>
        <div className="h-2 w-[100px] rounded-lg bg-slate-400"></div>
      </div>
    </div>
  </div>
);

const AppearanceUpdateForm = () => {
  const { setTheme, theme, systemTheme } = useTheme();
  const [font, setFont] = useState('inter');

  return (
    <div>
      <div className="mb-4">
        <Label>Theme</Label>
        <p className="text-muted-foreground mb-1 text-xs">
          Select the theme for the app.
        </p>
        <RadioGroup
          value={theme}
          onValueChange={(theme) => setTheme(theme)}
          className="grid max-w-3xl grid-cols-3 gap-8"
        >
          <div className="space-y-2">
            <Label
              htmlFor="light"
              className="[&:has([data-state=checked])>div]:border-primary text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <RadioGroupItem value="light" className="sr-only" id="light" />
              <LightPreview />
              <span className="block w-full p-2 text-center font-normal">
                Light
              </span>
            </Label>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="dark"
              className="[&:has([data-state=checked])>div]:border-primary text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              onClick={() => setTheme('dark')}
            >
              <RadioGroupItem value="dark" className="sr-only" />
              <DarkPreview />
              <span className="block w-full p-2 text-center font-normal">
                Dark
              </span>
            </Label>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="dark"
              className="[&:has([data-state=checked])>div]:border-primary text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              onClick={() => setTheme('system')}
            >
              <RadioGroupItem value="system" className="sr-only" />
              {systemTheme === 'dark' ? <DarkPreview /> : <LightPreview />}
              <span className="block w-full p-2 text-center font-normal">
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
