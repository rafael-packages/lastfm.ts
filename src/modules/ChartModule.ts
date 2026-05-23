import { BaseModule } from "./BaseModule";
import * as Types from "../types";

/**
 * Global chart-specific API endpoints (chart.*).
 */
export class ChartModule extends BaseModule {
  /**
   * Get the global top artists chart.
   */
  public async getTopArtists(
    limit?: number,
    page?: number,
  ): Promise<Types.TopArtistsResponse> {
    return this.request<Types.TopArtistsResponse>("GET", {
      method: "chart.getTopArtists",
      limit,
      page,
    });
  }

  /**
   * Get the global top tags chart.
   */
  public async getTopTags(
    limit?: number,
    page?: number,
  ): Promise<Types.TopTagsResponse> {
    return this.request<Types.TopTagsResponse>("GET", {
      method: "chart.getTopTags",
      limit,
      page,
    });
  }

  /**
   * Get the global top tracks chart.
   */
  public async getTopTracks(
    limit?: number,
    page?: number,
  ): Promise<Types.TopTracksResponse> {
    return this.request<Types.TopTracksResponse>("GET", {
      method: "chart.getTopTracks",
      limit,
      page,
    });
  }
}
