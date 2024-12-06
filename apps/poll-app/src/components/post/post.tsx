'use client';
import { FeedPostFragment, PostContentType } from '@org/graphql';
import { Button } from '@org/ui-kit/ui/button';
import { HoverCard, HoverCardTrigger } from '@org/ui-kit/ui/hover-card';
import RelativeTime from '@org/ui-kit/ui/relative-time';
import { HoverCardContent } from '@radix-ui/react-hover-card';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
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
  // const [showResponses, setShowResponses] = useState(false);

  return (
    <div
      {...props}
      className={twMerge(
        'border-border-neutral-muted border-thick rounded-lg p-4',
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
        <span className="col-span-4 row-start-2 text-sm">
          Asked by{' '}
          <Link
            href={`/users/${btoa(post.author.displayName)}`}
            className="font-bold"
          >
            @{[post.author.displayName]}
          </Link>
          <span> &#183; </span>
          <span className="text-foreground-muted ml-auto text-sm">
            Vote to see results
          </span>
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
            <HoverCardContent className="[&[data-side=top]]:animate-slide-up [&[data-side=bottom]]:animate-slide-down z-20 mt-2">
              <ProfileHoverCard user={post.author} />
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      <div id="body" className="w-full">
        <PostBody post={post} />
      </div>
      <div id="footer" className="mt-3 flex w-full flex-row items-baseline">
        <div className="text-foreground-muted ml-auto w-min whitespace-nowrap text-sm">
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
    <div className="border-border-severe-emphasis border-thick bg-background-severe-muted shadow-resting-md mb-4 w-full rounded-lg p-4 last:mb-0">
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
