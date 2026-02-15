import crypto from "crypto";
import {
  AlbumInfoResponse,
  AlbumSearchResponse,
  ArtistInfoResponse,
  ArtistSearchResponse,
  ArtistSimilarResponse,
  AuthSessionResponse,
  LastFmClientOptions,
  LastFmTrack,
  RecentTracksResponse,
  TagInfoResponse,
  TrackInfoResponse,
  TrackSearchResponse,
  TrackSimilarResponse,
  UserInfoResponse,
} from "./types";

export class LastFmClient {
  private apiKey: string;
  private apiSecret: string;
  private userAgent: string;
  private baseUrl = "https://ws.audioscrobbler.com/2.0/";

  constructor(options: LastFmClientOptions) {
    this.apiKey = options.apiKey;
    this.apiSecret = options.apiSecret;
    this.userAgent = options.userAgent || "LastFmClient/1.0.0";
  }

  private sign(params: Record<string, string | number | undefined>): string {
    const str =
      Object.keys(params)
        .sort()
        .filter((k) => params[k] !== undefined)
        .map((k) => `${k}${params[k]}`)
        .join("") + this.apiSecret;

    return crypto.createHash("md5").update(str).digest("hex");
  }

  private async request<T>(
    method: "GET" | "POST",
    params: Record<string, string | number | undefined>,
    signed = false,
  ): Promise<T> {
    const searchParams = new URLSearchParams();

    const allParams: Record<string, string> = {
      api_key: this.apiKey,
      format: "json",
      ...(params as any),
    };

    if (signed) {
      allParams.api_sig = this.sign(allParams);
    }

    for (const [key, value] of Object.entries(allParams)) {
      if (value !== undefined) searchParams.append(key, String(value));
    }

    if (method === "GET") {
      const url = `${this.baseUrl}?${searchParams.toString()}`;
      const res = await fetch(url, {
        headers: { "User-Agent": this.userAgent },
      });

      if (!res.ok) {
        throw new Error(`Last.fm API Error: ${res.status} ${res.statusText}`);
      }

      return (await res.json()) as T;
    } else {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        body: searchParams,
        headers: { "User-Agent": this.userAgent },
      });

      if (!res.ok) {
        throw new Error(`Last.fm API Error: ${res.status} ${res.statusText}`);
      }

      return (await res.json()) as T;
    }
  }

  public getAuthUrl(callbackUrl?: string): string {
    let url = `https://www.last.fm/api/auth/?api_key=${this.apiKey}`;
    if (callbackUrl) {
      url += `&cb=${encodeURIComponent(callbackUrl)}`;
    }
    return url;
  }

  public async getSession(token: string): Promise<AuthSessionResponse> {
    return this.request<AuthSessionResponse>("GET", { method: "auth.getSession", token }, true);
  }

  public async getUser(username: string): Promise<UserInfoResponse> {
    return this.request<UserInfoResponse>("GET", {
      method: "user.getInfo",
      user: username,
    });
  }

  // Track methods
  public async getRecentTracks(
    username: string,
    limit = 50,
    page = 1,
  ): Promise<RecentTracksResponse> {
    return this.request<RecentTracksResponse>("GET", {
      method: "user.getRecentTracks",
      user: username,
      limit,
      page,
    });
  }

  public async getNowPlaying(username: string): Promise<LastFmTrack | null> {
    const recentTracks = await this.getRecentTracks(username, 2);
    const track = recentTracks.recenttracks.track[0];

    if (track && track["@attr"]?.nowplaying === "true") {
      return track;
    }

    return null;
  }

  public async getTrackInfo(
    artist: string,
    track: string,
    username?: string,
  ): Promise<TrackInfoResponse> {
    return this.request<TrackInfoResponse>("GET", {
      method: "track.getInfo",
      artist,
      track,
      username,
    });
  }

  public async updateNowPlaying(
    sessionKey: string,
    artist: string,
    track: string,
    album?: string,
    duration?: number,
  ): Promise<void> {
    await this.request(
      "POST",
      {
        method: "track.updateNowPlaying",
        sk: sessionKey,
        artist,
        track,
        album,
        duration,
      },
      true,
    );
  }

  public async scrobble(
    sessionKey: string,
    artist: string,
    track: string,
    timestamp: number,
    album?: string,
  ): Promise<void> {
    await this.request(
      "POST",
      {
        method: "track.scrobble",
        sk: sessionKey,
        artist,
        track,
        timestamp,
        album,
      },
      true,
    );
  }

  // Album Methods
  public async getAlbumInfo(
    artist: string,
    album: string,
    username?: string,
  ): Promise<AlbumInfoResponse> {
    return this.request<AlbumInfoResponse>("GET", {
      method: "album.getInfo",
      artist,
      album,
      username,
    });
  }

  public async searchAlbum(
    album: string,
    limit?: number,
    page?: number,
  ): Promise<AlbumSearchResponse> {
    return this.request<AlbumSearchResponse>("GET", {
      method: "album.search",
      album,
      limit,
      page,
    });
  }

  // Artist Methods
  public async getArtistInfo(artist: string, username?: string): Promise<ArtistInfoResponse> {
    return this.request<ArtistInfoResponse>("GET", {
      method: "artist.getInfo",
      artist,
      username,
    });
  }

  public async getSimilarArtists(artist: string, limit?: number): Promise<ArtistSimilarResponse> {
    return this.request<ArtistSimilarResponse>("GET", {
      method: "artist.getSimilar",
      artist,
      limit,
    });
  }

  public async searchArtist(
    artist: string,
    limit?: number,
    page?: number,
  ): Promise<ArtistSearchResponse> {
    return this.request<ArtistSearchResponse>("GET", {
      method: "artist.search",
      artist,
      limit,
      page,
    });
  }

  // Track Methods
  public async getSimilarTracks(
    artist: string,
    track: string,
    limit?: number,
  ): Promise<TrackSimilarResponse> {
    return this.request<TrackSimilarResponse>("GET", {
      method: "track.getSimilar",
      artist,
      track,
      limit,
    });
  }

  public async searchTrack(
    track: string,
    limit?: number,
    page?: number,
  ): Promise<TrackSearchResponse> {
    return this.request<TrackSearchResponse>("GET", {
      method: "track.search",
      track,
      limit,
      page,
    });
  }

  // Tag Methods
  public async getTagInfo(tag: string, lang?: string): Promise<TagInfoResponse> {
    return this.request<TagInfoResponse>("GET", {
      method: "tag.getInfo",
      tag,
      lang,
    });
  }
}
