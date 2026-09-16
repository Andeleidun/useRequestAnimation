# Build a resilient `requestAnimationFrame` hook in React

This repository accompanies the [full tutorial](article/tutorial.md). Together,
they build and verify a reusable React hook that drives motion from browser
timestamps, reads the latest callback without restarting its loop, cancels
pending work, bounds long frame gaps, and stops JavaScript scheduling when the
user prefers reduced motion.

The finished interface makes those behaviors visible. You can pause, resume,
and restart the block while the hook owns timing and cleanup.

## What you will learn

This example is for React developers who already understand components, state,
effects, and effect cleanup. Work through it to learn how to:

- calculate progress from the timestamp supplied by the browser;
- use a React Effect Event to keep callback logic current without reconnecting
  the scheduling effect;
- cancel the latest outstanding request when a loop pauses or unmounts;
- choose and test an explicit policy for long frame gaps; and
- respond when `prefers-reduced-motion` changes while the page is open.

The hook owns scheduling, not animation design. It is not a physics engine,
timeline system, or automatic replacement for CSS animations, the Web
Animations API, canvas, or a dedicated animation library.

## Before you start

Use one of these Node.js lines:

- Node.js 22.22.2 or later in the 22.x line
- Node.js 24.15 or later in the 24.x line
- Node.js 26

You also need npm and a modern browser with `requestAnimationFrame`,
`cancelAnimationFrame`, and `matchMedia`.

The lockfile resolves React 19.2.8, Vite 8.2.1, and Vitest 4.1.11. The declared
Node ranges reflect the current direct toolchain's engine intersection. The
checks reported for this revision ran on Node.js 24.15.0.

## Run the example

From this directory, install the exact dependency closure and start Vite:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The block should move from Start to Loop and
wrap every 2.4 seconds. Pause it, resume it, and restart it from a paused state.
Then change the operating system's reduced-motion setting while the page is
open. The loop should stop and the control state should update.

Stop the development server with `Ctrl+C`.

## Understand the hook contract

`useRequestAnimationFrame(callback, options)` calls `callback` with the current
browser timestamp and the bounded time since the previous frame:

```js
{
  timestamp,
  deltaMs,
}
```

`isRunning` defaults to `true`. Setting it to `false` prevents scheduling and
cancels the latest outstanding request during cleanup.

`maxDeltaMs` defaults to `100`. The hook clamps each raw timestamp difference
to the inclusive range from zero through that value. The 100 millisecond cap is
a visual policy for this example, not a browser guarantee.

The callback must be a function, `isRunning` must be a Boolean, and
`maxDeltaMs` must be finite and non-negative. Changing `isRunning` or
`maxDeltaMs` starts a fresh timing sequence whose first delta is zero. Changing
only the callback updates the Effect Event and leaves the scheduling effect in
place.

## Follow the implementation

Use these files with the tutorial:

- `article/tutorial.md` teaches the complete implementation and recovery path.
- `src/hooks/useRequestAnimationFrame.js` owns frame scheduling and cleanup.
- `src/hooks/animationFramePolicy.js` defines the public argument policy.
- `src/hooks/usePrefersReducedMotion.js` tracks the live media query.
- `src/App.jsx` connects the hooks to observable controls and status text.
- `src/**/*.test.jsx` covers lifecycle, boundaries, interaction, and accessible
  behavior.
- `scripts/verifyTutorial.mjs` binds tutorial commands, source listings, the
  exact test excerpt, and documented commands to the repository.

## Verify the pair

Run the complete local gate:

```sh
npm run check
```

That command checks formatting, runs ESLint, executes the tests, reconciles the
tutorial with canonical source, verifies the teaching history, and builds the
production bundle.

The automated suite covers timestamp progress, ordinary and bounded gaps,
negative deltas, fresh callbacks, pause and unmount cancellation, zero-valued
request identifiers, synchronous teardown, policy changes, the Strict Mode
probe, invalid options, initial media-query synchronization, modern and legacy
media-query listeners,
reduced-motion changes, restart behavior, status feedback, heading structure,
and keyboard focus order.

Use the individual commands when you need to localize a failure:

| Command                   | What it establishes                                                 |
| ------------------------- | ------------------------------------------------------------------- |
| `npm run test`            | Runs Vitest in watch mode while you work.                           |
| `npm run test:ci`         | Runs the behavior suite once.                                       |
| `npm run lint`            | Checks the JavaScript and JSX with ESLint.                          |
| `npm run format:check`    | Checks the files owned by Prettier without changing them.           |
| `npm run verify:tutorial` | Reconciles marked tutorial content with the repository.             |
| `npm run build`           | Produces the optimized bundle in `dist`.                            |
| `npm run preview`         | Serves the generated bundle for local review.                       |
| `npm run check`           | Runs formatting, lint, tests, tutorial verification, and the build. |

Automation does not establish smoothness, frame rate, battery use, paint cost,
screen-reader usability, full keyboard usability, zoom and reflow, rendered
contrast, forced-color behavior, or complete accessibility conformance. Review
those states manually before making a release claim.

## Recover from common failures

If `npm ci` fails, confirm that your Node.js version is inside a supported line,
then retry with the committed lockfile.

If the first frame jumps, confirm that `previousTimestamp` starts at `null` and
that the first delta is zero. If one delayed frame moves too far, inspect the
`maxDeltaMs` policy before changing animation math.

If pause or unmount leaves work queued, confirm that cleanup marks the loop
inactive and cancels the most recently stored request identifier. If an inline
callback restarts the loop on every render, keep it out of the scheduling
effect's dependencies and call it through the hook-local Effect Event.

If reduced motion does not apply, inspect the `matchMedia` query and its paired
listener cleanup. If tutorial reconciliation fails, update the named source and
marked tutorial snippet together, then rerun `npm run verify:tutorial`.

Reload the page to reset in-memory animation state. The example creates no
account, remote data, persistent browser storage, service worker, or background
service. Rerun `npm run build` when you need a fresh production bundle.

## Accessibility behavior

The interface uses native buttons for keyboard, pointer, and touch input. Focus
styles add an outline and offset without relying on color alone. Pause,
restart, and reduced-motion results appear in a polite status region, while the
moving track remains decorative and hidden from the accessibility tree.

The animation policy readout exposes meaningful state as text. The JavaScript
loop stops when `prefers-reduced-motion: reduce` matches. Responsive styles
stack the readout and cards at narrower widths, and forced-color styles add
platform-color borders to the primary regions.

These implementation choices still need representative browser and assistive
technology review before release.

## Make the production decision explicitly

Updating React state on every frame fits this focused lesson. Do not assume it
fits a complex interface. Profile the real feature and consider CSS, the Web
Animations API, canvas, or a specialized library when they can own the work
more directly.

Background-tab scheduling varies, so application correctness must not depend on
receiving every frame. A simulation may also need fixed steps or a deliberate
catch-up policy instead of this example's visual delta cap.

Vite targets a modern browser baseline by default. Define the production
browser policy before delivery. A production loop may also need explicit
integration with navigation, page visibility, application pause, or an
external clock.

## Dependencies, assets, and license

On 2026-09-15, npm reported zero known vulnerabilities for the exact locked
dependency closure after the React 19.2.8 and test-tool update. Registry
advisories can change, so rerun the audit whenever the lockfile changes and as
part of normal maintenance.

The existing [MIT License](LICENSE) applies to this repository. The example uses
one local SVG favicon and requires no external fonts, data, or runtime services.
Its redistribution provenance still requires owner confirmation before release.

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
