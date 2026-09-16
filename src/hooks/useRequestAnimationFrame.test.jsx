import { StrictMode, useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import {
  assertValidAnimationFrameCallback,
  assertValidIsRunning,
  assertValidMaxDeltaMs,
} from './animationFramePolicy';
import { useRequestAnimationFrame } from './useRequestAnimationFrame';

function Harness({ isRunning = true, maxDeltaMs = 100, multiplier = 1 }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useRequestAnimationFrame(
    ({ deltaMs }) => setElapsedMs((current) => current + deltaMs * multiplier),
    { isRunning, maxDeltaMs }
  );

  return <output aria-label="elapsed milliseconds">{elapsedMs}</output>;
}

function CallbackHarness({ callback }) {
  useRequestAnimationFrame(callback);
  return null;
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

  test('uses timestamps and bounds large or negative frame deltas', () => {
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

    flushFrame(600);
    expect(screen.getByLabelText('elapsed milliseconds')).toHaveTextContent(
      '116'
    );
  });

  test('uses the latest callback without restarting the scheduling effect', () => {
    const { rerender } = render(<Harness multiplier={1} />);
    flushFrame(100);

    rerender(<Harness multiplier={2} />);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);

    flushFrame(116);
    expect(screen.getByLabelText('elapsed milliseconds')).toHaveTextContent(
      '32'
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

  test('cancels a zero-valued request identifier', () => {
    window.requestAnimationFrame.mockImplementationOnce((callback) => {
      callbacks.set(0, callback);
      return 0;
    });
    const { unmount } = render(<Harness />);

    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(0);
    expect(callbacks.size).toBe(0);
  });

  test('does not queue another frame after synchronous teardown', () => {
    let unmount;
    ({ unmount } = render(<CallbackHarness callback={() => unmount()} />));

    flushFrame(100);

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(callbacks.size).toBe(0);
  });

  test('resets elapsed-time tracking when the delta policy changes', () => {
    const { rerender } = render(<Harness maxDeltaMs={100} />);
    flushFrame(100);
    flushFrame(116);

    rerender(<Harness maxDeltaMs={25} />);
    flushFrame(500);

    expect(screen.getByLabelText('elapsed milliseconds')).toHaveTextContent(
      '16'
    );
  });

  test('cleans up the discarded loop during a Strict Mode probe', () => {
    const { unmount } = render(
      <StrictMode>
        <Harness />
      </StrictMode>
    );

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(callbacks.size).toBe(1);

    unmount();
    expect(callbacks.size).toBe(0);
  });

  test('rejects invalid hook arguments before scheduling', () => {
    expect(() => assertValidAnimationFrameCallback(null)).toThrow(
      'callback must be a function.'
    );
    expect(() => assertValidIsRunning('yes')).toThrow(
      'isRunning must be a Boolean.'
    );
    expect(() => assertValidMaxDeltaMs(0)).not.toThrow();
    expect(() => assertValidMaxDeltaMs(-1)).toThrow(
      'maxDeltaMs must be a finite, non-negative number.'
    );
    expect(() => assertValidMaxDeltaMs(Number.POSITIVE_INFINITY)).toThrow(
      'maxDeltaMs must be a finite, non-negative number.'
    );
  });
});
