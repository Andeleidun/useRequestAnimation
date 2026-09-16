# Design: Build a Resilient React Animation Frame Hook

## Outcome

The reader can run and inspect a hook that calculates frame deltas from browser
timestamps, calls the latest committed React callback without reconnecting the
scheduling effect, cancels outstanding work, bounds delayed frames, and stops
JavaScript scheduling for reduced motion.

## Non-goals

- Providing a fixed-step simulation, game loop, physics engine, or general
  animation timeline.
- Guaranteeing frame rate, smoothness, paint cost, or battery use.
- Replacing CSS animation, the Web Animations API, canvas, or a specialized
  library when one owns the behavior more directly.
- Supporting React versions without the selected Effect Event API.
- Deployment or publication.

## Ownership and boundaries

- `animationFramePolicy.js` owns public argument validation and the default
  long-gap cap.
- `useRequestAnimationFrame.js` owns the browser request lifecycle, timestamp
  state, delta clamping, active guard, and latest request identifier.
- The hook-local Effect Event owns access to the latest committed callback.
- `usePrefersReducedMotion.js` owns the live media-query subscription and safe
  server snapshot.
- `App` owns elapsed animation state and control semantics.
- `BotBlock` converts bounded progress to a decorative position.
- The browser owns timestamp delivery, repaint timing, background throttling,
  and media-query behavior.

## Accepted requirements

| ID     | Requirement                                                                               | Validation                                                       |
| ------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| RAF-01 | Reject invalid callback, running-state, and delta-cap inputs                              | policy assertions                                                |
| RAF-02 | Report zero for the first delta and clamp later deltas to the inclusive zero-to-cap range | controlled timestamp tests                                       |
| RAF-03 | Use the latest committed callback without reconnecting the scheduling effect              | callback rerender test                                           |
| RAF-04 | Cancel the latest identifier and prevent rescheduling after synchronous teardown          | pause, unmount, zero-identifier, teardown, and Strict Mode tests |
| RAF-05 | Reconnect and reset timing when running state or delta policy changes                     | pause and policy-change tests                                    |
| RAF-06 | Track live reduced motion through complete modern or legacy listener pairs                | media-query hook tests                                           |
| RAF-07 | Expose observable native controls, state text, and status feedback                        | application interaction tests                                    |
| RAF-08 | Article steps, snippets, commands, and claims remain bound to source                      | static tutorial verifier                                         |

## Failure and recovery

Invalid options fail during render before browser scheduling. Pausing, policy
change, unmount, and Strict Mode cleanup cancel the latest known request. The
active flag prevents a callback from scheduling again after synchronous
teardown. A resumed sequence starts with a zero delta. Reloading resets all
in-memory state; a fresh build replaces generated output.

If motion is unexpectedly active, inspect the media-query snapshot and paired
listener cleanup before changing animation state. If a delayed frame jumps too
far, revisit the explicit delta policy rather than hiding the symptom in the
position calculation.

## Accessibility and performance evidence

The interface uses native buttons, visible focus, text state, a polite status
region, responsive layout, forced-color rules, and a JavaScript stop for reduced
motion. Automated tests cover exercised semantics and preference changes. They
do not establish screen-reader usability, rendered contrast, zoom and reflow,
smoothness, frame rate, battery use, or paint cost. Those remain separate manual
or measured evidence.

## Teaching checkpoints

1. Establish the locked Vite example and portability rules.
2. Define the hook's public callback, running-state, and delta policy.
3. Implement timestamp calculation, current callback access, scheduling, and
   cleanup.
4. Track live reduced motion through complete listener pairs.
5. Connect observable controls, status, motion, and layout.

Each checkpoint matches one additive commit in the constructed teaching
history and owns a unique set of example paths.

## Review limits

The 100 millisecond cap is a visual policy for this example, not a browser or
simulation guarantee. Production work must measure the real feature and define
background, visibility, navigation, pause, clock, and rendering policy as
needed.
