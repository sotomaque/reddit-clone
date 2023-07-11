import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    if (!query) {
      return new Response('Invalid query', { status: 400 });
    }

    const results = await db.subreddit.findMany({
      where: {
        name: {
          startsWith: query,
        },
      },
      include: {
        _count: true,
      },
      take: 5,
    });

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    return new Response('Search Failed.', { status: 500 });
  }
}
