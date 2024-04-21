import { Button } from '@org/ui-kit/ui/button';

const Index = () => {
  return (
    <div className="grid place-items-center h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-9xl font-extralight">Pollstr</h1>
        <p className="leading-7 mb-7">What will you ask?</p>
        <Button asChild>
          <a href="/login">Let's go!</a>
        </Button>
      </div>
    </div>
  );
};

export default Index;
