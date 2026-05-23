export interface ScrobbleItem {
  artist: string;
  track: string;
  timestamp: number;
  album?: string;
}

export interface ScrobbleQueueOptions {
  batchSize?: number;
  autoFlushIntervalMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class ScrobbleQueue {
  private queue: ScrobbleItem[] = [];
  private batchSize: number;
  private autoFlushIntervalMs?: number;
  private maxRetries: number;
  private retryDelayMs: number;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private scrobbleFn: (items: ScrobbleItem[]) => Promise<unknown>;
  private isFlushing = false;

  public onFlushSuccess?: (items: ScrobbleItem[], response: unknown) => void;
  public onFlushError?: (items: ScrobbleItem[], error: Error) => void;
  public onQueueChanged?: (size: number) => void;

  constructor(
    scrobbleFn: (items: ScrobbleItem[]) => Promise<unknown>,
    options: ScrobbleQueueOptions = {},
  ) {
    this.scrobbleFn = scrobbleFn;
    this.batchSize = options.batchSize ?? 50;
    this.autoFlushIntervalMs = options.autoFlushIntervalMs;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 1000;

    if (this.autoFlushIntervalMs) {
      this.startAutoFlush();
    }
  }

  public add(item: ScrobbleItem | ScrobbleItem[]): void {
    if (Array.isArray(item)) {
      this.queue.push(...item);
    } else {
      this.queue.push(item);
    }

    this.notifyQueueChange();

    if (this.queue.length >= this.batchSize) {
      this.flush().catch(() => {});
    }
  }

  public get size(): number {
    return this.queue.length;
  }

  private startAutoFlush(): void {
    if (this.flushTimer || !this.autoFlushIntervalMs) return;

    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0 && !this.isFlushing) {
        this.flush().catch(() => {});
      }
    }, this.autoFlushIntervalMs);
  }

  private stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  public async flush(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) return;

    this.isFlushing = true;

    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.batchSize);
        this.notifyQueueChange();

        try {
          const res = await this.sendBatchWithRetry(batch);
          if (this.onFlushSuccess) {
            this.onFlushSuccess(batch, res);
          }
        } catch (err) {
          this.queue.unshift(...batch);
          this.notifyQueueChange();

          const error = err instanceof Error ? err : new Error(String(err));
          if (this.onFlushError) {
            this.onFlushError(batch, error);
          }
          throw error;
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private async sendBatchWithRetry(
    batch: ScrobbleItem[],
    attempt = 1,
  ): Promise<unknown> {
    try {
      return await this.scrobbleFn(batch);
    } catch (err) {
      if (attempt >= this.maxRetries) {
        throw err;
      }

      const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.sendBatchWithRetry(batch, attempt + 1);
    }
  }

  private notifyQueueChange(): void {
    if (this.onQueueChanged) {
      this.onQueueChanged(this.queue.length);
    }
  }

  public destroy(): void {
    this.stopAutoFlush();
    this.queue = [];
    this.notifyQueueChange();
  }
}
