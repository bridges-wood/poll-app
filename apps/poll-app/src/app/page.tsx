import { Button } from '@org/ui-kit/ui/button';

const Index = () => {
  return (
    <section className="grid h-[calc(100vh_-_64px)] place-items-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-8xl font-extralight sm:text-9xl">Pollstr</h1>
        <p className="mb-7 leading-7">What will you ask?</p>
        <Button asChild>
          <a href="/home">Let's go!</a>
        </Button>
      </div>
    </section>
  );
};

export default Index;
