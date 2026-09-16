# Build a resilient `requestAnimationFrame` hook in React

This tutorial builds a reusable React hook that schedules animation frames,
calculates progress from browser timestamps, keeps the latest callback without
restarting the loop, blocks rescheduling after teardown, cancels pending work,
bounds long frame gaps, and respects the user's reduced-motion preference. The
finished demo makes those behaviors observable with pause, resume, and restart
controls.

The intended reader already understands React components, state, effects, and
effect cleanup. You need Node.js 22.22.2 or later in the 22.x line, Node.js
24.15 or later in the 24.x line, or Node.js 26, plus npm and a modern browser.
The repository uses React 19.2.8, Vite 8.2.1, and Vitest 4.1.11.
The declared Node ranges reflect the current direct toolchain's engine
intersection. The verification reported below ran on Node.js 24.15.0.

The hook owns scheduling, not animation design. It is not a physics engine,
timeline library, or automatic replacement for CSS animations, the Web
Animations API, canvas, or an animation library.

## Choose `requestAnimationFrame` for JavaScript-driven motion

CSS transitions and animations are usually the simpler choice when CSS can
describe the entire state change. Use `requestAnimationFrame` when JavaScript
must calculate each visual state, coordinate several values, draw to a canvas,
or react to data that CSS does not own.

`requestAnimationFrame` is a one-shot request. The browser calls your callback
before a future repaint, and the callback must schedule another request if the
loop should continue. The callback receives a high-resolution timestamp.
Calculate elapsed time from that timestamp instead of assuming 60 frames per
second. A fixed amount per callback runs too quickly on high-refresh-rate
displays and too slowly when frames are delayed.

The scheduling lifecycle looks like this:

1. Request the first frame.
2. Treat its timestamp as the starting point, so its delta is zero.
3. On later frames, subtract the previous timestamp from the current one.
4. Apply a deliberate long-gap policy.
5. Run the caller's latest callback through a React Effect Event.
6. Request the next frame.
7. Cancel the latest outstanding request when the loop pauses, restarts, or
   unmounts.

Browsers commonly pause these callbacks in background tabs, but that behavior
does not replace cleanup. It also means that a resumed loop may receive a large
timestamp gap. This example caps one delta at 100 milliseconds to prevent a
single delayed frame from moving the demo across most of its track.

<!-- twa:step id=STEP-01 -->
## Install and run the example

Clone or download the repository, open this directory in a terminal, and
install the exact dependency closure recorded in `package-lock.json`.

<!-- twa:snippet id=SNIP-01 class=command -->
```console
npm ci
npm run dev
```

Open the local URL printed by Vite. The block should move from Start to Loop,
wrap to the beginning every 2.4 seconds, and show its current progress. If the
development server cannot start, confirm your Node.js version with
`node --version`, stop any process already using the printed port, and retry
`npm run dev`.

<!-- twa:step id=STEP-02 -->
## Define the hook's input policy

Create `src/hooks/animationFramePolicy.js`. The hook accepts a callback, a
Boolean running state, and a finite non-negative delta cap. Rejecting invalid
values at render time makes misuse fail close to the caller instead of inside a
later browser callback.

<!-- twa:snippet id=SNIP-02 class=canonical -->
```js
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
```

The 100 millisecond default is a product policy for this visual example. A
physics simulation might use fixed steps, an audio visualization might follow
an external clock, and a game might pause its simulation entirely. Make that
decision explicit instead of inheriting the browser's delay as application
behavior.

<!-- twa:step id=STEP-03 -->
## Build the scheduling and cleanup lifecycle

Create `src/hooks/useRequestAnimationFrame.js` with an Effect Event and an
effect. The Effect Event reads the caller's latest committed callback. The
effect owns the browser request lifecycle and depends only on values that
should reconnect that lifecycle.

<!-- twa:snippet id=SNIP-03 class=canonical -->
```js
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
```

The callback itself is not a dependency of the scheduling effect. A component
normally creates a new inline callback during each render. Including it would
tear down and restart the loop after every frame-driven state update. React
19.2's `useEffectEvent` lets this effect-driven frame event call the latest
committed callback while the scheduling lifecycle depends only on the running
state and timing policy. It belongs to this hook's effect and must not be
passed to another component or used to hide a reactive dependency.

`previousTimestamp` starts at `null`, so the first callback reports a zero
delta. That prevents setup latency from becoming movement. The lower clamp
also normalizes a negative difference to zero. Browser timestamps should be
monotonic, but the invariant makes the hook's behavior explicit and testable.

The latest request identifier replaces the previous identifier after every
callback. Cleanup first marks the loop inactive, then cancels the request that
is still outstanding. The second active check matters when caller logic causes
synchronous teardown: the returning callback must not queue new work after its
cleanup has run. `null` is the sentinel because a browser request identifier can
eventually be zero. React Strict Mode runs an additional development-only setup
and cleanup probe; this effect passes that probe because every setup has a
matching cancel.

<!-- twa:step id=STEP-04 -->
## Stop scheduling when the user prefers reduced motion

The CSS `prefers-reduced-motion` media feature exposes a user preference, but
CSS alone cannot stop a JavaScript scheduling loop. Create
`src/hooks/usePrefersReducedMotion.js` to read the media query, subscribe to
changes, and remove the same listener during cleanup.

<!-- twa:snippet id=SNIP-04 class=canonical -->
```js
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
```

`useSyncExternalStore` reads the current query as a snapshot, rechecks it around
subscription setup, and uses a safe false server snapshot. The subscription is
installed only when an add and remove method form a complete pair, including
the older listener API. This avoids stale state if the preference changes while
React is connecting the external browser store.

<!-- twa:step id=STEP-05 -->
## Connect elapsed time to an observable interface

The hook should schedule time, not own a particular animation. The component
below turns elapsed time into progress and renders a block. Create
`src/components/BotBlock.jsx`:

<!-- twa:snippet id=SNIP-05 class=canonical -->
```jsx
function BotBlock({ progress }) {
  const boundedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage = boundedProgress * 100;

  return (
    <div className="animation-track" aria-hidden="true">
      <span className="track-label track-label-start">Start</span>
      <span className="track-label track-label-finish">Loop</span>
      <div
        className="bot-block"
        style={{
          left: `${percentage}%`,
          transform: `translateX(-${percentage}%)`,
        }}
      >
        <span>rAF</span>
      </div>
    </div>
  );
}

export default BotBlock;
```

The track is decorative, so it is hidden from the accessibility tree. The
application exposes the meaningful running state, motion preference, progress,
and control results as text instead.

Replace `src/App.jsx` with the complete integration:

<!-- twa:snippet id=SNIP-06 class=canonical -->
```jsx
import { useState } from 'react';
import BotBlock from './components/BotBlock';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useRequestAnimationFrame } from './hooks/useRequestAnimationFrame';
import './App.css';

const LOOP_DURATION_MS = 2400;
const MAX_DELTA_MS = 100;

function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isRunning, setIsRunning] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastAction, setLastAction] = useState('initial');
  const canAnimate = isRunning && !prefersReducedMotion;

  useRequestAnimationFrame(
    ({ deltaMs }) => {
      setElapsedMs((current) => (current + deltaMs) % LOOP_DURATION_MS);
    },
    { isRunning: canAnimate, maxDeltaMs: MAX_DELTA_MS }
  );

  const progress = elapsedMs / LOOP_DURATION_MS;
  const progressPercentage = Math.round(progress * 100);

  let statusMessage;
  if (prefersReducedMotion) {
    statusMessage =
      lastAction === 'restart'
        ? 'Animation reset. Reduced motion keeps it paused.'
        : 'Animation paused because reduced motion is enabled in system settings.';
  } else if (lastAction === 'restart') {
    statusMessage = 'Animation restarted.';
  } else if (lastAction === 'resume') {
    statusMessage = 'Animation resumed.';
  } else {
    statusMessage = isRunning ? 'Animation running.' : 'Animation paused.';
  }

  const toggleAnimation = () => {
    const next = !isRunning;
    setIsRunning(next);
    setLastAction(next ? 'resume' : 'pause');
  };

  const restartAnimation = () => {
    setElapsedMs(0);
    setIsRunning(true);
    setLastAction('restart');
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">React hook field guide</p>
        <h1>Build a resilient animation frame loop</h1>
        <p className="hero-summary">
          Drive motion from browser timestamps, keep the latest React callback,
          and clean up every scheduled frame without restarting the loop on
          ordinary renders.
        </p>
        <ul className="feature-list" aria-label="Example characteristics">
          <li>React 19</li>
          <li>Timestamp driven</li>
          <li>Reduced motion aware</li>
        </ul>
      </header>
      <main>
        <section className="demo-card" aria-labelledby="demo-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Live behavior</p>
              <h2 id="demo-title">A loop you can interrupt safely</h2>
            </div>
            <span className={`state-badge ${canAnimate ? 'is-running' : ''}`}>
              {canAnimate ? 'Running' : 'Paused'}
            </span>
          </div>
          <p className="demo-intro">
            The block completes one loop every 2.4 seconds. Pause, resume, or
            restart it while the hook owns scheduling and cleanup.
          </p>

          <BotBlock progress={progress} />

          <dl className="readout" aria-label="Animation policy">
            <div>
              <dt>Loop progress</dt>
              <dd>{progressPercentage}%</dd>
            </div>
            <div>
              <dt>Maximum frame delta</dt>
              <dd>{MAX_DELTA_MS} ms</dd>
            </div>
            <div>
              <dt>Motion preference</dt>
              <dd>{prefersReducedMotion ? 'Reduce' : 'No preference'}</dd>
            </div>
          </dl>

          <div
            className="button-group"
            role="group"
            aria-label="Animation controls"
          >
            <button
              type="button"
              onClick={toggleAnimation}
              disabled={prefersReducedMotion}
            >
              {isRunning ? 'Pause animation' : 'Resume animation'}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={restartAnimation}
            >
              Restart animation
            </button>
          </div>
          <p className="status-message" role="status" aria-atomic="true">
            {statusMessage}
          </p>
        </section>

        <section className="guarantees" aria-labelledby="guarantees-title">
          <p className="section-kicker">Hook contract</p>
          <h2 id="guarantees-title">Three guarantees worth testing</h2>
          <div className="guarantee-grid">
            <article>
              <span className="guarantee-number">01</span>
              <h3>Current callback</h3>
              <p>
                An Effect Event reads the latest callback without making the
                scheduling effect restart after every render.
              </p>
            </article>
            <article>
              <span className="guarantee-number">02</span>
              <h3>Bounded resume</h3>
              <p>
                A configurable delta cap prevents one delayed frame from
                applying the entire pause as movement.
              </p>
            </article>
            <article>
              <span className="guarantee-number">03</span>
              <h3>Exact cleanup</h3>
              <p>
                Pausing, changing policy, and unmounting cancel the most recent
                request identifier.
              </p>
            </article>
          </div>
        </section>
      </main>
      <footer>
        <p>
          Explore the implementation in <code>src/hooks</code>, then follow the
          complete walkthrough in <code>article/tutorial.md</code>.
        </p>
      </footer>
    </div>
  );
}

export default App;
```

The functional state update adds only the latest frame delta. Modulo keeps the
value inside one loop. Restart resets elapsed time and restores the user's
running state, while `canAnimate` still gives the system motion preference the
final say. Reduced motion therefore prevents the hook from scheduling any
frame, even after Restart.

Use the repository's `src/App.css` and `src/index.css` for the presentation.
Those styles provide responsive layout, visible focus, non-color status text,
forced-color borders, and a CSS reduced-motion fallback. The JavaScript hook is
still responsible for stopping JavaScript work.

<!-- twa:step id=STEP-06 -->
## Verify timing, cleanup, interaction, and article drift

Run the complete repository check from this directory:

<!-- twa:snippet id=SNIP-07 class=command -->
```console
npm run check
```

The command checks formatting, runs ESLint, executes the behavior tests,
compares canonical listings and exact excerpts with repository sources,
validates the documented scripts and teaching history, and creates the
production bundle.

The timing test drives the queued callback with controlled timestamps, then
asserts first-frame, ordinary, capped, and negative-delta behavior:

<!-- twa:snippet id=SNIP-08 class=excerpt -->
```jsx
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
```

The tests cover first-frame behavior, ordinary and long timestamp gaps,
negative deltas, fresh callbacks, pause and unmount cleanup, zero-valued request
identifiers, synchronous teardown, policy changes, the Strict Mode probe,
invalid options, initial media-query synchronization, complete and incomplete
media-query listener APIs,
reduced-motion changes, status messages, restart behavior, heading structure,
and keyboard access to the controls.

These automated checks do not measure actual smoothness, frame rate, paint
cost, battery use, contrast after every platform override, zoom and reflow,
screen-reader usability, or assistive-technology behavior. Perform manual
browser and assistive-technology review before making a release claim.

<!-- twa:step id=STEP-07 -->
## Diagnose failures and choose production behavior

Use the failing layer to localize recovery:

- If `npm ci` fails, confirm the supported Node.js range and retry with the
  committed lockfile.
- If a canonical tutorial snippet fails, update the article and repository
  together. `npm run verify:tutorial` names the drifted snippet and source.
- If the first frame jumps, confirm `previousTimestamp` starts at `null` and
  the first delta is zero.
- If pause or unmount leaves work queued, confirm the cleanup cancels the most
  recently stored request identifier.
- If an inline callback restarts the loop on every render, keep it out of the
  scheduling effect's dependency list and call it through the hook-local
  Effect Event.
- If reduced motion changes do not apply, inspect the `matchMedia` query and
  listener cleanup before changing the animation state.
- If the production output is stale, run `npm run build` again.

Reloading the page resets all in-memory state. Stop Vite with `Ctrl+C`. The
example creates no account, remote data, persistent browser storage, service
worker, or background service.

Rendering React state on every frame is appropriate for this focused lesson,
not automatically for a complex interface. Measure the real application. CSS
or the Web Animations API may avoid per-frame React renders, while canvas or a
specialized library may better fit many independently animated objects. If a
simulation must remain deterministic across long pauses, replace the visual
delta cap with an explicit fixed-step or catch-up policy and test that policy
as part of the product contract.

## Primary sources

- [MDN: `requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [MDN: `cancelAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame)
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React: `useEffect`](https://react.dev/reference/react/useEffect)
- [React: `useEffectEvent`](https://react.dev/reference/react/useEffectEvent)
- [React: `useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore)
- [React 19.2 release notes](https://react.dev/blog/2025/10/01/react-19-2)
- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [Vite 8 announcement](https://vite.dev/blog/announcing-vite8)

The repository retains its existing MIT License. Review dependency and asset
rights again before redistributing a materially different version.
