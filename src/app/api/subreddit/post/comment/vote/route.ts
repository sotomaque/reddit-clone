import { z } from 'zod';

import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';
import { CommentVoteValidator } from '@/lib/validators/vote';

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    const body = await req.json();
    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const existingVote = await db.commentVote.findFirst({
      where: {
        commentId,
        userId: session.user.id,
      },
    });

    // modify vote
    if (existingVote) {
      // if vote type matches -> delete vote
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
        });
        return new Response('Vote deleted', { status: 200 });
      }
      // otherwise update vote
      else {
        await db.commentVote.update({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
          data: {
            type: voteType,
          },
        });

        return new Response('Vote updated', { status: 200 });
      }
    }

    // create vote
    else {
      await db.commentVote.create({
        data: {
          type: voteType,
          userId: session.user.id,
          commentId,
        },
      });

      return new Response('Vote created', { status: 200 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response('Failed to vote', { status: 500 });
  }
}
