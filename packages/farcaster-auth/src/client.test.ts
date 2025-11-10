import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initializeFarcasterClient,
  getClientState,
  resetClientState,
} from './client';

describe('farcaster-auth client', () => {
  beforeEach(() => {
    resetClientState();
  });

  afterEach(() => {
    resetClientState();
  });

  describe('initializeFarcasterClient', () => {
    it('should initialize with mock when outside miniapp', async () => {
      const result = await initializeFarcasterClient();

      expect(result.isReady).toBe(true);
      expect(result.user).not.toBeNull();
      expect(result.user?.fid).toBe(1);
      expect(result.user?.username).toBe('mock_user');
      expect(result.error).toBeNull();
    });

    it('should force mock when mockEnabled is true', async () => {
      const result = await initializeFarcasterClient({ mockEnabled: true });

      expect(result.isReady).toBe(true);
      expect(result.user?.fid).toBe(1);
      expect(result.user?.username).toBe('mock_user');
    });

    it('should handle SDK initialization errors gracefully', async () => {
      const result = await initializeFarcasterClient({ mockEnabled: false });

      if (!result.isReady) {
        expect(result.user).toBeNull();
        expect(result.error).toBeDefined();
      } else {
        expect(result.user).toBeDefined();
      }
    });

    it('should store deterministic mock data consistently', async () => {
      const result1 = await initializeFarcasterClient();
      const result2 = await initializeFarcasterClient();

      expect(result1.user?.fid).toBe(result2.user?.fid);
      expect(result1.user?.username).toBe(result2.user?.username);
      expect(result1.user?.displayName).toBe(result2.user?.displayName);
    });
  });

  describe('getClientState', () => {
    it('should return current client state', async () => {
      await initializeFarcasterClient();
      const state = getClientState();

      expect(state.isReady).toBe(true);
      expect(state.user).not.toBeNull();
      expect(state.error).toBeNull();
    });

    it('should return a deep copy of state', async () => {
      await initializeFarcasterClient();
      const state1 = getClientState();
      const state2 = getClientState();

      expect(state1).not.toBe(state2);
      expect(state1.user).not.toBe(state2.user);
      expect(state1.user?.fid).toBe(state2.user?.fid);

      if (state1.user && state2.user) {
        state1.user.fid = 999;
        expect(state2.user.fid).not.toBe(999);
      }
    });

    it('should return null user when not initialized', () => {
      resetClientState();
      const state = getClientState();

      expect(state.isReady).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('resetClientState', () => {
    it('should reset state to initial values', async () => {
      await initializeFarcasterClient();
      let state = getClientState();
      expect(state.isReady).toBe(true);

      resetClientState();
      state = getClientState();

      expect(state.isReady).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should allow reinitialization after reset', async () => {
      await initializeFarcasterClient();
      resetClientState();
      const result = await initializeFarcasterClient();

      expect(result.isReady).toBe(true);
      expect(result.user).not.toBeNull();
    });
  });
});
