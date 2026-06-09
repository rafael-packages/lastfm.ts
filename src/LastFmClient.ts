import crypto from 'crypto';
import { LastFmClientOptions } from './types';
import { LastFmApiError, LastFmNetworkError, LastFmValidationError } from './errors/LastFmError';
import { RateLimiter } from './utils/RateLimiter';
import { CacheStore } from './utils/CacheStore';

// Submodules
import { AlbumModule } from './modules/AlbumModule';
import { ArtistModule } from './modules/ArtistModule';
import { AuthModule } from './modules/AuthModule';
import { ChartModule } from './modules/ChartModule';
import { GeoModule } from './modules/GeoModule';
import { LibraryModule } from './modules/LibraryModule';
import { TagModule } from './modules/TagModule';
import { TrackModule } from './modules/TrackModule';
import { UserModule } from './modules/UserModule';

export interface RequestConfig {
  method: 'GET' | 'POST';
  params: Record<string, string | number | boolean | undefined>;
  signed: boolean;
  headers: Record<string, string>;
  url: string;
}

export class InterceptorManager<T> {
  private handlers: Array<T | null> = [];

  public use(handler: T): number {
    this.handlers.push(handler);
    return this.handlers.length - 1;
  }

  public eject(id: number): void {
    if (this.handlers[id] !== undefined) {
      this.handlers[id] = null;
    }
  }

  public get(): T[] {
    return this.handlers.filter((h): h is T => h !== null);
  }
}

export class LastFmClient {
  private apiKey: string;
  private apiSecret: string;
  private userAgent: string;
  private baseUrl = 'https://ws.audioscrobbler.com/2.0/';

  // Utilities
  private rateLimiter: RateLimiter | null = null;
  private cacheStore: CacheStore | null = null;
  private cacheTtlMs: number;

  // Interceptors
  public readonly interceptors = {
    request: new InterceptorManager<
      (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
    >(),
    response: new InterceptorManager<(response: unknown) => unknown | Promise<unknown>>(),
    error: new InterceptorManager<(error: unknown) => unknown | Promise<unknown>>(),
  };

  // Submodules
  public readonly albums: AlbumModule;
  public readonly artists: ArtistModule;
  public readonly auth: AuthModule;
  public readonly charts: ChartModule;
  public readonly geo: GeoModule;
  public readonly library: LibraryModule;
  public readonly tags: TagModule;
  public readonly tracks: TrackModule;
  public readonly users: UserModule;

  constructor(options: LastFmClientOptions) {
    if (!options.apiKey || !options.apiSecret) {
      throw new LastFmValidationError(
        'API Key and API Secret are required to initialize LastFmClient.'
      );
    }

    this.apiKey = options.apiKey;
    this.apiSecret = options.apiSecret;
    this.userAgent = options.userAgent || 'LastFmClient/2.0.0';

    // Rate limiting
    const useRateLimiter = options.rateLimiting ?? true;
    if (useRateLimiter) {
      this.rateLimiter = new RateLimiter(
        options.rateLimitMax ?? 5,
        options.rateLimitIntervalMs ?? 1000
      );
    }

    // Cache
    this.cacheTtlMs = options.cacheTtlMs ?? 300_000;
    if (this.cacheTtlMs > 0) {
      this.cacheStore = new CacheStore(this.cacheTtlMs);
    }

    this.albums = new AlbumModule(this);
    this.artists = new ArtistModule(this);
    this.auth = new AuthModule(this);
    this.charts = new ChartModule(this);
    this.geo = new GeoModule(this);
    this.library = new LibraryModule(this);
    this.tags = new TagModule(this);
    this.tracks = new TrackModule(this);
    this.users = new UserModule(this);
  }

  // Get authentication URL
  public getAuthUrl(callbackUrl?: string): string {
    let url = `https://www.last.fm/api/auth/?api_key=${this.apiKey}`;
    if (callbackUrl) {
      url += `&cb=${encodeURIComponent(callbackUrl)}`;
    }
    return url;
  }

  // Generates request signature
  private sign(params: Record<string, string | number | boolean | undefined>): string {
    const str =
      Object.keys(params)
        .sort()
        .filter((k) => params[k] !== undefined)
        .map((k) => `${k}${params[k]}`)
        .join('') + this.apiSecret;

    return crypto.createHash('md5').update(str).digest('hex');
  }

  // Sends request to Last.fm API
  public async request<T>(
    method: 'GET' | 'POST',
    params: Record<string, string | number | boolean | undefined>,
    signed = false
  ): Promise<T> {
    const allParams: Record<string, string | number | boolean | undefined> = {
      api_key: this.apiKey,
      format: 'json',
      ...params,
    };

    if (signed) {
      allParams.api_sig = this.sign(allParams);
    }

    let config: RequestConfig = {
      method,
      params: allParams,
      signed,
      headers: { 'User-Agent': this.userAgent },
      url: this.baseUrl,
    };

    for (const interceptor of this.interceptors.request.get()) {
      config = await interceptor(config);
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(config.params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }

    const fullUrl =
      config.method === 'GET' ? `${config.url}?${searchParams.toString()}` : config.url;

    // Cache check
    let cacheKey = '';
    if (config.method === 'GET' && this.cacheStore) {
      cacheKey = this.generateCacheKey(config.params);
      const cached = this.cacheStore.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const fetchTask = async (): Promise<T> => {
      const fetchOptions: RequestInit = {
        method: config.method,
        headers: config.headers,
      };

      if (config.method === 'POST') {
        fetchOptions.body = searchParams;
      }

      const res = await fetch(fullUrl, fetchOptions);

      if (!res.ok) {
        throw new LastFmNetworkError(res.status, res.statusText);
      }

      const data = (await res.json()) as Record<string, unknown>;

      if (data && typeof data === 'object' && 'error' in data) {
        throw new LastFmApiError(Number(data.error), String(data.message));
      }

      if (config.method === 'GET' && this.cacheStore) {
        this.cacheStore.set(cacheKey, data);
      }

      return data as T;
    };

    try {
      let rawResult: T;
      if (this.rateLimiter) {
        rawResult = await this.rateLimiter.schedule(fetchTask);
      } else {
        rawResult = await fetchTask();
      }

      let processedResult: unknown = rawResult;
      for (const interceptor of this.interceptors.response.get()) {
        processedResult = await interceptor(processedResult);
      }

      return processedResult as T;
    } catch (err) {
      let processedError = err;
      for (const interceptor of this.interceptors.error.get()) {
        processedError = await interceptor(processedError);
      }
      throw processedError;
    }
  }

  // Generates deterministic cache key from parameters
  private generateCacheKey(params: Record<string, unknown>): string {
    const sortedKeys = Object.keys(params).sort();
    const cleanParams = sortedKeys.reduce(
      (acc, key) => {
        if (params[key] !== undefined) {
          acc[key] = params[key];
        }
        return acc;
      },
      {} as Record<string, unknown>
    );
    return JSON.stringify(cleanParams);
  }

  public clearCache(): void {
    if (this.cacheStore) {
      this.cacheStore.clear();
    }
  }

  public destroy(): void {
    if (this.rateLimiter) {
      this.rateLimiter.destroy();
    }
    if (this.cacheStore) {
      this.cacheStore.destroy();
    }
  }
}
