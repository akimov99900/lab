/**
 * Farcaster user context types
 */

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

export interface FarcasterClientConfig {
  timeout?: number;
  mockEnabled?: boolean;
}

export interface FarcasterClientState {
  isReady: boolean;
  user: FarcasterUser | null;
  error: Error | null;
}
