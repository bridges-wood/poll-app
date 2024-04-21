import { Skeleton } from '@org/ui-kit/ui/skeleton';
import ProfileIconContainer from '@poll-app/components/profile/profile-icon';
import Link from 'next/link';
import { Suspense } from 'react';

const HomeSidebar = () => {
  return (
    <aside className="md:col-span-2 md:h-screen bg-red-500">
      <Suspense fallback={<Skeleton className="w-8 h-8 rounded-full" />}>
        <Link href="/profile">
          <ProfileIconContainer />
        </Link>
      </Suspense>
      <div>HomeSidebar</div>
    </aside>
  );
};

export default HomeSidebar;
