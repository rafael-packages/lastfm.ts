import { describe, expect, it, mock, spyOn, beforeEach, afterEach } from "bun:test";
import { LastFmClient } from "../src/LastFmClient";
import { LastFmApiError, LastFmNetworkError, LastFmValidationError } from "../src/errors/LastFmError";
import { CacheStore } from "../src/utils/CacheStore";
import { RateLimiter } from "../src/utils/RateLimiter";
import { ScrobbleQueue } from "../src/utils/ScrobbleQueue";

describe("lastfm.ts", () => {

  describe("CacheStore", () => {
    it("sets and gets values within TTL", () => {
      const store = new CacheStore(50); // 50ms TTL
      store.set("test-key", { hello: "world" });
      expect(store.get<any>("test-key")).toEqual({ hello: "world" });
      store.destroy();
    });

    it("returns null and deletes expired values", async () => {
      const store = new CacheStore(10); // 10ms TTL
      store.set("test-key", { hello: "world" });
      
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(store.get("test-key")).toBeNull();
      store.destroy();
    });

    it("manually sweeps expired entries", async () => {
      const store = new CacheStore(10, 5); // 10ms TTL, 5ms sweep interval
      store.set("key1", "val1");
      
      await new Promise(resolve => setTimeout(resolve, 20));
      // Entries should be gone after sweep
      expect(store.get("key1")).toBeNull();
      store.destroy();
    });
  });

  describe("RateLimiter", () => {
    it("executes immediately if under limit", async () => {
      const limiter = new RateLimiter(5, 1000);
      const start = Date.now();
      const res = await limiter.schedule(async () => "done");
      expect(res).toBe("done");
      expect(Date.now() - start).toBeLessThan(100);
      limiter.destroy();
    });

    it("queues requests when limit is reached", async () => {
      // 2 tokens per 200ms
      const limiter = new RateLimiter(2, 200);
      
      const start = Date.now();
      const p1 = limiter.schedule(async () => 1);
      const p2 = limiter.schedule(async () => 2);
      const p3 = limiter.schedule(async () => 3); // Must wait for refill
      
      await Promise.all([p1, p2, p3]);
      const duration = Date.now() - start;
      
      // Third request must have been delayed by around 100-200ms
      expect(duration).toBeGreaterThanOrEqual(100);
      limiter.destroy();
    });
  });

  describe("ScrobbleQueue", () => {
    it("batches tracks and flushes", async () => {
      let batchedItems: any[] = [];
      const mockScrobbler = async (items: any[]) => {
        batchedItems = items;
        return { scrobbles: { "@attr": { accepted: items.length } } };
      };

      const queue = new ScrobbleQueue(mockScrobbler, { batchSize: 5 });
      queue.add({ artist: "Artist 1", track: "Track 1", timestamp: 1000 });
      queue.add({ artist: "Artist 2", track: "Track 2", timestamp: 1001 });
      
      expect(queue.size).toBe(2);
      
      await queue.flush();
      
      expect(queue.size).toBe(0);
      expect(batchedItems.length).toBe(2);
      expect(batchedItems[0].track).toBe("Track 1");
      queue.destroy();
    });

    it("retries with exponential backoff on error", async () => {
      let attempts = 0;
      const mockFailedScrobbler = async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error("Temporary network error");
        }
        return { ok: true };
      };

      const queue = new ScrobbleQueue(mockFailedScrobbler, {
        batchSize: 2,
        maxRetries: 3,
        retryDelayMs: 10,
      });

      queue.add({ artist: "A", track: "T", timestamp: 100 });
      
      await queue.flush();
      expect(attempts).toBe(2);
      expect(queue.size).toBe(0);
      queue.destroy();
    });
  });

  describe("interceptors", () => {
    it("intercepts requests to inject headers and params", async () => {
      const client = new LastFmClient({
        apiKey: "test-key",
        apiSecret: "test-secret",
        rateLimiting: false,
        cacheTtlMs: 0,
      });

      client.interceptors.request.use((config) => {
        config.headers["X-Custom-Header"] = "Hello-Portfoliio";
        config.params["injected_param"] = "injected_value";
        return config;
      });

      // Stub fetch to prevent actual network calls
      const globalFetchSpy = spyOn(globalThis, "fetch").mockImplementation((async (url: any, options: any) => {
        expect(options.headers["X-Custom-Header"]).toBe("Hello-Portfoliio");
        expect(url.toString()).toContain("injected_param=injected_value");
        return {
          ok: true,
          json: async () => ({ status: "intercepted" })
        } as any;
      }) as any);

      const res = await client.users.getInfo("realkalashnikov");
      expect(res).toEqual({ status: "intercepted" } as any);
      
      globalFetchSpy.mockRestore();
      client.destroy();
    });
  });

  describe("client errors", () => {
    it("throws validation error if api credentials are missing", () => {
      expect(() => new LastFmClient({ apiKey: "", apiSecret: "sec" })).toThrow(LastFmValidationError);
    });

    it("throws LastFmApiError for API error responses", async () => {
      const client = new LastFmClient({
        apiKey: "bad-key",
        apiSecret: "sec",
        rateLimiting: false,
        cacheTtlMs: 0,
      });

      const globalFetchSpy = spyOn(globalThis, "fetch").mockImplementation((async () => {
        return {
          ok: true,
          json: async () => ({ error: 9, message: "Invalid API key - You must be logged in" })
        } as any;
      }) as any);

      expect(client.users.getInfo("any")).rejects.toThrow(LastFmApiError);
      
      globalFetchSpy.mockRestore();
      client.destroy();
    });
  });

  describe("pagination generator", () => {
    it("iterates through pages using async generator", async () => {
      const client = new LastFmClient({
        apiKey: "key",
        apiSecret: "sec",
        rateLimiting: false,
        cacheTtlMs: 0,
      });

      let mockApiCallCount = 0;
      spyOn(client.users, "getRecentTracks").mockImplementation(async (user: string, limit = 50, page = 1) => {
        mockApiCallCount++;
        if (page === 1) {
          return {
            recenttracks: {
              track: [{ name: "Track A", artist: { name: "Artist A" } } as any],
              "@attr": { page: "1", perPage: "1", totalPages: "2", total: "2", user }
            }
          };
        } else {
          return {
            recenttracks: {
              track: [{ name: "Track B", artist: { name: "Artist B" } } as any],
              "@attr": { page: "2", perPage: "1", totalPages: "2", total: "2", user }
            }
          };
        }
      });

      const tracksCollected: string[] = [];
      for await (const track of client.users.getRecentTracksIterator("realkalashnikov")) {
        tracksCollected.push(track.name);
      }

      expect(tracksCollected).toEqual(["Track A", "Track B"]);
      expect(mockApiCallCount).toBe(2);
      client.destroy();
    });
  });
});
