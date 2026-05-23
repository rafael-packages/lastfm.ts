export class RateLimiter {
  private limit: number;
  private interval: number;
  private tokens: number;
  private lastRefill: number;
  private queue: Array<{
    resolve: () => void;
    reject: (err: Error) => void;
  }> = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(limit = 5, interval = 1000) {
    this.limit = limit;
    this.interval = interval;
    this.tokens = limit;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;

    if (elapsed >= this.interval) {
      this.tokens = this.limit;
      this.lastRefill = now;
    } else {
      const refillAmount = (elapsed / this.interval) * this.limit;
      this.tokens = Math.min(this.limit, this.tokens + refillAmount);
      this.lastRefill = now;
    }
  }

  public async schedule<T>(task: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await task();
    } finally {
      this.processQueue();
    }
  }

  private acquire(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.refill();

      if (this.tokens >= 1) {
        this.tokens -= 1;
        resolve();
      } else {
        this.queue.push({ resolve, reject });
        this.scheduleNextRefill();
      }
    });
  }

  private scheduleNextRefill(): void {
    if (this.timer || this.queue.length === 0) {
      return;
    }

    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const timeToNextToken = Math.max(0, this.interval / this.limit - elapsed);

    this.timer = setTimeout(() => {
      this.timer = null;
      this.processQueue();
    }, timeToNextToken);
  }

  private processQueue(): void {
    this.refill();

    while (this.queue.length > 0 && this.tokens >= 1) {
      this.tokens -= 1;
      const next = this.queue.shift();
      if (next) {
        next.resolve();
      }
    }

    if (this.queue.length > 0) {
      this.scheduleNextRefill();
    }
  }

  public destroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const pending = [...this.queue];
    this.queue = [];
    for (const p of pending) {
      p.reject(new Error("RateLimiter was destroyed."));
    }
  }
}
