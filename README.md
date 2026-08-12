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

- Node.js 20.19 or later in the 20.x line, Node.js 22.13 or later in the
  22.x line, or Node.js 24 or later, with npm.
- A browser with `requestAnimationFrame`, `cancelAnimationFrame`, and
  `matchMedia`.

From this directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by the development server. Pause, resume, and
restart the block. Enable reduced motion in the operating system and reload to
confirm the animation remains paused.

## Verify the example

Run static analysis and the behavior tests once:

```sh
npm run lint
npm run test:ci
```

Create the production bundle:

```sh
npm run build
```

Run `npm run preview` to inspect the generated `dist` directory locally.

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
remove the generated `dist` directory and rerun `npm run build`. Reloading the
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

On 2026-08-11, the exact Vite 8.2.1 and Vitest 4.1.10 dependency closure
reported zero known vulnerabilities through npm audit. This replaces the
retired Create React App dependency tree that previously reported 28 findings.
Re-run the audit whenever the lockfile changes because registry advisories and
the resolved closure can change.

## Limits and production differences

- Re-rendering React state on every frame is appropriate for this small lesson,
  not automatically for a complex animation. Profile the actual interface and
  consider CSS, Web Animations, canvas, or an animation library when they better
  fit the rendering model.
- Browsers usually pause frame callbacks in background tabs, but exact behavior
  varies. Application state must not depend on receiving every frame.
- The default delta cap is a product policy, not a web-platform guarantee.
- Git history preserves the earlier React 18 and Create React App 5 checkpoint.
  The current checkpoint uses Vite 8.2.1 and Vitest 4.1.10 while keeping the
  application behavior and React version stable.
- Vite 8 targets its current modern browser baseline by default. Confirm the
  production browser support policy before delivery and add a reviewed legacy
  build strategy only when the intended audience requires it.

## Sources

- [MDN: `requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)
- [MDN: `cancelAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/cancelAnimationFrame)
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React: Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)
- [Vite: Getting Started](https://vite.dev/guide/)
- [Vitest: Getting Started](https://vitest.dev/guide/)

## License

The existing [MIT License](LICENSE) applies to this example repository.
