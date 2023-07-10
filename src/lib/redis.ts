import { Redis } from '@upstash/redis';

import { env } from '@/lib/env.mjs';

export const redis = new Redis({
  url: env.REDIS_URL,
  token: env.REDIS_SECRET,
});
