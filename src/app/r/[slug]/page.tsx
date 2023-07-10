import { notFound } from 'next/navigation';
import type { FC } from 'react';

import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import MiniCreatePost from '@/components/MiniCreatePost';
import PostFeed from '@/components/PostFeed';

interface PageProps {
  params: {
    slug: string;
  };
}

const SubredditPage: FC<PageProps> = async ({ params }) => {
  const { slug } = params;
  const session = await getAuthSession();
  const subreddit = await db.subreddit.findFirst({
    where: {
      name: slug,
    },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreddit: true,
        },

        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });
  if (!subreddit) {
    return notFound();
  }

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        r/{subreddit.name}
      </h1>

      <MiniCreatePost session={session} />
      <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />
    </>
  );
};

export default SubredditPage;
