'use client';
import { FeedPostFragment, PostContentType } from '@org/graphql';
import { Button } from '@org/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@org/ui-kit/ui/dropdown-menu';
import RelativeTime from '@org/ui-kit/ui/relative-time';
import useUser from '@poll-app/lib/hooks/queries/use-user';
import { useAuth } from '@poll-app/lib/hooks/use-auth';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { isEmpty } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ComponentPropsWithoutRef, FC } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { twMerge } from 'tailwind-merge';
import { withProfileHoverCard } from '../profile/profile-hover-card';
import ProfileIcon from '../profile/profile-icon/profile-icon';
import MultipleChoicePostBody, {
  FeedMultipleChoicePost,
} from './multiple-choice-post';

interface PostProps {
  post: FeedPostFragment;
}

const Post: FC<PostProps & ComponentPropsWithoutRef<'div'>> = ({
  post,
  className,
  ...props
}) => {
  const router = useRouter();
  const hasResponded = !isEmpty(post.myResponses.edges);
  const { token } = useAuth();
  const [user] = useUser(token);
  const isAuthor = user.data?.me.id === post.author.id;

  return (
    <div
      {...props}
      className={twMerge(
        'border-thick border-border-neutral-muted grid auto-rows-min grid-cols-[repeat(6,1fr)_40px_40px] gap-x-4 rounded-lg p-4',
        className,
      )}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        router.push(`/posts/${btoa(post.id)}`);
      }}
    >
      <div id="header" className="col-span-full grid grid-cols-subgrid">
        <h2 id="title" className="col-span-6 self-center text-xl">
          {post.content.question}
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="col-start-7 self-center justify-self-end"
          >
            <Button variant="outline" size="icon">
              <span className="sr-only">Post options</span>
              &#x22EE;
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => {
                e.stopPropagation();
                router.push(`/posts/${btoa(post.id)}`);
              }}
            >
              View Post
            </DropdownMenuItem>
            {isAuthor && (
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => {
                  e.stopPropagation();
                  router.push(`/posts/${btoa(post.id)}/edit`);
                }}
              >
                Edit Post
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div id="author" className="col-start-8 self-center justify-self-end">
          {withProfileHoverCard(
            <Link href={`/users/${btoa(post.author.id)}`}>
              <Button variant="outline" size="icon">
                <ProfileIcon data={post.author} />
                <span className="sr-only">Profile menu</span>
              </Button>
            </Link>,
            post.author,
          )}
        </div>
      </div>
      <div
        id="byline"
        className="col-span-full mb-2 grid grid-cols-subgrid grid-rows-subgrid"
      >
        <span className="col-span-full">
          Asked by{' '}
          {withProfileHoverCard(
            <Link href={`/users/${btoa(post.author.id)}`} className="font-bold">
              {isAuthor ? 'you' : `@${post.author.displayName}`}
            </Link>,
            post.author,
          )}
          {!hasResponded && (
            <>
              <span> &#183; </span>
              <span className="text-foreground-muted ml-auto text-sm">
                Vote to see results
              </span>
            </>
          )}
        </span>
      </div>
      <div id="body" className="col-span-full mb-3 w-full">
        <PostBody post={post} />
      </div>
      <div id="footer" className="col-span-full mt-auto grid grid-cols-subgrid">
        <div className="text-foreground-muted col-span-2 col-start-7 w-min text-sm whitespace-nowrap">
          <RelativeTime date={new Date(post.createdAt)} timeZoneName="short" />
        </div>
      </div>
    </div>
  );
};

const PostBody: FC<{ post: FeedPostFragment }> = ({ post }) => {
  switch (post.content.type) {
    case PostContentType.MultipleChoice:
      return <MultipleChoicePostBody post={post as FeedMultipleChoicePost} />;
    default:
      return null;
  }
};

const SafePost = withErrorBoundary(Post, {
  fallback: (
    <div className="border-thick border-border-severe-emphasis bg-background-severe-muted shadow-resting-md mb-4 w-full rounded-lg p-4 last:mb-0">
      <div id="header" className="mb-2 grid auto-rows-auto grid-cols-7">
        <h2
          id="title"
          className="text-fore text-foreground-severe col-span-5 row-start-1 self-center text-xl"
        >
          <ExclamationTriangleIcon
            height={20}
            width={18}
            className="inline align-text-bottom"
          />{' '}
          Error loading post
        </h2>
        <div id="author" className="col-start-7 self-center justify-self-end">
          <ProfileIcon size="sm" />
        </div>
      </div>
      <div id="body" className="w-full">
        <div className="text-foreground-severe">
          An error occurred while loading this post.
        </div>
      </div>
      <div id="footer" className="mt-3 w-full">
        <div className="text-foreground-severe ml-auto w-min text-sm whitespace-nowrap">
          just now
        </div>
      </div>
    </div>
  ),
  onError(error, info) {
    console.error('Error in Post component:', error, info);
  },
});

export default SafePost;
