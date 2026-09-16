import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
});

test('returns false when matchMedia is unavailable', () => {
  window.matchMedia = undefined;

  const { result } = renderHook(() => usePrefersReducedMotion());

  expect(result.current).toBe(false);
});

test('tracks changes and removes the modern media-query listener', () => {
  let handleChange;
  const mediaQuery = {
    matches: false,
    addEventListener: vi.fn((eventName, callback) => {
      expect(eventName).toBe('change');
      handleChange = callback;
    }),
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mediaQuery);

  const { result, unmount } = renderHook(() => usePrefersReducedMotion());

  act(() => {
    mediaQuery.matches = true;
    handleChange();
  });
  expect(result.current).toBe(true);

  unmount();
  expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
    'change',
    handleChange
  );
});

test('synchronizes a preference change that occurs before subscription', () => {
  const initialQuery = { matches: false };
  const subscribedQuery = {
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi
    .fn()
    .mockReturnValueOnce(initialQuery)
    .mockReturnValue(subscribedQuery);

  const { result } = renderHook(() => usePrefersReducedMotion());

  expect(result.current).toBe(true);
  expect(subscribedQuery.addEventListener).toHaveBeenCalledWith(
    'change',
    expect.any(Function)
  );
});

test('supports the legacy media-query listener API', () => {
  let handleChange;
  const mediaQuery = {
    matches: true,
    addListener: vi.fn((callback) => {
      handleChange = callback;
    }),
    removeListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mediaQuery);

  const { result, unmount } = renderHook(() => usePrefersReducedMotion());

  expect(result.current).toBe(true);
  act(() => {
    mediaQuery.matches = false;
    handleChange();
  });
  expect(result.current).toBe(false);

  unmount();
  expect(mediaQuery.removeListener).toHaveBeenCalledWith(handleChange);
});

test('does not subscribe when a media-query listener API is incomplete', () => {
  const mediaQuery = {
    matches: true,
    addEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mediaQuery);

  const { result } = renderHook(() => usePrefersReducedMotion());

  expect(result.current).toBe(true);
  expect(mediaQuery.addEventListener).not.toHaveBeenCalled();
});
