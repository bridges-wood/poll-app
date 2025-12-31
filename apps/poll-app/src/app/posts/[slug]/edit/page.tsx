import {
  FetchPostDocument,
  FetchPostQuery,
  FetchPostQueryVariables,
} from '@org/graphql';
import getClient from '@poll-app/lib/api/registered-client';
import { PostsParams } from '../params';

export default async function EditPostPage(props: { params: PostsParams }) {
  const slug = (await props.params).slug;
  const { data } = await getClient().query<
    FetchPostQuery,
    FetchPostQueryVariables
  >(FetchPostDocument, {
    id: atob(decodeURIComponent(slug)),
  });

  if (!data) throw new Error('Post not found');

  return data && <div>Edit Post: {data?.post?.content.question}</div>;
}
