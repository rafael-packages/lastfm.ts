import { BaseModule } from './BaseModule';
import * as Types from '../types';

/**
 * Artist-specific API endpoints (artist.*).
 */
export class ArtistModule extends BaseModule {
  /**
   * Get metadata, statistics, tags and bio for an artist.
   */
  public async getInfo(artist: string, username?: string): Promise<Types.ArtistInfoResponse> {
    return this.request<Types.ArtistInfoResponse>('GET', {
      method: 'artist.getInfo',
      artist,
      username,
    });
  }

  /**
   * Get all similar artists ordered by similarity.
   */
  public async getSimilar(artist: string, limit?: number): Promise<Types.ArtistSimilarResponse> {
    return this.request<Types.ArtistSimilarResponse>('GET', {
      method: 'artist.getSimilar',
      artist,
      limit,
    });
  }

  /**
   * Search for an artist by name. Returns search results.
   */
  public async search(
    artist: string,
    limit?: number,
    page?: number
  ): Promise<Types.ArtistSearchResponse> {
    return this.request<Types.ArtistSearchResponse>('GET', {
      method: 'artist.search',
      artist,
      limit,
      page,
    });
  }

  /**
   * Add tags to an artist. Requires authentication.
   */
  public async addTags(sessionKey: string, artist: string, tags: string | string[]): Promise<void> {
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
    await this.request(
      'POST',
      {
        method: 'artist.addTags',
        sk: sessionKey,
        artist,
        tags: tagsStr,
      },
      true
    );
  }

  /**
   * Check for correction details or canonical naming of an artist name.
   */
  public async getCorrection(artist: string): Promise<Types.ArtistCorrectionResponse> {
    return this.request<Types.ArtistCorrectionResponse>('GET', {
      method: 'artist.getCorrection',
      artist,
    });
  }

  /**
   * Get tags applied to an artist by an individual user.
   */
  public async getTags(
    artist: string,
    username?: string,
    mbid?: string
  ): Promise<Types.TagsResponse> {
    return this.request<Types.TagsResponse>('GET', {
      method: 'artist.getTags',
      artist,
      user: username,
      mbid,
    });
  }

  /**
   * Get top albums for an artist, ordered by popularity.
   */
  public async getTopAlbums(
    artist: string,
    mbid?: string,
    limit?: number,
    page?: number
  ): Promise<Types.TopAlbumsResponse> {
    return this.request<Types.TopAlbumsResponse>('GET', {
      method: 'artist.getTopAlbums',
      artist,
      mbid,
      limit,
      page,
    });
  }

  /**
   * Get top tags for an artist, ordered by popularity.
   */
  public async getTopTags(artist: string, mbid?: string): Promise<Types.TopTagsResponse> {
    return this.request<Types.TopTagsResponse>('GET', {
      method: 'artist.getTopTags',
      artist,
      mbid,
    });
  }

  /**
   * Get top tracks for an artist, ordered by popularity.
   */
  public async getTopTracks(
    artist: string,
    mbid?: string,
    limit?: number,
    page?: number
  ): Promise<Types.TopTracksResponse> {
    return this.request<Types.TopTracksResponse>('GET', {
      method: 'artist.getTopTracks',
      artist,
      mbid,
      limit,
      page,
    });
  }

  /**
   * Remove a tag from an artist. Requires authentication.
   */
  public async removeTag(sessionKey: string, artist: string, tag: string): Promise<void> {
    await this.request(
      'POST',
      {
        method: 'artist.removeTag',
        sk: sessionKey,
        artist,
        tag,
      },
      true
    );
  }
}
