import * as frameSDK from '@farcaster/frame-sdk';
import { FarcasterUser, FarcasterClientConfig, FarcasterClientState } from './types';

let globalClientState: FarcasterClientState = {
  isReady: false,
  user: null,
  error: null,
};

const DETERMINISTIC_MOCK_USER: FarcasterUser = {
  fid: 1,
  username: 'mock_user',
  displayName: 'Mock User',
  pfpUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
};

function isInMiniapp(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const maybeReactNativeWebView = (window as unknown as Record<string, unknown>).ReactNativeWebView;
  return maybeReactNativeWebView !== undefined;
}

function getMockUser(): FarcasterUser {
  return { ...DETERMINISTIC_MOCK_USER };
}

async function extractUserContext(): Promise<FarcasterUser | null> {
  try {
    const ctx = await frameSDK.sdk.context;

    if (!ctx.user) {
      return null;
    }

    return {
      fid: ctx.user.fid,
      username: ctx.user.username || 'unknown',
      displayName: ctx.user.displayName || ctx.user.username || 'Unknown',
      pfpUrl: ctx.user.pfpUrl || '',
    };
  } catch (error) {
    return null;
  }
}

export async function initializeFarcasterClient(
  config?: FarcasterClientConfig
): Promise<FarcasterClientState> {
  try {
    const shouldUseMock = config?.mockEnabled !== false && !isInMiniapp();

    if (shouldUseMock) {
      globalClientState = {
        isReady: true,
        user: getMockUser(),
        error: null,
      };
      return { ...globalClientState };
    }

    await frameSDK.sdk.actions.ready();

    const user = await extractUserContext();

    globalClientState = {
      isReady: true,
      user,
      error: null,
    };

    return { ...globalClientState };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error initializing Farcaster client');

    globalClientState = {
      isReady: false,
      user: null,
      error: err,
    };

    return { ...globalClientState };
  }
}

export function getClientState(): FarcasterClientState {
  return {
    isReady: globalClientState.isReady,
    user: globalClientState.user ? { ...globalClientState.user } : null,
    error: globalClientState.error,
  };
}

export function resetClientState(): void {
  globalClientState = {
    isReady: false,
    user: null,
    error: null,
  };
}
