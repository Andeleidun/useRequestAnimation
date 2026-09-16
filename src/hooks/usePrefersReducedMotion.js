import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getSnapshot() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false;
}

function subscribe(onStoreChange) {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  const handleChange = () => onStoreChange();

  if (
    typeof mediaQuery.addEventListener === 'function' &&
    typeof mediaQuery.removeEventListener === 'function'
  ) {
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }

  if (
    typeof mediaQuery.addListener === 'function' &&
    typeof mediaQuery.removeListener === 'function'
  ) {
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }

  return () => {};
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
