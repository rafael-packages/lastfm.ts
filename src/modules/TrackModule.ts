import { BaseModule } from "./BaseModule";
import * as Types from "../types";
import { ScrobbleItem } from "../utils/ScrobbleQueue";

/**
 * Track-specific API endpoints (track.*).
 */
export class TrackModule extends BaseModule {
  /**
   * Get metadata, playcount, tags and wiki for a track.
   */
  public async getInfo(
    artist: string,
    track: string,
    username?: string,
  ): Promise<Types.TrackInfoResponse> {
    return this.request<Types.TrackInfoResponse>("GET", {
      method: "track.getInfo",
      artist,
      track,
      username,
    });
  }

  /**
   * Get similar tracks ordered by similarity.
   */
  public async getSimilar(
    artist: string,
    track: string,
    limit?: number,
  ): Promise<Types.TrackSimilarResponse> {
    return this.request<Types.TrackSimilarResponse>("GET", {
      method: "track.getSimilar",
      artist,
      track,
      limit,
    });
  }

  /**
   * Search for a track by name. Returns search results.
   */
  public async search(
    track: string,
    limit?: number,
    page?: number,
  ): Promise<Types.TrackSearchResponse> {
    return this.request<Types.TrackSearchResponse>("GET", {
      method: "track.search",
      track,
      limit,
      page,
    });
  }

  /**
   * Update the "now playing" track on the user's profile. Requires authentication.
   */
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

  /**
   * Scrobble a single track. Requires authentication.
   */
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

  /**
   * Scrobbles multiple tracks in a single batch (up to 50 tracks). Requires authentication.
   * Utilizes index suffixes (e.g. artist[0], track[0], timestamp[0]).
   */
  public async scrobbleMany(
    sessionKey: string,
    items: ScrobbleItem[],
  ): Promise<any> {
    if (items.length === 0) return;
    if (items.length > 50) {
      throw new Error("Last.fm allows scrobbling a maximum of 50 tracks in a single batch request.");
    }

    const params: Record<string, string | number> = {
      method: "track.scrobble",
      sk: sessionKey,
    };

    items.forEach((item, index) => {
      params[`artist[${index}]`] = item.artist;
      params[`track[${index}]`] = item.track;
      params[`timestamp[${index}]`] = item.timestamp;
      if (item.album) {
        params[`album[${index}]`] = item.album;
      }
    });

    return this.request<any>("POST", params, true);
  }

  /**
   * Add tags to a track. Requires authentication.
   */
  public async addTags(
    sessionKey: string,
    artist: string,
    track: string,
    tags: string | string[],
  ): Promise<void> {
    const tagsStr = Array.isArray(tags) ? tags.join(",") : tags;
    await this.request(
      "POST",
      {
        method: "track.addTags",
        sk: sessionKey,
        artist,
        track,
        tags: tagsStr,
      },
      true,
    );
  }

  /**
   * Check for correction details or canonical naming of a track.
   */
  public async getCorrection(
    artist: string,
    track: string,
  ): Promise<Types.TrackCorrectionResponse> {
    return this.request<Types.TrackCorrectionResponse>("GET", {
      method: "track.getCorrection",
      artist,
      track,
    });
  }

  /**
   * Get tags applied to a track by an individual user.
   */
  public async getTags(
    artist: string,
    track: string,
    username?: string,
    mbid?: string,
  ): Promise<Types.TagsResponse> {
    return this.request<Types.TagsResponse>("GET", {
      method: "track.getTags",
      artist,
      track,
      user: username,
      mbid,
    });
  }

  /**
   * Get top tags for a track, ordered by popularity.
   */
  public async getTopTags(
    artist: string,
    track: string,
    mbid?: string,
  ): Promise<Types.TopTagsResponse> {
    return this.request<Types.TopTagsResponse>("GET", {
      method: "track.getTopTags",
      artist,
      track,
      mbid,
    });
  }

  /**
   * Love a track on the user's profile. Requires authentication.
   */
  public async love(
    sessionKey: string,
    artist: string,
    track: string,
  ): Promise<void> {
    await this.request(
      "POST",
      {
        method: "track.love",
        sk: sessionKey,
        artist,
        track,
      },
      true,
    );
  }

  /**
   * Remove a tag from a track. Requires authentication.
   */
  public async removeTag(
    sessionKey: string,
    artist: string,
    track: string,
    tag: string,
  ): Promise<void> {
    await this.request(
      "POST",
      {
        method: "track.removeTag",
        sk: sessionKey,
        artist,
        track,
        tag,
      },
      true,
    );
  }

  /**
   * Unlove a track on the user's profile. Requires authentication.
   */
  public async unlove(
    sessionKey: string,
    artist: string,
    track: string,
  ): Promise<void> {
    await this.request(
      "POST",
      {
        method: "track.unlove",
        sk: sessionKey,
        artist,
        track,
      },
      true,
    );
  }
}
