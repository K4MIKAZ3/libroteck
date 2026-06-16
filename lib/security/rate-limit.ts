type RateLimitEntry = {
  failures: number;
  blockedUntil: number;
};

const buckets = new Map<string, RateLimitEntry>();

const MAX_ENTRIES = 5000;

function pruneBuckets(now: number) {
  if (buckets.size <= MAX_ENTRIES) {
    return;
  }

  for (const [key, entry] of buckets) {
    if (entry.blockedUntil <= now && entry.failures === 0) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkLoginRateLimit(request: Request) {
  const key = `login:${getClientIp(request)}`;
  const now = Date.now();
  pruneBuckets(now);

  const entry = buckets.get(key);
  if (entry && entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  return { allowed: true as const };
}

export function recordLoginFailure(request: Request) {
  const key = `login:${getClientIp(request)}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxFailures = 5;
  const blockMs = 15 * 60 * 1000;

  const entry = buckets.get(key) ?? { failures: 0, blockedUntil: 0 };
  entry.failures += 1;

  if (entry.failures >= maxFailures) {
    entry.blockedUntil = now + blockMs;
    entry.failures = 0;
  } else if (entry.blockedUntil <= now) {
    entry.blockedUntil = now + windowMs;
  }

  buckets.set(key, entry);
}

export function clearLoginFailures(request: Request) {
  buckets.delete(`login:${getClientIp(request)}`);
}
