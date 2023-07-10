'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useIntersection } from '@mantine/hooks';
import { useRef, type FC } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import Post from './Post';
import type { ExtendedPost } from '@/types/db';

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName }) => {
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });
  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['inifite-posts'],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subredditName ? `&subredditName=${subredditName}` : '');
      const { data } = await axios.get(query);
      return data as ExtendedPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
    }
  );
  const { data: session } = useSession();
  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        const votesAmount = post.votes.reduce((acc, vote) => {
          if (vote.type === 'UP') {
            return acc + 1;
          } else {
            return acc - 1;
          }
        }, 0);

        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        );

        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                commentAmount={post.comments.length}
                post={post}
                subredditName={post.subreddit.name}
              />
            </li>
          );
        }

        return (
          <Post
            commentAmount={post.comments.length}
            key={post.id}
            post={post}
            subredditName={post.subreddit.name}
          />
        );
      })}
    </ul>
  );
};

export default PostFeed;
