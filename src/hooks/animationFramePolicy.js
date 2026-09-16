export const DEFAULT_MAX_DELTA_MS = 100;

export function assertValidAnimationFrameCallback(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function.');
  }
}

export function assertValidIsRunning(isRunning) {
  if (typeof isRunning !== 'boolean') {
    throw new TypeError('isRunning must be a Boolean.');
  }
}

export function assertValidMaxDeltaMs(maxDeltaMs) {
  if (!Number.isFinite(maxDeltaMs) || maxDeltaMs < 0) {
    throw new RangeError('maxDeltaMs must be a finite, non-negative number.');
  }
}
