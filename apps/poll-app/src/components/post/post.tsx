'use client';
import { FeedPostFragment, PostContentType } from '@org/graphql';
import { Button } from '@org/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@org/ui-kit/ui/dropdown-menu';
import { HoverCard, HoverCardTrigger } from '@org/ui-kit/ui/hover-card';
import RelativeTime from '@org/ui-kit/ui/relative-time';
import useUser from '@poll-app/lib/hooks/queries/use-user';
import { useAuth } from '@poll-app/lib/hooks/use-auth';
import { HoverCardContent } from '@radix-ui/react-hover-card';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { isEmpty } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ComponentPropsWithoutRef, FC } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { twMerge } from 'tailwind-merge';
import ProfileHoverCard from '../profile/profile-hover-card';
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
        'flex flex-col rounded-lg border-thick border-border-neutral-muted p-4',
        className,
      )}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        router.push(`/posts/${btoa(post.id)}`);
      }}
    >
      <div id="header" className="mb-2 grid auto-rows-auto grid-cols-7">
        <h2 id="title" className="col-span-5 row-start-1 self-center text-xl">
          {post.content.question}
        </h2>
        <span className="col-span-5 row-start-2 text-sm">
          Asked by{' '}
          <Link href={`/users/${btoa(post.author.id)}`} className="font-bold">
            {isAuthor ? 'you' : `@${post.author.displayName}`}
          </Link>
          {!hasResponded && (
            <>
              <span> &#183; </span>
              <span className="ml-auto text-sm text-foreground-muted">
                Vote to see results
              </span>
            </>
          )}
        </span>
        <span className="col-start-7 row-start-2 self-center justify-self-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <span className="sr-only">Post options</span>
                &#x22EE;
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.stopPropagation();
                  router.push(`/posts/${btoa(post.id)}`);
                }}
              >
                View Post
              </DropdownMenuItem>
              {isAuthor && (
                <DropdownMenuItem
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
        </span>
        <div id="author" className="col-start-7 self-center justify-self-end">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link href={`/users/${btoa(post.author.id)}`}>
                <Button variant="outline" size="icon">
                  <ProfileIcon data={post.author} />
                  <span className="sr-only">Profile menu</span>
                </Button>
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="z-20 mt-2 [&[data-side=bottom]]:animate-slide-down [&[data-side=top]]:animate-slide-up">
              <ProfileHoverCard user={post.author} />
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      <div id="body" className="mb-3 w-full">
        <PostBody post={post} />
      </div>
      <div id="footer" className="mt-auto flex w-full flex-row items-baseline">
        <div className="ml-auto w-min whitespace-nowrap text-sm text-foreground-muted">
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
    <div className="mb-4 w-full rounded-lg border-thick border-border-severe-emphasis bg-background-severe-muted p-4 shadow-resting-md last:mb-0">
      <div id="header" className="mb-2 grid auto-rows-auto grid-cols-7">
        <h2
          id="title"
          className="text-fore col-span-5 row-start-1 self-center text-xl text-foreground-severe"
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
        <div className="text-foreground-severe/100 ml-auto w-min whitespace-nowrap text-sm">
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
