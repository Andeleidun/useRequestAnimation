import { useEffect, useRef } from 'react';
import { assertValidMaxDeltaMs } from './animationFramePolicy';

export function useRequestAnimationFrame(
  callback,
  { isRunning = true, maxDeltaMs = 100 } = {}
) {
  const callbackRef = useRef(callback);

  assertValidMaxDeltaMs(maxDeltaMs);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    let frameId;
    let previousTimestamp;

    const animate = (timestamp) => {
      const rawDelta =
        previousTimestamp === undefined ? 0 : timestamp - previousTimestamp;
      const deltaMs = Math.min(Math.max(rawDelta, 0), maxDeltaMs);
      previousTimestamp = timestamp;

      callbackRef.current({ timestamp, deltaMs });
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [isRunning, maxDeltaMs]);
}
