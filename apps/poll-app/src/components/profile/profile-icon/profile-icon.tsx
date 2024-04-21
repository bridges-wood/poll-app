'use client';
import { FetchProfileDataQuery } from '@org/graphql';
import { Avatar, AvatarFallback, AvatarImage } from '@org/ui-kit/ui/avatar';
import { Button } from '@org/ui-kit/ui/button';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { FC } from 'react';

// TODO make this just a display component
export type ProfileIconProps = {
  data: FetchProfileDataQuery;
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

const ProfileIcon: FC<ProfileIconProps> = ({
  data,
  size = 'sm',
  editable = false,
}) => {
  return (
    <div className={`relative ${IMAGE_SIZE_MAP[size]}`}>
      <Avatar className={`${IMAGE_SIZE_MAP[size]}`}>
        <AvatarImage
          src={data.me.profilePicture || undefined}
          alt={data.me.displayName}
        />
        <AvatarFallback className={` ${FONT_SIZE_MAP[size]}`}>
          {data.me.displayName[0]}
        </AvatarFallback>
      </Avatar>
      {editable && (
        // TODO make clickable
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-0 right-0 w-5 h-5 rounded-full grid place-items-center"
        >
          <Pencil1Icon />
        </Button>
      )}
    </div>
  );
};

export default ProfileIcon;
