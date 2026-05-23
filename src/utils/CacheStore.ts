interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheStore {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTtl: number;
  private sweepInterval: ReturnType<typeof setInterval> | null = null;

  constructor(defaultTtlMs = 300_000, sweepIntervalMs = 60_000) {
    this.defaultTtl = defaultTtlMs;
    this.sweepInterval = setInterval(() => this.sweep(), sweepIntervalMs);
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs !== undefined ? ttlMs : this.defaultTtl;
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, { value, expiresAt });
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public sweep(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  public destroy(): void {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
    this.clear();
  }
}
