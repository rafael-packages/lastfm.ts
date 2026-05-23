import { BaseModule } from "./BaseModule";
import * as Types from "../types";

/**
 * Tag-specific API endpoints (tag.*).
 */
export class TagModule extends BaseModule {
  /**
   * Get metadata and description for a tag.
   */
  public async getInfo(
    tag: string,
    lang?: string,
  ): Promise<Types.TagInfoResponse> {
    return this.request<Types.TagInfoResponse>("GET", {
      method: "tag.getInfo",
      tag,
      lang,
    });
  }

  /**
   * Search for similar tags. Returns tags ranked by similarity.
   */
  public async getSimilar(tag: string): Promise<Types.TagSimilarResponse> {
    return this.request<Types.TagSimilarResponse>("GET", {
      method: "tag.getSimilar",
      tag,
    });
  }

  /**
   * Get the top albums tagged with a specific tag, ordered by popularity.
   */
  public async getTopAlbums(
    tag: string,
    limit?: number,
    page?: number,
  ): Promise<Types.TopAlbumsResponse> {
    return this.request<Types.TopAlbumsResponse>("GET", {
      method: "tag.getTopAlbums",
      tag,
      limit,
      page,
    });
  }

  /**
   * Get the top artists tagged with a specific tag, ordered by popularity.
   */
  public async getTopArtists(
    tag: string,
    limit?: number,
    page?: number,
  ): Promise<Types.TopArtistsResponse> {
    return this.request<Types.TopArtistsResponse>("GET", {
      method: "tag.getTopArtists",
      tag,
      limit,
      page,
    });
  }

  /**
   * Get top tags in Last.fm.
   */
  public async getTopTags(
    limit?: number,
    page?: number,
  ): Promise<Types.TopTagsResponse> {
    return this.request<Types.TopTagsResponse>("GET", {
      method: "tag.getTopTags",
      limit,
      page,
    });
  }

  /**
   * Get the top tracks tagged with a specific tag, ordered by popularity.
   */
  public async getTagTopTracks(
    tag: string,
    limit?: number,
    page?: number,
  ): Promise<Types.TopTracksResponse> {
    return this.request<Types.TopTracksResponse>("GET", {
      method: "tag.getTopTracks",
      tag,
      limit,
      page,
    });
  }

  /**
   * Get a list of available weekly charts for this tag.
   */
  public async getWeeklyChartList(
    tag: string,
  ): Promise<Types.WeeklyChartListResponse> {
    return this.request<Types.WeeklyChartListResponse>("GET", {
      method: "tag.getWeeklyChartList",
      tag,
    });
  }
}
