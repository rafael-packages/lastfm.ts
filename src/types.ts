export type LastFmImage = {
  size: 'small' | 'medium' | 'large' | 'extralarge';
  '#text': string;
};

export type LastFmArtistRef = {
  mbid: string;
  name: string;
  '#text': string;
  url?: string;
};

export type LastFmAlbumRef = {
  '#text': string;
  mbid: string;
};

export type LastFmTrack = {
  name: string;
  mbid: string;
  url: string;
  artist: LastFmArtistRef;
  album: LastFmAlbumRef;
  playcount: number | string;
  duration?: string;
  image?: LastFmImage[];
  date?: {
    uts: string;
    '#text': string;
  };
  '@attr'?: {
    nowplaying: 'true' | 'false';
  };
};

export type LastFmUser = {
  user: {
    id: string;
    name: string;
    realname: string;
    gender: string;
    country: string;
    url: string;
    playcount: string;
    playlists: string;
    bootstrap: string;
    image: LastFmImage[];
    registered: {
      unixtime: string;
      '#text': number;
    };
  };
};

export type TrackInfoResponse = {
  track: LastFmTrack;
};

export type RecentTracksResponse = {
  recenttracks: {
    track: LastFmTrack[];
    '@attr': {
      user: string;
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
};

export type AuthSessionResponse = {
  session: {
    name: string;
    key: string;
    subscriber: number;
  };
};

export type UserInfoResponse = LastFmUser;

export interface LastFmClientOptions {
  apiKey: string;
  apiSecret: string;
  userAgent?: string;
  rateLimiting?: boolean;
  rateLimitMax?: number;
  rateLimitIntervalMs?: number;
  cacheTtlMs?: number;
}

// Album Types
export type AlbumInfoResponse = {
  album: {
    name: string;
    artist: string;
    mbid?: string;
    url: string;
    image?: LastFmImage[];
    listeners?: string;
    playcount?: string;
    tracks?: {
      track: LastFmTrack[];
    };
    tags?: {
      tag: LastFmTag[];
    };
    wiki?: {
      published: string;
      summary: string;
      content: string;
    };
  };
};

export type AlbumSearchResponse = {
  results: {
    albummatches: {
      album: Array<{
        name: string;
        artist: string;
        url: string;
        image: LastFmImage[];
        streamable: string;
        mbid: string;
      }>;
    };
  };
};

// Artist Types
export type ArtistInfoResponse = {
  artist: {
    name: string;
    mbid?: string;
    url: string;
    image?: LastFmImage[];
    streamable?: string;
    ontour?: string;
    stats?: {
      listeners: string;
      playcount: string;
    };
    similar?: {
      artist: LastFmArtistRef[];
    };
    tags?: {
      tag: LastFmTag[];
    };
    bio?: {
      published: string;
      summary: string;
      content: string;
    };
  };
};

export type ArtistSimilarResponse = {
  similarartists: {
    artist: LastFmArtistRef[];
  };
};

export type ArtistSearchResponse = {
  results: {
    artistmatches: {
      artist: Array<{
        name: string;
        listeners: string;
        mbid: string;
        url: string;
        streamable: string;
        image: LastFmImage[];
      }>;
    };
  };
};

// Track Types
export type TrackSimilarResponse = {
  similartracks: {
    track: LastFmTrack[];
  };
};

export type TrackSearchResponse = {
  results: {
    trackmatches: {
      track: Array<{
        name: string;
        artist: string;
        url: string;
        streamable: string;
        listeners: string;
        image: LastFmImage[];
        mbid: string;
      }>;
    };
  };
};

// Tag Types
export type LastFmTag = {
  name: string;
  url: string;
  reach?: string;
  taggings?: string;
  streamable?: string;
  wiki?: {
    published: string;
    summary: string;
    content: string;
  };
};

export type TagInfoResponse = {
  tag: LastFmTag & {
    total?: number;
    reach?: number;
  };
};

export type AuthTokenResponse = {
  token: string;
};

export type TopAlbumsResponse = {
  topalbums: {
    album: Array<{
      name: string;
      playcount: string;
      mbid?: string;
      url: string;
      artist: LastFmArtistRef | string;
      image: LastFmImage[];
    }>;
    '@attr'?: {
      artist?: string;
      user?: string;
      tag?: string;
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
};

export type TopArtistsResponse = {
  topartists: {
    artist: Array<{
      name: string;
      playcount: string;
      listeners?: string;
      mbid?: string;
      url: string;
      streamable?: string;
      image: LastFmImage[];
    }>;
    '@attr'?: {
      user?: string;
      tag?: string;
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
};

export type TopTracksResponse = {
  toptracks: {
    track: Array<{
      name: string;
      duration: string;
      playcount: string;
      listeners?: string;
      mbid?: string;
      url: string;
      streamable:
        | string
        | {
            '#text': string;
            fulltrack: string;
          };
      artist: LastFmArtistRef | string;
      image: LastFmImage[];
    }>;
    '@attr'?: {
      artist?: string;
      user?: string;
      tag?: string;
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
};

export type TopTagsResponse = {
  toptags: {
    tag: Array<{
      name: string;
      count?: number;
      url: string;
    }>;
    '@attr'?: {
      artist?: string;
      album?: string;
      track?: string;
    };
  };
};

export type TagsResponse = {
  tags: {
    tag: Array<{
      name: string;
      url: string;
    }>;
    '@attr'?: {
      artist?: string;
      album?: string;
      track?: string;
    };
  };
};

export type ArtistCorrectionResponse = {
  corrections: {
    correction: {
      artist: LastFmArtistRef;
    };
  };
};

export type TrackCorrectionResponse = {
  corrections: {
    correction: {
      track: {
        name: string;
        url: string;
        artist: LastFmArtistRef;
      };
    };
  };
};

export type LibraryArtistsResponse = {
  artists: {
    artist: Array<{
      name: string;
      playcount: string;
      tagcount: string;
      mbid: string;
      url: string;
      streamable: string;
      image: LastFmImage[];
    }>;
    '@attr': {
      user: string;
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
};

export type TagSimilarResponse = {
  similartags: {
    tag: Array<{
      name: string;
      url: string;
      streamable: string;
    }>;
    '@attr': {
      tag: string;
    };
  };
};

export type WeeklyChartListResponse = {
  weeklychartlist: {
    chart: Array<{
      '#text'?: string;
      from: string;
      to: string;
    }>;
    '@attr'?: {
      user?: string;
    };
  };
};

export type UserFriendsResponse = {
  friends: {
    user: Array<{
      name: string;
      realname: string;
      country: string;
      url: string;
      image: LastFmImage[];
      registered: {
        unixtime: string;
        '#text': number;
      };
      playcount: string;
      playlists: string;
      bootstrap: string;
      type: string;
    }>;
    '@attr': {
      user: string;
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
};

export type LovedTracksResponse = {
  lovedtracks: {
    track: Array<{
      name: string;
      mbid: string;
      url: string;
      date: {
        uts: string;
        '#text': string;
      };
      artist: LastFmArtistRef;
      image: LastFmImage[];
      streamable:
        | string
        | {
            '#text': string;
            fulltrack: string;
          };
    }>;
    '@attr': {
      user: string;
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
};

export type PersonalTagsResponse = {
  taggings: {
    albums?: {
      album: Array<{
        name: string;
        artist: LastFmArtistRef;
        url: string;
        image: LastFmImage[];
      }>;
    };
    artists?: { artist: LastFmArtistRef[] };
    tracks?: {
      track: Array<{
        name: string;
        artist: LastFmArtistRef;
        url: string;
        image: LastFmImage[];
      }>;
    };
    '@attr': {
      user: string;
      tag: string;
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
};

export type WeeklyAlbumChartResponse = {
  weeklyalbumchart: {
    album: Array<{
      name: string;
      mbid: string;
      url: string;
      artist: LastFmArtistRef;
      playcount: string;
      rank: string;
    }>;
    '@attr': {
      user: string;
      from: string;
      to: string;
    };
  };
};

export type WeeklyArtistChartResponse = {
  weeklyartistchart: {
    artist: Array<{
      name: string;
      mbid: string;
      url: string;
      playcount: string;
      rank: string;
    }>;
    '@attr': {
      user: string;
      from: string;
      to: string;
    };
  };
};

export type WeeklyTrackChartResponse = {
  weeklytrackchart: {
    track: Array<{
      name: string;
      mbid: string;
      url: string;
      artist: LastFmArtistRef;
      playcount: string;
      rank: string;
      image: LastFmImage[];
    }>;
    '@attr': {
      user: string;
      from: string;
      to: string;
    };
  };
};
