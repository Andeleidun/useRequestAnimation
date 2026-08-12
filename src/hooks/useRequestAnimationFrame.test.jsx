import { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { assertValidMaxDeltaMs } from './animationFramePolicy';
import { useRequestAnimationFrame } from './useRequestAnimationFrame';

function Harness({ isRunning = true, maxDeltaMs = 100 }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useRequestAnimationFrame(
    ({ deltaMs }) => setElapsedMs((current) => current + deltaMs),
    { isRunning, maxDeltaMs }
  );

  return <output aria-label="elapsed milliseconds">{elapsedMs}</output>;
}

describe('useRequestAnimationFrame', () => {
  let callbacks;
  let nextFrameId;

  beforeEach(() => {
    callbacks = new Map();
    nextFrameId = 1;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      const frameId = nextFrameId;
      nextFrameId += 1;
      callbacks.set(frameId, callback);
      return frameId;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((frameId) => {
      callbacks.delete(frameId);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function flushFrame(timestamp) {
    const next = callbacks.entries().next().value;

    if (!next) {
      throw new Error('No animation frame is queued.');
    }

    const [frameId, callback] = next;
    callbacks.delete(frameId);
    act(() => callback(timestamp));
  }

  test('uses timestamps and bounds a large frame delta', () => {
    render(<Harness />);

    flushFrame(100);
    expect(screen.getByLabelText('elapsed milliseconds')).toHaveTextContent(
      '0'
    );

    flushFrame(116);
    expect(screen.getByLabelText('elapsed milliseconds')).toHaveTextContent(
      '16'
    );

    flushFrame(616);
    expect(screen.getByLabelText('elapsed milliseconds')).toHaveTextContent(
      '116'
    );
  });

  test('does not schedule frames while paused', () => {
    render(<Harness isRunning={false} />);

    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  test('cancels the latest frame on pause and unmount', () => {
    const { rerender, unmount } = render(<Harness />);
    flushFrame(100);

    rerender(<Harness isRunning={false} />);
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(2);

    rerender(<Harness isRunning />);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenLastCalledWith(3);
  });

  test('rejects an invalid delta policy', () => {
    expect(() => assertValidMaxDeltaMs(-1)).toThrow(
      'maxDeltaMs must be a finite, non-negative number.'
    );
  });
});
