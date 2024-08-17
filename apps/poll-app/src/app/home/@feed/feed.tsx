'use client';

import { FetchPostsQuery } from '@org/graphql';
import { Button } from '@org/ui-kit/ui/button';
import { Spinner } from '@org/ui-kit/ui/spinner';
import Post from '@poll-app/components/post/post';
import usePosts from '@poll-app/lib/hooks/queries/use-posts';
import _, { isNil } from 'lodash';
import { FC, Suspense, useEffect, useState, useTransition } from 'react';

type PostPage = FetchPostsQuery['posts'];

interface FeedProps {
  firstPage: PostPage;
  pageSize: number;
}

const Feed: FC<FeedProps> = ({ firstPage, pageSize }) => {
  const [pages, setPages] = useState<PostPage[]>([firstPage]);
  const [result, executeQuery] = usePosts(
    pageSize,
    pages.at(-1)?.pageInfo.startCursor,
  );
  const [loading, setLoading] = useState(false);
  const [_isPending, startTransition] = useTransition();

  const paginationEnabled = pages.at(-1)?.pageInfo.hasPreviousPage;

  useEffect(() => {
    setLoading(false);
    const newPage = result.data?.posts;
    if (newPage) {
      setPages((prev) => [...prev, newPage]);
    }
  }, [result.data]);

  return (
    <div id="feed" className="flex flex-col content-center items-center">
      {_.chain(pages)
        .flatMap((page) => page.edges)
        .filter((edge) => !isNil(edge))
        .map((edge) => edge.node)
        .value()
        .map((post) => (
          <Post key={post.id} post={post} className="mb-4 w-full last:mb-0" />
        ))}
      <Suspense fallback={<div>Loading...</div>}>
        <Button
          className="w-1/3 min-w-min"
          variant="outline"
          disabled={loading || !paginationEnabled}
          onClick={() => {
            startTransition(() => {
              setLoading(true);
              setTimeout(() => executeQuery(), 1000);
            });
          }}
        >
          {loading
            ? 'Loading...'
            : paginationEnabled
              ? 'Load More'
              : 'No more posts to load'}
          {loading ? <Spinner /> : null}
        </Button>
      </Suspense>
    </div>
  );
};

export default Feed;
