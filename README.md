# React request-animation-frame hook example

This example implements a reusable React hook around
`requestAnimationFrame`. The demo moves a block from browser-supplied
timestamps, supports pause and restart controls, cancels pending work, bounds
large resume deltas, and honors the user’s reduced-motion preference.

## Audience and outcome

This repository is for React developers who understand state, effects, refs,
and effect cleanup. After running it, you can explain why an animation loop
must use the frame timestamp, keep the latest callback without restarting the
loop, and cancel its most recent frame request during cleanup.

The hook controls scheduling only. It is not a physics engine, timeline
library, or replacement for CSS transitions and animations.

## Mental model

`requestAnimationFrame` schedules one callback before a future repaint. The
callback must schedule the next frame if the animation should continue. Each
callback receives a high-resolution timestamp, so movement can be based on
elapsed time rather than assuming a particular display refresh rate.

`useRequestAnimationFrame` separates two responsibilities:

1. A ref always points to the latest caller callback, so ordinary renders do
   not restart the loop.
2. An effect owns the frame lifecycle. It starts only while `isRunning` is
   true and cancels the latest frame identifier during cleanup.

The hook caps a single delta at 100 milliseconds by default. That policy keeps
this visual demo from jumping across the track after a long suspension. A real
simulation should choose its own pause, catch-up, or fixed-step policy.

## Run the example

Prerequisites:

- A current Node.js LTS release with npm.
- A browser with `requestAnimationFrame`, `cancelAnimationFrame`, and
  `matchMedia`.

From this directory:

```sh
npm ci
npm start
```

Open the local URL printed by the development server. Pause, resume, and
restart the block. Enable reduced motion in the operating system and reload to
confirm the animation remains paused.

## Verify the example

Run the behavior tests once:

```sh
npm run test:ci
```

Create the production bundle:

```sh
npm run build
```

The tests verify timestamp-based progress, bounded large deltas, paused state,
latest-frame cancellation, controls, visible status feedback, and the
reduced-motion branch. They do not measure frame rate, battery use, paint cost,
or smoothness on real hardware.

## Failure and recovery

Pausing or unmounting cancels the latest scheduled frame. Resuming creates a
new loop whose first delta is zero, so time spent paused is not applied as
movement. A negative timestamp difference is normalized to zero, and an
unusually large difference is capped.

If installation fails, remove the generated `node_modules` directory and run
`npm ci` again with the committed lockfile. If a production build is stale,
remove the generated `build` directory and rerun `npm run build`. Reloading the
page resets the in-memory animation state.

Stop the development server with `Ctrl+C`. The example creates no account,
remote data, persistent browser storage, or background service.

## Accessibility behavior

- Native buttons provide keyboard and touch interaction with visible focus.
- Pause and restart actions return a polite visible status message.
- The decorative moving block is hidden from the accessibility tree.
- A reduced-motion preference prevents frame scheduling and disables the pause
  control while restart remains a harmless reset.

Manual keyboard, zoom, high-contrast, reduced-motion, and assistive-technology
review is still required for a release claim.

## Dependency security status

On 2026-08-11, a non-forced `npm audit fix` reduced this repository's
`npm audit --omit=dev` result from 64 findings to 28: 9 low, 5 moderate,
and 14 high. A second safe remediation pass made no further change. The
remaining chains are owned by Create React App's build, test, asset, and
development-server dependencies. npm's forced proposal would install the
invalid `react-scripts@0.0.0` package and was not applied.

Treat the remaining findings and the unmaintained toolchain as a production
release blocker. Run the development server only against trusted local source,
do not expose it to an untrusted network, and migrate the example before using
its toolchain for production delivery. Re-audit the migrated exact lockfile.

## Limits and production differences

- Re-rendering React state on every frame is appropriate for this small lesson,
  not automatically for a complex animation. Profile the actual interface and
  consider CSS, Web Animations, canvas, or an animation library when they better
  fit the rendering model.
- Browsers usually pause frame callbacks in background tabs, but exact behavior
  varies. Application state must not depend on receiving every frame.
- The default delta cap is a product policy, not a web-platform guarantee.
- This repository preserves its React 18 and Create React App 5 teaching
  checkpoint. Create React App is deprecated. Treat migration to an actively
  maintained framework or build tool as a separate compatibility change.

## Sources

- [MDN: `requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)
- [MDN: `cancelAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/cancelAnimationFrame)
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React: Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)

## License

The existing [MIT License](LICENSE) applies to this example repository.
