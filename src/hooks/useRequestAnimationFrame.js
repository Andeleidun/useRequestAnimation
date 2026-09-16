import { useEffect, useEffectEvent } from 'react';
import {
  assertValidAnimationFrameCallback,
  assertValidIsRunning,
  assertValidMaxDeltaMs,
  DEFAULT_MAX_DELTA_MS,
} from './animationFramePolicy';

export function useRequestAnimationFrame(
  callback,
  { isRunning = true, maxDeltaMs = DEFAULT_MAX_DELTA_MS } = {}
) {
  assertValidAnimationFrameCallback(callback);
  assertValidIsRunning(isRunning);
  assertValidMaxDeltaMs(maxDeltaMs);

  const onAnimationFrame = useEffectEvent(callback);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    let frameId = null;
    let previousTimestamp = null;
    let isActive = true;

    const animate = (timestamp) => {
      if (!isActive) {
        return;
      }

      const rawDelta =
        previousTimestamp === null ? 0 : timestamp - previousTimestamp;
      const deltaMs = Math.min(Math.max(rawDelta, 0), maxDeltaMs);
      previousTimestamp = timestamp;

      onAnimationFrame({ timestamp, deltaMs });

      if (isActive) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      isActive = false;

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [isRunning, maxDeltaMs]);
}
