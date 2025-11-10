import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFarcasterUser } from './hooks';
import * as client from './client';

vi.mock('./client', () => ({
  initializeFarcasterClient: vi.fn(),
  getClientState: vi.fn(),
  resetClientState: vi.fn(),
}));

describe('useFarcasterUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading state', () => {
    const mockInit = client.initializeFarcasterClient as unknown as ReturnType<typeof vi.fn>;
    mockInit.mockResolvedValue({
      isReady: true,
      user: null,
      error: null,
    });

    const { result } = renderHook(() => useFarcasterUser());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('should load user successfully', async () => {
    const mockInit = client.initializeFarcasterClient as unknown as ReturnType<typeof vi.fn>;
    mockInit.mockResolvedValue({
      isReady: true,
      user: {
        fid: 123,
        username: 'testuser',
        displayName: 'Test User',
        pfpUrl: 'https://example.com/avatar.png',
      },
      error: null,
    });

    const { result } = renderHook(() => useFarcasterUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.user).not.toBeNull();
    expect(result.current.fid).toBe(123);
    expect(result.current.username).toBe('testuser');
    expect(result.current.displayName).toBe('Test User');
    expect(result.current.avatarUrl).toBe('https://example.com/avatar.png');
  });

  it('should handle initialization errors', async () => {
    const testError = new Error('Initialization failed');
    const mockInit = client.initializeFarcasterClient as unknown as ReturnType<typeof vi.fn>;
    mockInit.mockResolvedValue({
      isReady: false,
      user: null,
      error: testError,
    });

    const { result } = renderHook(() => useFarcasterUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(testError);
    expect(result.current.user).toBeNull();
    expect(result.current.fid).toBeNull();
  });

  it('should handle thrown errors', async () => {
    const testError = new Error('Unexpected error');
    const mockInit = client.initializeFarcasterClient as unknown as ReturnType<typeof vi.fn>;
    mockInit.mockRejectedValue(testError);

    const { result } = renderHook(() => useFarcasterUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Unexpected error');
  });

  it('should handle non-Error thrown values', async () => {
    const mockInit = client.initializeFarcasterClient as unknown as ReturnType<typeof vi.fn>;
    mockInit.mockRejectedValue('String error');

    const { result } = renderHook(() => useFarcasterUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Unknown error');
  });

  it('should return null values when user is null', async () => {
    const mockInit = client.initializeFarcasterClient as unknown as ReturnType<typeof vi.fn>;
    mockInit.mockResolvedValue({
      isReady: true,
      user: null,
      error: null,
    });

    const { result } = renderHook(() => useFarcasterUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.fid).toBeNull();
    expect(result.current.username).toBeNull();
    expect(result.current.displayName).toBeNull();
    expect(result.current.avatarUrl).toBeNull();
  });

  it('should initialize only once', async () => {
    const mockInit = client.initializeFarcasterClient as unknown as ReturnType<typeof vi.fn>;
    mockInit.mockResolvedValue({
      isReady: true,
      user: {
        fid: 123,
        username: 'testuser',
        displayName: 'Test User',
        pfpUrl: 'https://example.com/avatar.png',
      },
      error: null,
    });

    const { result } = renderHook(() => useFarcasterUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockInit).toHaveBeenCalledTimes(1);
  });
});
