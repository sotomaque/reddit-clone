import { z } from 'zod';

import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';
import { PostVoteValidator } from '@/lib/validators/vote';
import { redis } from '@/lib/redis';
import type { CachedPost } from '@/types/redis';

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    const body = await req.json();
    const { postId, voteType } = PostVoteValidator.parse(body);

    const existingVote = await db.vote.findFirst({
      where: {
        postId,
        userId: session.user.id,
      },
    });

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    // modify vote
    if (existingVote) {
      // if vote type matches -> delete vote
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
        });
        return new Response('Vote deleted', { status: 200 });
      }
      // otherwise update vote
      else {
        await db.vote.update({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
          data: {
            type: voteType,
          },
        });

        // recount votes (check threshold)
        const votesAmount = post.votes.reduce((acc, vote) => {
          if (vote.type === 'UP') {
            return acc + 1;
          } else {
            return acc - 1;
          }
        }, 0);

        if (votesAmount >= CACHE_AFTER_UPVOTES) {
          const cachePayload: CachedPost = {
            authorUsername: post.author.username || '',
            content: JSON.stringify(post.content),
            id: post.id,
            title: post.title,
            currentVote: voteType,
            createdAt: post.createdAt,
          };

          await redis.hset(`post:${post.id}`, cachePayload);
        }
        return new Response('Vote updated', { status: 200 });
      }
    }

    // create vote
    else {
      await db.vote.create({
        data: {
          type: voteType,
          userId: session.user.id,
          postId,
        },
      });

      const votesAmount = post.votes.reduce((acc, vote) => {
        if (vote.type === 'UP') {
          return acc + 1;
        } else {
          return acc - 1;
        }
      }, 0);

      if (votesAmount >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          authorUsername: post.author.username || '',
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          currentVote: voteType,
          createdAt: post.createdAt,
        };

        await redis.hset(`post:${post.id}`, cachePayload);
      }
      return new Response('Vote created', { status: 200 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response('Failed to vote', { status: 500 });
  }
}
