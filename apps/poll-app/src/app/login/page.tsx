import { Button } from '@org/ui-kit/ui/button';
import { Input } from '@org/ui-kit/ui/input';
import { GoogleButton } from '@poll-app/components/buttons';
import { EnvelopeClosedIcon, LockClosedIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { Suspense } from 'react';

const Login = () => {
  return (
    <div className="flex flex-col items-center max-w-md gap-4">
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
        Log In
      </h1>
      <p className="text-center text-muted-foreground mb-4">
        Enter your email and password to log in
      </p>
      <form id="login-form" className="w-full flex flex-col gap-2">
        <Input
          startContent={<EnvelopeClosedIcon className="opacity-50" />}
          placeholder="Email"
          type="email"
          disabled
        />
        <Input
          startContent={<LockClosedIcon className="opacity-50" />}
          placeholder="Password"
          type="password"
          disabled
        />
        <Button type="submit" disabled>
          Log In with Email
        </Button>
      </form>
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Suspense fallback={'Loading...'}>
        <GoogleButton />
      </Suspense>
      <p className="px-8 text-center text-xs text-muted-foreground max-w-xs">
        By clicking continue, you agree to our{' '}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
      </p>
    </div>
  );
};

export default Login;
