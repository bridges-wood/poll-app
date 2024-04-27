export const LightPreview = () => (
  <div className="border-muted hover:border-accent hidden items-center rounded-md border-2 p-1 md:block">
    <div className=" space-y-2 rounded-sm bg-[#ecedef] p-2">
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

export const DarkPreview = () => (
  <div className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground hidden items-center rounded-md border-2 p-1 md:block">
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

export const SystemPreview = () => (
  <div className="border-muted hover:border-accent hidden items-center rounded-md border-2 p-1 md:block">
    <div className=" space-y-2 rounded-sm bg-[#ecedef] p-2 dark:bg-slate-950">
      <div className="space-y-2 rounded-md bg-white p-2 shadow-sm dark:bg-slate-800">
        <div className="h-2 w-[80px] rounded-lg bg-[#ecedef] dark:bg-slate-400"></div>
        <div className="h-2 w-[100px] rounded-lg bg-[#ecedef] dark:bg-slate-400"></div>
      </div>
      <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm dark:bg-slate-800">
        <div className="h-4 w-4 rounded-full bg-[#ecedef] dark:bg-slate-400"></div>
        <div className="h-2 w-[100px] rounded-lg bg-[#ecedef] dark:bg-slate-400"></div>
      </div>
      <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm dark:bg-slate-800">
        <div className="h-4 w-4 rounded-full bg-[#ecedef] dark:bg-slate-400"></div>
        <div className="h-2 w-[100px] rounded-lg bg-[#ecedef] dark:bg-slate-400"></div>
      </div>
    </div>
  </div>
);
