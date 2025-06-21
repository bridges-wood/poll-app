'use client';
import { ProfileDataFragment } from '@org/graphql';
import { Avatar, AvatarFallback, AvatarImage } from '@org/ui-kit/ui/avatar';
import { Button } from '@org/ui-kit/ui/button';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { head } from 'lodash';
import Link, { LinkProps } from 'next/link';
import { ComponentPropsWithoutRef, FC } from 'react';
import { twMerge } from 'tailwind-merge';

// TODO make this just a display component
export type ProfileIconProps = {
  data?: ProfileDataFragment;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  editable?: boolean;
};

const IMAGE_SIZE_MAP: Record<NonNullable<ProfileIconProps['size']>, string> = {
  sm: 'w-8 h-8', // 32px
  md: 'w-11 h-11', // 44px
  lg: 'w-14 h-14', // 56px
  xl: 'w-16 h-16', // 64px
  '2xl': 'w-20 h-20', // 80px
};

const FONT_SIZE_MAP: Record<NonNullable<ProfileIconProps['size']>, string> = {
  sm: 'text-lg', // 16px
  md: 'text-xl', // 20px
  lg: 'text-2xl', // 24px
  xl: 'text-3xl', // 32px
  '2xl': 'text-4xl', // 40px
};

const ProfileIcon: FC<ProfileIconProps & ComponentPropsWithoutRef<'div'>> = ({
  data,
  size = 'sm',
  editable = false,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={twMerge(`relative ${IMAGE_SIZE_MAP[size]}`, className)}
    >
      <Avatar className={`${IMAGE_SIZE_MAP[size]}`}>
        <AvatarImage
          src={data?.profilePicture || undefined}
          alt={data?.displayName}
        />
        <AvatarFallback className={` ${FONT_SIZE_MAP[size]}`}>
          {head(data?.displayName)}
        </AvatarFallback>
      </Avatar>
      {editable && (
        // TODO make clickable
        (<Button
          variant="outline"
          size="icon"
          className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full"
        >
          <Pencil1Icon />
        </Button>)
      )}
    </div>
  );
};

export const LinkedProfileIcon: FC<
  ProfileIconProps & { containerProps?: Omit<LinkProps, 'href'>; href: string }
> = ({ href, containerProps, ...props }) => (
  <Link {...containerProps} href={href} legacyBehavior>
    <ProfileIcon {...props} />
  </Link>
);

export default ProfileIcon;
