export function assertValidMaxDeltaMs(maxDeltaMs) {
  if (!Number.isFinite(maxDeltaMs) || maxDeltaMs < 0) {
    throw new RangeError('maxDeltaMs must be a finite, non-negative number.');
  }
}
