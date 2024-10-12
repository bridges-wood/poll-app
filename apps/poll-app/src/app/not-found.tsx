import { Button } from '@org/ui-kit/ui/button';

const NotFound = () => {
  return (
    <div className="grid h-[calc(100vh-64px)] place-items-center">
      <div className="flex flex-col justify-center items-center">
        <h1 className="my-2 px-6 text-center text-5xl font-extralight">
          Not Found
        </h1>
        <p className="text-foreground-muted text-center">
          The page you are looking for does not exist.
        </p>
        <Button asChild className='mt-4 w-32' variant='ghost'>
          <a href="/home">Go back</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
