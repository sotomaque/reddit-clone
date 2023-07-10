import { z } from 'zod';

import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const session = await getAuthSession();

    let followedCommunitiesIds: string[] = [];

    if (session) {
      const followedCommunities = await db.subscription.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          subreddit: true,
        },
      });

      followedCommunitiesIds = followedCommunities.map(
        ({ subreddit }) => subreddit.id
      );
    }

    const { limit, page, subredditName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subredditName: z.string().nullish().optional(),
      })
      .parse({
        subredditName: url.searchParams.get('subredditName'),
        limit: url.searchParams.get('limit'),
        page: url.searchParams.get('page'),
      });

    let whereClause = {};

    if (subredditName) {
      whereClause = {
        subreddit: {
          name: subredditName,
        },
      };
    } else if (session?.user) {
      // only match subreddits youre following if you are logged in
      whereClause = {
        subreddit: {
          id: {
            in: followedCommunitiesIds,
          },
        },
      };
    }

    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        subreddit: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    });

    return new Response(JSON.stringify(posts), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response('Failed to get posts', { status: 500 });
  }
}
