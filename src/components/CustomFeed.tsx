import { db } from '@/lib/db';
import { Session } from 'next-auth';
import { FC } from 'react';
import PostFeed from './PostFeed';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';

interface CustomFeedProps {
  session: Session;
}

export const CustomFeed: FC<CustomFeedProps> = async ({ session }) => {
  const followedCommunities = await db.subscription.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      subreddit: true,
    },
  });

  const posts = await db.post.findMany({
    where: {
      subreddit: {
        name: {
          in: followedCommunities.map(({ subreddit }) => subreddit.id),
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLL_PAGINATION_RESULTS,
  });

  return <PostFeed initialPosts={posts} />;
};
