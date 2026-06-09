import { BaseModule } from './BaseModule';
import * as Types from '../types';

/**
 * User library-specific API endpoints (library.*).
 */
export class LibraryModule extends BaseModule {
  /**
   * Get a list of the artists in a user's library.
   */
  public async getArtists(
    user: string,
    limit?: number,
    page?: number
  ): Promise<Types.LibraryArtistsResponse> {
    return this.request<Types.LibraryArtistsResponse>('GET', {
      method: 'library.getArtists',
      user,
      limit,
      page,
    });
  }
}
