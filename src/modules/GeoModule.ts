import { BaseModule } from "./BaseModule";
import * as Types from "../types";

/**
 * Geo-specific API endpoints (geo.*).
 */
export class GeoModule extends BaseModule {
  /**
   * Get the most popular artists on Last.fm by country.
   */
  public async getTopArtists(
    country: string,
    limit?: number,
    page?: number,
  ): Promise<Types.TopArtistsResponse> {
    return this.request<Types.TopArtistsResponse>("GET", {
      method: "geo.getTopArtists",
      country,
      limit,
      page,
    });
  }

  /**
   * Get the most popular tracks on Last.fm by country.
   */
  public async getTopTracks(
    country: string,
    location?: string,
    limit?: number,
    page?: number,
  ): Promise<Types.TopTracksResponse> {
    return this.request<Types.TopTracksResponse>("GET", {
      method: "geo.getTopTracks",
      country,
      location,
      limit,
      page,
    });
  }
}
