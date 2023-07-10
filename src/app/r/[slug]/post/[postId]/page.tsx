import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { db } from '@/lib/db';
import { formatTimeToNow } from '@/lib/utils';
import { Post, User, Vote } from '@prisma/client';
import { redis } from '@/lib/redis';
import CommentsSection from '@/components/CommentsSection';
import EditorOutput from '@/components/EditorOutput';
import PostVoteServer from '@/components/post-vote/PostVoteServer';
import type { CachedPost } from '@/types/redis';

interface PageProps {
  params: {
    postId: string;
  };
}

export const dynamic = 'force-dynamic';
export const forceCache = 'force-no-store';

const PostPage = async ({ params }: PageProps) => {
  const cachedPost = (await redis.hgetall(
    `post:${params.postId}`
  )) as CachedPost;

  let post:
    | (Post & {
        votes: Vote[];
        author: User;
      })
    | null = null;

  if (!cachedPost) {
    post = await db.post.findFirst({
      where: {
        id: params.postId,
      },
      include: {
        votes: true,
        author: true,
      },
    });
  }

  if (!post && !cachedPost) {
    return notFound();
  }

  const getData = async () => {
    return await db.post.findUnique({
      where: {
        id: params.postId,
      },
      include: {
        votes: true,
      },
    });
  };

  return (
    <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
      <Suspense fallback={<PostVoteShell />}>
        <PostVoteServer postId={post?.id ?? cachedPost.id} getData={getData} />
      </Suspense>

      <div className="sm:w-0 w-full flex-1 bg-white p-4 rounded-sm">
        {/* Metadata */}
        <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
          Posted by u/{post?.author.username ?? cachedPost.authorUsername} ·{' '}
          {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
        </p>

        {/* Title */}
        <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">
          {post?.title ?? cachedPost.title}
        </h1>

        {/* Content */}
        <EditorOutput content={post?.content ?? cachedPost.content} />

        <Suspense
          fallback={<Loader2 className="h-5 w-5 animate-spin text-zinc-500" />}
        >
          <CommentsSection postId={post ? post.id : cachedPost.id} />
        </Suspense>
      </div>
    </div>
  );
};

const PostVoteShell = () => {
  return (
    <div className="flex items-center flex-col pr-6 w-1">
      {/* Upvote */}
      <div
        className={buttonVariants({
          variant: 'ghost',
        })}
      >
        <ArrowBigUp className="h-5 w-5 text-zinc-700" />
      </div>

      {/* Vote Count */}
      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>

      {/* Downvote */}
      <div
        className={buttonVariants({
          variant: 'ghost',
        })}
      >
        <ArrowBigDown className="h-5 w-5 text-zinc-700" />
      </div>
    </div>
  );
};

export default PostPage;
