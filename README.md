# @rafaelsilvadeveloper/lastfm.ts

A strongly typed, zero-dependency TypeScript client for the Last.fm API, featuring rate limiting, caching, and async iterators.

[![NPM Version](https://img.shields.io/npm/v/@rafaelsilvadeveloper/lastfm.ts.svg?style=flat-square)](https://www.npmjs.com/package/@rafaelsilvadeveloper/lastfm.ts)
[![Discord Support](https://img.shields.io/discord/1111111111?color=7289da&label=Discord&logo=discord&style=flat-square)](https://discord.gg/7Fw7snafYS)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-blueviolet.svg?style=flat-square)](https://www.npmjs.com/package/@rafaelsilvadeveloper/lastfm.ts)

## Features

*   🛡️ **TypeScript Definitions**: Complete types for all requests and responses mapping Last.fm API structure.
*   📦 **Zero Dependencies**: Built entirely using native `fetch`. Runs in Node.js, Bun, Cloudflare Workers, Edge, and Serverless environments.
*   🚦 **Built-in Rate Limiting**: Built-in queue compliance checks to prevent Last.fm API rate limit violations.
*   🚀 **In-Memory Cache**: Smart built-in caching layer to save resources and speed up repeat requests.
*   🔌 **Custom Interceptors**: Flexible middlewares to intercept and modify requests, responses, and errors.
*   🔄 **Async Iterators**: Page-fetch user top artists, loved tracks, and recent tracks automatically using modern `for await...of` loops.

## Installation

```bash
npm install @rafaelsilvadeveloper/lastfm.ts
```

## Getting Started

Initialize the client with your Last.fm API credentials.

```typescript
import { LastFmClient } from '@rafaelsilvadeveloper/lastfm.ts';

const client = new LastFmClient({
  apiKey: "YOUR_API_KEY",
  apiSecret: "YOUR_API_SECRET",
  userAgent: "MyApp/1.0.0 (contact@example.com)", // Optional but recommended
});
```

### Authentication (OAuth 2)

To scrobble or update "Now Playing", you need a user session:

1.  **Get Auth URL**: Redirect the user to this URL to approve your app.
    ```typescript
    const authUrl = client.getAuthUrl("http://localhost:3000/callback");
    ```
2.  **Get Session Key**: Once the user returns with a `token`, exchange it for a session key:
    ```typescript
    const session = await client.auth.getSession("TOKEN_FROM_CALLBACK");
    const sessionKey = session.session.key;
    ```

### User Profile and Recent Tracks

```typescript
// Fetch user profile info
const user = await client.users.getInfo("realkalashnikov");

// Fetch scrobble queue checking if user is listening to anything
const nowPlaying = await client.users.getNowPlaying("realkalashnikov");
if (nowPlaying) {
  console.log(`Listening to: ${nowPlaying.name} by ${nowPlaying.artist["#text"]}`);
}
```

### Scrobbling (Record a listen)

Requires `sessionKey` obtained from the OAuth step.

```typescript
await client.tracks.scrobble(
  sessionKey,
  "Daft Punk", // Artist
  "One More Time", // Track
  Math.floor(Date.now() / 1000) // Timestamp
);
```

## Pagination with Async Iterators

Iterate through paginated resources without manually managing limits or offset parameters:

```typescript
import { LastFmClient } from '@rafaelsilvadeveloper/lastfm.ts';

const client = new LastFmClient({
  apiKey: "YOUR_API_KEY",
  apiSecret: "YOUR_API_SECRET",
});

async function run() {
  // Automatically queries next pages behind the scenes as you loop!
  for await (const track of client.users.getRecentTracksIterator('realkalashnikov')) {
    console.log(`Track: ${track.name} - Artist: ${track.artist.name}`);
  }
}

run();
```

Available iterators:
- `client.users.getRecentTracksIterator(username)`
- `client.users.getLovedTracksIterator(username)`
- `client.users.getTopArtistsIterator(username)`

## Error Handling

Throws strongly typed `LastFmApiError`, `LastFmNetworkError`, or `LastFmValidationError`.

```typescript
import { LastFmApiError } from '@rafaelsilvadeveloper/lastfm.ts';

try {
  await client.users.getInfo("non-existent-user");
} catch (error) {
  if (error instanceof LastFmApiError) {
    console.error(`API Error: ${error.message} (Code: ${error.code})`);
  }
}
```

## Support

For support, questions, or discussions, join our Discord server:

[![Discord Server](https://img.shields.io/discord/1111111111?color=7289da&label=Discord&logo=discord&style=for-the-badge)](https://discord.gg/7Fw7snafYS)

## License

Personal and Commercial Use License. See the [LICENSE](LICENSE) file for details.
