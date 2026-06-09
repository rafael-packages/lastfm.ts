import { BaseModule } from './BaseModule';
import * as Types from '../types';

/**
 * User-specific API endpoints (user.*).
 */
export class UserModule extends BaseModule {
  /**
   * Get information about a user's profile.
   */
  public async getInfo(username: string): Promise<Types.UserInfoResponse> {
    return this.request<Types.UserInfoResponse>('GET', {
      method: 'user.getInfo',
      user: username,
    });
  }

  /**
   * Get a list of the recent tracks listened to by this user.
   */
  public async getRecentTracks(
    username: string,
    limit = 50,
    page = 1
  ): Promise<Types.RecentTracksResponse> {
    return this.request<Types.RecentTracksResponse>('GET', {
      method: 'user.getRecentTracks',
      user: username,
      limit,
      page,
    });
  }

  /**
   * Iterates through all pages of recent tracks using an async generator.
   */
  public async *getRecentTracksIterator(
    username: string,
    limit = 50
  ): AsyncGenerator<Types.LastFmTrack, void, unknown> {
    let page = 1;
    while (true) {
      const response = await this.getRecentTracks(username, limit, page);
      const tracks = response.recenttracks.track;
      if (!tracks || tracks.length === 0) {
        break;
      }
      for (const track of tracks) {
        yield track;
      }
      const attr = response.recenttracks['@attr'];
      if (!attr || Number(attr.page) >= Number(attr.totalPages)) {
        break;
      }
      page++;
    }
  }

  /**
   * Get the track currently being played by the user. Returns null if none is playing.
   */
  public async getNowPlaying(username: string): Promise<Types.LastFmTrack | null> {
    const recentTracks = await this.getRecentTracks(username, 2);
    const track = recentTracks.recenttracks.track[0];

    if (track && track['@attr']?.nowplaying === 'true') {
      return track;
    }

    return null;
  }

  /**
   * Get a list of the user's friends on Last.fm.
   */
  public async getFriends(
    username: string,
    recenttracks?: boolean,
    limit?: number,
    page?: number
  ): Promise<Types.UserFriendsResponse> {
    return this.request<Types.UserFriendsResponse>('GET', {
      method: 'user.getFriends',
      user: username,
      recenttracks: recenttracks ? 1 : 0,
      limit,
      page,
    });
  }

  /**
   * Get the tracks loved by a user on Last.fm.
   */
  public async getLovedTracks(
    username: string,
    limit?: number,
    page?: number
  ): Promise<Types.LovedTracksResponse> {
    return this.request<Types.LovedTracksResponse>('GET', {
      method: 'user.getLovedTracks',
      user: username,
      limit,
      page,
    });
  }

  /**
   * Iterates through all pages of loved tracks using an async generator.
   */
  public async *getLovedTracksIterator(
    username: string,
    limit = 50
  ): AsyncGenerator<any, void, unknown> {
    let page = 1;
    while (true) {
      const response = await this.getLovedTracks(username, limit, page);
      const tracks = response.lovedtracks.track;
      if (!tracks || tracks.length === 0) {
        break;
      }
      for (const track of tracks) {
        yield track;
      }
      const attr = response.lovedtracks['@attr'];
      if (!attr || Number(attr.page) >= Number(attr.totalPages)) {
        break;
      }
      page++;
    }
  }

  /**
   * Get user's personal tags (artist, album, or track taggings).
   */
  public async getPersonalTags(
    username: string,
    tag: string,
    taggingtype: 'artist' | 'album' | 'track',
    limit?: number,
    page?: number
  ): Promise<Types.PersonalTagsResponse> {
    return this.request<Types.PersonalTagsResponse>('GET', {
      method: 'user.getPersonalTags',
      user: username,
      tag,
      taggingtype,
      limit,
      page,
    });
  }

  /**
   * Get the top albums listened to by a user.
   */
  public async getTopAlbums(
    username: string,
    limit?: number,
    page?: number,
    period?: string
  ): Promise<Types.TopAlbumsResponse> {
    return this.request<Types.TopAlbumsResponse>('GET', {
      method: 'user.getTopAlbums',
      user: username,
      limit,
      page,
      period,
    });
  }

  /**
   * Get the top artists listened to by a user.
   */
  public async getTopArtists(
    username: string,
    limit?: number,
    page?: number,
    period?: string
  ): Promise<Types.TopArtistsResponse> {
    return this.request<Types.TopArtistsResponse>('GET', {
      method: 'user.getTopArtists',
      user: username,
      limit,
      page,
      period,
    });
  }

  /**
   * Iterates through all pages of top artists using an async generator.
   */
  public async *getTopArtistsIterator(
    username: string,
    limit = 50,
    period?: string
  ): AsyncGenerator<any, void, unknown> {
    let page = 1;
    while (true) {
      const response = await this.getTopArtists(username, limit, page, period);
      const artists = response.topartists.artist;
      if (!artists || artists.length === 0) {
        break;
      }
      for (const artist of artists) {
        yield artist;
      }
      const attr = response.topartists['@attr'];
      if (!attr || Number(attr.page) >= Number(attr.totalPages)) {
        break;
      }
      page++;
    }
  }

  /**
   * Get the top tags used by a user.
   */
  public async getTopTags(username: string, limit?: number): Promise<Types.TopTagsResponse> {
    return this.request<Types.TopTagsResponse>('GET', {
      method: 'user.getTopTags',
      user: username,
      limit,
    });
  }

  /**
   * Get the top tracks listened to by a user.
   */
  public async getTopTracks(
    username: string,
    limit?: number,
    page?: number,
    period?: string
  ): Promise<Types.TopTracksResponse> {
    return this.request<Types.TopTracksResponse>('GET', {
      method: 'user.getTopTracks',
      user: username,
      limit,
      page,
      period,
    });
  }

  /**
   * Get weekly album chart of a user.
   */
  public async getWeeklyAlbumChart(
    username: string,
    from?: string,
    to?: string
  ): Promise<Types.WeeklyAlbumChartResponse> {
    return this.request<Types.WeeklyAlbumChartResponse>('GET', {
      method: 'user.getWeeklyAlbumChart',
      user: username,
      from,
      to,
    });
  }

  /**
   * Get weekly artist chart of a user.
   */
  public async getWeeklyArtistChart(
    username: string,
    from?: string,
    to?: string
  ): Promise<Types.WeeklyArtistChartResponse> {
    return this.request<Types.WeeklyArtistChartResponse>('GET', {
      method: 'user.getWeeklyArtistChart',
      user: username,
      from,
      to,
    });
  }

  /**
   * Get list of weekly chart intervals for a user.
   */
  public async getWeeklyChartList(username: string): Promise<Types.WeeklyChartListResponse> {
    return this.request<Types.WeeklyChartListResponse>('GET', {
      method: 'user.getWeeklyChartList',
      user: username,
    });
  }

  /**
   * Get weekly track chart of a user.
   */
  public async getWeeklyTrackChart(
    username: string,
    from?: string,
    to?: string
  ): Promise<Types.WeeklyTrackChartResponse> {
    return this.request<Types.WeeklyTrackChartResponse>('GET', {
      method: 'user.getWeeklyTrackChart',
      user: username,
      from,
      to,
    });
  }
}
