import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { PostValidator } from '@/lib/validators/post';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    const body = await req.json();
    const { subredditId, title, content } = PostValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        subredditId,
      },
    });

    if (!subscriptionExists) {
      return new Response('Subscribe to post', { status: 403 });
    }

    await db.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        subredditId,
      },
    });

    return new Response('Post created', { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response('Failed to post', { status: 500 });
  }
}
