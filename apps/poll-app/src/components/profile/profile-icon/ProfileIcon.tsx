'use client';
import { FetchProfileDataQuery } from '@org/graphql';
import * as Avatar from '@radix-ui/react-avatar';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { FC } from 'react';

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
      <Avatar.Root
        className={`inline-flex items-center justify-center align-middle overflow-hidden select-none rounded-full bg-black ${IMAGE_SIZE_MAP[size]}`}
      >
        <Avatar.Image
          className="w-full h-full object-cover rounded-inherit"
          src={data.me.profilePicture || undefined}
          alt={data.me.displayName}
        />
        <Avatar.AvatarFallback
          className={`w-full h-full flex items-center justify-center bg-white text-violet-500 leading-none ${FONT_SIZE_MAP[size]}`}
        >
          {data.me.displayName[0]}
        </Avatar.AvatarFallback>
      </Avatar.Root>
      {editable && (
        // TODO make clickable
        <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full grid place-items-center border-black border">
          <Pencil1Icon />
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;
