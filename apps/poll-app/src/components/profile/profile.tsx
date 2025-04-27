'use client';
import { FetchProfileDataQuery } from '@org/graphql';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import Post from '../post/post';
import ProfileIcon from './profile-icon/profile-icon';

interface ProfileProps {
  user: FetchProfileDataQuery['user'];
}

const Profile: FC<ProfileProps> = ({ user }) => {
  const router = useRouter();

  return (
    <div className="grid place-items-center space-y-4">
      <div className="flex flex-row items-center space-x-4">
        <ProfileIcon data={user} size="2xl" />
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">@{user.displayName}</h1>
          <h2 className="text-xl">
            {user.firstName} {user.lastName}
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {user.posts.edges?.map((post) => (
          <Post
            key={post?.node.id}
            post={post?.node}
            className="mb-4 h-full w-full last:mb-0"
          />
        ))}
      </div>
      <button onClick={() => router.back()}>Back</button>
    </div>
  );
};

export default Profile;
