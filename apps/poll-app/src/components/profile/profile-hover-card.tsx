import { ProfileDataFragment } from '@org/graphql';
import RelativeTime from '@org/ui-kit/ui/relative-time';
import { CalendarIcon } from '@radix-ui/react-icons';
import { ComponentPropsWithoutRef, FC } from 'react';
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
      'bg-background-inset shadow-floating-md border-border-open-muted border-thin grid grid-cols-4 rounded-md p-4',
      className,
    )}
  >
    <div
      id="profile-wrapper"
      className="col-span-1 col-start-1 inline-flex h-9 w-9 items-center justify-center"
    >
      <ProfileIcon data={user} className="border-thin rounded-md" />
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

export default ProfileHoverCard;
