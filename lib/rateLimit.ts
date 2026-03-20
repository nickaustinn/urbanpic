const hits = new Map<string, { count: number; resetAt: number }>();

const MAX_REQUESTS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_REQUESTS;
}
