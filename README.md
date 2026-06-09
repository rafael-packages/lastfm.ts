# @rafaelsilvadeveloper/lastfm.ts

A typed TypeScript client for the Last.fm API.

## Installation

```bash
npm install @rafaelsilvadeveloper/lastfm.ts
```

## Getting Started

Initialize the client with your Last.fm API credentials.

```typescript
import { LastFmClient } from "@rafaelsilvadeveloper/lastfm.ts";

const client = new LastFmClient({
  apiKey: "YOUR_API_KEY",
  apiSecret: "YOUR_API_SECRET",
  userAgent: "MyApp/1.0.0 (contact@example.com)", // Optional but recommended
});
```

## Features

### Authentication

To scrobble or update "Now Playing", you need a user session.

1.  **Get Auth URL**: Redirect the user to this URL to approve your app.

    ```typescript
    const authUrl = client.getAuthUrl("http://localhost:3000/callback");
    console.log("Please visit:", authUrl);
    ```

2.  **Get Session**: Once the user returns with a `token`, exchange it for a session key.
    ```typescript
    const session = await client.auth.getSession("TOKEN_FROM_CALLBACK");
    const sessionKey = session.session.key;
    ```

### User Methods

#### Get User Info

```typescript
const user = await client.users.getInfo("realkalashnikov");
console.log(`User: ${user.user.realname}, Playcount: ${user.user.playcount}`);
```

#### Get Recent Tracks & Now Playing

```typescript
// Get recent tracks
const recent = await client.users.getRecentTracks("realkalashnikov", 10);

// Check if user is currently listening to something
const nowPlaying = await client.users.getNowPlaying("realkalashnikov");
if (nowPlaying) {
  console.log(
    `Listening to: ${nowPlaying.name} by ${nowPlaying.artist["#text"]}`,
  );
}
```

### Track Methods

#### Scrobbling (Record a listen)

Requires `sessionKey`.

```typescript
await client.tracks.scrobble(
  sessionKey,
  "Daft Punk", // Artist
  "One More Time", // Track
  Math.floor(Date.now() / 1000), // Timestamp (in seconds)
  "Discovery", // Album (Optional)
);
```

#### Update Now Playing

Requires `sessionKey`.

```typescript
await client.tracks.updateNowPlaying(
  sessionKey,
  "Daft Punk",
  "Harder, Better, Faster, Stronger",
);
```

#### Search & Similar

```typescript
const searchResults = await client.tracks.search("Believe");
const similarTracks = await client.tracks.getSimilar("Cher", "Believe");
```

### Complete API Methods

**Album**

```typescript
// Add tags to an album (Requires Auth)
await client.albums.addTags(sessionKey, "Daft Punk", "Discovery", [
  "electronic",
  "dance",
]);

// Get album information
const albumInfo = await client.albums.getInfo("Daft Punk", "Discovery");

// Get tags applied by a user to an album
const albumTags = await client.albums.getTags("Daft Punk", "Discovery", "realkalashnikov");

// Get the top tags for an album
const topTags = await client.albums.getTopTags("Daft Punk", "Discovery");

// Remove a tag from an album (Requires Auth)
await client.albums.removeTag(sessionKey, "Daft Punk", "Discovery", "electronic");

// Search for an album
const albumSearch = await client.albums.search("Discovery");
```

**Artist**

```typescript
// Add tags to an artist (Requires Auth)
await client.artists.addTags(sessionKey, "Daft Punk", [
  "electronic",
  "french-touch",
]);

// Get artist corrections
const correction = await client.artists.getCorrection("Guns and Roses");

// Get artist information
const artistInfo = await client.artists.getInfo("Daft Punk");

// Get tags applied by an individual user to an artist
const artistTags = await client.artists.getTags("Daft Punk", "realkalashnikov");

// Get the top albums for an artist
const topAlbums = await client.artists.getTopAlbums("Daft Punk");

// Get the top tags for an artist
const topArtistTags = await client.artists.getTopTags("Daft Punk");

// Get the top tracks for an artist
const topTracks = await client.artists.getTopTracks("Daft Punk");

// Get similar artists
const similarArtists = await client.artists.getSimilar("Daft Punk");

// Remove a tag from an artist (Requires Auth)
await client.artists.removeTag(sessionKey, "Daft Punk", "electronic");

// Search for an artist
const artistSearch = await client.artists.search("Daft Punk");
```

**Auth**

```typescript
// Get authentication URL
const url = client.getAuthUrl("http://localhost:3000/callback");

// Exchange token for session key
const session = await client.auth.getSession("token_from_callback");

// Get a mobile session key (Requires Auth)
const mobileSession = await client.auth.getMobileSession(
  "username",
  "password_or_token",
);

// Get an auth token
const token = await client.auth.getToken();
```

**Chart**

```typescript
// Get the top artists chart
const topChartArtists = await client.charts.getTopArtists();

// Get the top tags chart
const topChartTags = await client.charts.getTopTags();

// Get the top tracks chart
const topChartTracks = await client.charts.getTopTracks();
```

**Geo**

```typescript
// Get the top country artists
const topGeoArtists = await client.geo.getTopArtists("Brazil");

// Get the top country tracks
const topGeoTracks = await client.geo.getTopTracks("Brazil");
```

**Library**

```typescript
// Get a paginated list of all the artists in a user's library
const libraryArtists = await client.library.getArtists("realkalashnikov");
```

**Tag**

```typescript
// Get similar tags
const similarTags = await client.tags.getSimilar("rock");

// Get tag information
const tagInfo = await client.tags.getInfo("rock");

// Get top albums for a tag
const tagAlbums = await client.tags.getTopAlbums("rock");

// Get top artists for a tag
const tagArtists = await client.tags.getTopArtists("rock");

// Get top tags overall
const topTagsOverall = await client.tags.getTopTags();

// Get top tracks for a tag
const tagTracks = await client.tags.getTagTopTracks("rock");

// Get the weekly chart list for a tag
const tagCharts = await client.tags.getWeeklyChartList("rock");
```

**Track**

```typescript
// Add tags to a track (Requires Auth)
await client.tracks.addTags(sessionKey, "Daft Punk", "One More Time", [
  "electronic",
]);

// Get recent tracks
const recent = await client.users.getRecentTracks("realkalashnikov", 10);

// Get track corrections
const trackCorrection = await client.tracks.getCorrection(
  "Guns n Roses",
  "Paradise City",
);

// Get track info
const trackInfo = await client.tracks.getInfo("Daft Punk", "One More Time");

// Get tags applied by a user to a track
const trackTags = await client.tracks.getTags("Daft Punk", "One More Time", "realkalashnikov");

// Get top tags for a track
const trackTopTags = await client.tracks.getTopTags("Daft Punk", "One More Time");

// Love a track (Requires Auth)
await client.tracks.love(sessionKey, "Daft Punk", "One More Time");

// Remove a tag from a track (Requires Auth)
await client.tracks.removeTag(
  sessionKey,
  "Daft Punk",
  "One More Time",
  "electronic",
);

// Search for a track
const trackSearch = await client.tracks.search("One More Time");

// Unlove a track (Requires Auth)
await client.tracks.unlove(sessionKey, "Daft Punk", "One More Time");

// Get similar tracks
const similarTracks = await client.tracks.getSimilar("Cher", "Believe");
```

**User**

```typescript
// Get user info
const user = await client.users.getInfo("realkalashnikov");

// Get friends
const friends = await client.users.getFriends("realkalashnikov");

// Get loved tracks
const lovedTracks = await client.users.getLovedTracks("realkalashnikov");

// Get personal tags
const personalTags = await client.users.getPersonalTags("realkalashnikov", "rock", "artist");

// Get top albums
const userTopAlbums = await client.users.getTopAlbums("realkalashnikov");

// Get top artists
const userTopArtists = await client.users.getTopArtists("realkalashnikov");

// Get top tags
const userTopTags = await client.users.getTopTags("realkalashnikov");

// Get top tracks
const userTopTracks = await client.users.getTopTracks("realkalashnikov");

// Get weekly album chart
const weeklyAlbums = await client.users.getWeeklyAlbumChart("realkalashnikov");

// Get weekly artist chart
const weeklyArtists = await client.users.getWeeklyArtistChart("realkalashnikov");

// Get weekly chart list
const weeklyCharts = await client.users.getWeeklyChartList("realkalashnikov");

// Get weekly track chart
const weeklyTracks = await client.users.getWeeklyTrackChart("realkalashnikov");
```

## Support

For support, questions, or discussions, join our Discord server:

[![Discord Server](https://img.shields.io/discord/1111111111?color=7289da&label=Discord&logo=discord)](https://discord.gg/7Fw7snafYS)

## License

Personal and Commercial Use License. See the [LICENSE](LICENSE) file for details.
