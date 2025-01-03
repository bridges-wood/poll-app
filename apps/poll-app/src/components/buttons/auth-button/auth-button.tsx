'use client';

import { Button } from '@org/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@org/ui-kit/ui/dropdown-menu';
import { Skeleton } from '@org/ui-kit/ui/skeleton';
import ProfileIcon from '@poll-app/components/profile/profile-icon/profile-icon';
import useUser from '@poll-app/lib/hooks/queries/use-user';
import { useAuth } from '@poll-app/lib/hooks/use-auth';
import { Dispatch } from '@poll-app/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

const AuthButton = () => {
  const dispatch = useDispatch<Dispatch>();
  const router = useRouter();
  const { token, isLoggedIn } = useAuth();
  const [result] = useUser(token);

  if (result.fetching) return <Skeleton className="h-9 w-9" />;

  return isLoggedIn && result.data ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <ProfileIcon data={result.data.me} />
          <span className="sr-only">Profile menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          Logged in as <strong>@{result.data.me.displayName}</strong>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Link href="/help">Help & Feedback</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button
            variant="danger"
            onClick={(_e) => {
              dispatch.auth.logout();
              router.push('/login');
            }}
          >
            Logout
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button variant="outline" asChild>
      <Link href="/login">Login</Link>
    </Button>
  );
};

export default AuthButton;
