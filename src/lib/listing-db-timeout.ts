const DEFAULT_MS = 2500;

export function listingsDbTimeoutMs(): number {
  const raw = process.env.LISTINGS_DB_TIMEOUT_MS;
  if (!raw) {
    return DEFAULT_MS;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MS;
}

export function shouldSkipListingsDb(): boolean {
  const flag = process.env.LISTINGS_SKIP_DB?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

export function withListingsDbTimeout<T>(promise: Promise<T>): Promise<T> {
  const ms = listingsDbTimeoutMs();
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Database query timed out after ${ms}ms`)), ms);
    }),
  ]);
}
