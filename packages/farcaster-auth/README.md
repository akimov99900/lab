# @lab/farcaster-auth

Farcaster authentication SDK for miniapps. Provides typed helpers and React hooks for seamless integration with the Farcaster Frame SDK.

## Features

- **Type-safe Farcaster integration** - Full TypeScript support for user context
- **React hooks** - Easy-to-use `useFarcasterUser` hook for component integration
- **Graceful degradation** - Falls back to deterministic mock when running outside the miniapp
- **Error handling** - Built-in error handling and fallback mechanisms
- **SDK initialization** - Automatic SDK ready signal and context extraction

## Installation

```bash
pnpm add @lab/farcaster-auth
```

### Peer Dependencies

```bash
pnpm add react@^18.0.0
```

## Usage

### React Hook

```tsx
import { useFarcasterUser } from '@lab/farcaster-auth';

export function MyComponent() {
  const { loading, error, user, fid, username, displayName, avatarUrl } =
    useFarcasterUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div>
      <img src={avatarUrl} alt={displayName} />
      <h1>{displayName}</h1>
      <p>@{username}</p>
      <p>FID: {fid}</p>
    </div>
  );
}
```

### Helper Function

```tsx
import { initializeFarcasterClient } from '@lab/farcaster-auth';

async function initialize() {
  const state = await initializeFarcasterClient({
    mockEnabled: false, // optional, defaults to true outside miniapp
  });

  if (state.error) {
    console.error('Failed to initialize:', state.error);
    return;
  }

  console.log('User:', state.user);
}
```

## API

### `useFarcasterUser()`

React hook that manages Farcaster user context initialization and state.

**Returns:**

```typescript
{
  loading: boolean;           // true while initializing
  error: Error | null;        // error if initialization failed
  user: FarcasterUser | null; // complete user object
  fid: number | null;         // user's Farcaster ID
  username: string | null;    // user's username
  displayName: string | null; // user's display name
  avatarUrl: string | null;   // user's profile picture URL
}
```

### `initializeFarcasterClient(config?)`

Initializes the Farcaster SDK and extracts user context.

**Parameters:**

- `config` (optional)
  - `mockEnabled`: `boolean` - Force mock mode (default: auto-detect based on environment)
  - `timeout`: `number` - Operation timeout in ms (default: no timeout)

**Returns:**

```typescript
Promise<FarcasterClientState> {
  isReady: boolean;        // SDK initialized successfully
  user: FarcasterUser | null; // extracted user or null
  error: Error | null;     // error if initialization failed
}
```

### Types

```typescript
interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

interface FarcasterClientConfig {
  timeout?: number;
  mockEnabled?: boolean;
}

interface FarcasterClientState {
  isReady: boolean;
  user: FarcasterUser | null;
  error: Error | null;
}
```

## Behavior

### Inside a Farcaster Miniapp

When running inside a Farcaster miniapp (Frame SDK available):

1. Calls `sdk.actions.ready()` to signal readiness
2. Extracts user context via `sdk.context.client.getContext()`
3. Returns the real user data or null if context unavailable
4. Gracefully handles SDK errors

### Outside a Farcaster Miniapp (Development)

When running in a browser or development environment without the Frame SDK:

1. Automatically uses deterministic mock user data
2. Returns consistent mock user with FID=1, username='mock_user'
3. Allows testing without a live Farcaster miniapp environment

Override with `mockEnabled: false` to force real SDK initialization.

## Development

### Build

```bash
pnpm build --filter farcaster-auth
```

### Test

```bash
pnpm test --filter farcaster-auth
```

### Testing with Mock Data

Tests use Vitest with mocked Frame SDK. The mock provides full control over:

- SDK initialization success/failure
- User context data
- Error scenarios
- Edge cases (missing fields, null users, etc.)

## License

MIT
