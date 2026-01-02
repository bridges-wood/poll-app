import { ProfileDataFragment } from '@org/graphql';
import { HoverCard, HoverCardTrigger } from '@org/ui-kit/ui/hover-card';
import RelativeTime from '@org/ui-kit/ui/relative-time';
import { HoverCardContent } from '@radix-ui/react-hover-card';
import { CalendarIcon } from '@radix-ui/react-icons';
import { ComponentPropsWithoutRef, FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import ProfileIcon from './profile-icon/profile-icon';

interface ProfileHoverCardProps {
  user: ProfileDataFragment;
}

const ProfileHoverCard: FC<
  ProfileHoverCardProps & ComponentPropsWithoutRef<'div'>
> = ({ user, className, ...props }) => (
  <div
    {...props}
    className={twMerge(
      'grid grid-cols-4 rounded-md border-thin border-border-open-muted bg-background-inset p-4 shadow-floating-md',
      className,
    )}
  >
    <div
      id="profile-wrapper"
      className="col-span-1 col-start-1 inline-flex h-9 w-9 items-center justify-center"
    >
      <ProfileIcon data={user} className="rounded-md border-thin" />
    </div>
    <h2 className="col-span-3 col-start-2 font-bold">@{user.displayName}</h2>
    <div id="footer" className="col-span-3 col-start-2 row-start-2">
      <CalendarIcon
        className="mr-1 inline align-text-bottom"
        height={18}
        width={15}
      />
      Joined{' '}
      <RelativeTime date={new Date(user.createdAt)} timeZoneName="short" />
    </div>
  </div>
);

export const withProfileHoverCard = (
  child: ReactNode,
  user: ProfileDataFragment,
) => (
  <HoverCard openDelay={400}>
    <HoverCardTrigger asChild>{child}</HoverCardTrigger>
    <HoverCardContent className="z-20 mt-2 bg-background-inset data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up">
      <ProfileHoverCard user={user} />
    </HoverCardContent>
  </HoverCard>
);

export default ProfileHoverCard;
