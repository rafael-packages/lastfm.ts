# Last.fm Client (Typed)

A robust, fully typed TypeScript client for the Last.fm API.

## Installation

```bash
npm install lastfm-client
```

## Getting Started

Initialize the client with your Last.fm API credentials.

```typescript
import { LastFmClient } from "lastfm-client";

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
    const session = await client.getSession("TOKEN_FROM_CALLBACK");
    const sessionKey = session.session.key;
    ```

### User Methods

#### Get User Info

```typescript
const user = await client.getUser("rj");
console.log(`User: ${user.user.realname}, Playcount: ${user.user.playcount}`);
```

#### Get Recent Tracks & Now Playing

```typescript
// Get recent tracks
const recent = await client.getRecentTracks("rj", 10);

// Check if user is currently listening to something
const nowPlaying = await client.getNowPlaying("rj");
if (nowPlaying) {
  console.log(`Listening to: ${nowPlaying.name} by ${nowPlaying.artist["#text"]}`);
}
```

### Track Methods

#### Scrobbling (Record a listen)

Requires `sessionKey`.

```typescript
await client.scrobble(
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
await client.updateNowPlaying(sessionKey, "Daft Punk", "Harder, Better, Faster, Stronger");
```

#### Search & Similar

```typescript
const searchResults = await client.searchTrack("Believe");
const similarTracks = await client.getSimilarTracks("Cher", "Believe");
```

### Other Methods

The client also supports methods for **Albums**, **Artists**, and **Tags**:

- `getAlbumInfo`, `searchAlbum`
- `getArtistInfo`, `getSimilarArtists`, `searchArtist`
- `getTagInfo`

## License

ISC
