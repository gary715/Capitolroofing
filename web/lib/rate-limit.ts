interface RateBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateBucket>();

// Clean stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  userId: string,
  opts: { maxRequests: number; windowMs: number } = {
    maxRequests: 20,
    windowMs: 60_000,
  }
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const key = `ai:${userId}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true };
  }

  if (bucket.count >= opts.maxRequests) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count++;
  return { allowed: true };
}
