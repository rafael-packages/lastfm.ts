import { BaseModule } from './BaseModule';
import * as Types from '../types';

/**
 * Album-specific API endpoints (album.*).
 */
export class AlbumModule extends BaseModule {
  /**
   * Get metadata and tracklist for an album.
   */
  public async getInfo(
    artist: string,
    album: string,
    username?: string
  ): Promise<Types.AlbumInfoResponse> {
    return this.request<Types.AlbumInfoResponse>('GET', {
      method: 'album.getInfo',
      artist,
      album,
      username,
    });
  }

  /**
   * Search for an album by name. Returns search results.
   */
  public async search(
    album: string,
    limit?: number,
    page?: number
  ): Promise<Types.AlbumSearchResponse> {
    return this.request<Types.AlbumSearchResponse>('GET', {
      method: 'album.search',
      album,
      limit,
      page,
    });
  }

  /**
   * Add tags to an album. Requires authentication.
   */
  public async addTags(
    sessionKey: string,
    artist: string,
    album: string,
    tags: string | string[]
  ): Promise<void> {
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
    await this.request(
      'POST',
      {
        method: 'album.addTags',
        sk: sessionKey,
        artist,
        album,
        tags: tagsStr,
      },
      true
    );
  }

  /**
   * Get tags applied to an album by an individual user.
   */
  public async getTags(
    artist: string,
    album: string,
    username?: string,
    mbid?: string
  ): Promise<Types.TagsResponse> {
    return this.request<Types.TagsResponse>('GET', {
      method: 'album.getTags',
      artist,
      album,
      user: username,
      mbid,
    });
  }

  /**
   * Get top tags for an album on Last.fm, ordered by popularity.
   */
  public async getTopTags(
    artist: string,
    album: string,
    mbid?: string
  ): Promise<Types.TopTagsResponse> {
    return this.request<Types.TopTagsResponse>('GET', {
      method: 'album.getTopTags',
      artist,
      album,
      mbid,
    });
  }

  /**
   * Remove a tag from an album. Requires authentication.
   */
  public async removeTag(
    sessionKey: string,
    artist: string,
    album: string,
    tag: string
  ): Promise<void> {
    await this.request(
      'POST',
      {
        method: 'album.removeTag',
        sk: sessionKey,
        artist,
        album,
        tag,
      },
      true
    );
  }
}
