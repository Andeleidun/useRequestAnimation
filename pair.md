# Pair Record: Resilient React Animation Frame Hook

**Pair ID:** `react-request-animation-frame`  
**Status:** internal technical candidate; release blocked  
**Distribution:** internal candidate  
**Sensitivity:** public synthetic content

## Source basis

- Inspected child HEAD: `589bfdffb7c4ba37da8ba69166d97bb0906b4e1f`.
- The child worktree was already dirty at intake. Its coherent staged and
  unstaged animation tutorial changes were preserved and adopted as the basis
  for this implementation.
- The parent gitlink has not been advanced; a final immutable candidate ref is
  still required before release review.

## Teaching contract

- **Reader:** a React developer who understands components, state, effects, and
  effect cleanup and needs a JavaScript-driven animation-frame loop.
- **Outcome:** run a reusable hook that derives elapsed time from browser
  timestamps, reads the latest callback without reconnecting the loop, cancels
  pending work, bounds long gaps, and stops scheduling for reduced motion.
- **Prerequisites:** Node.js 22.22.2 or later in major 22, Node.js 24.15 or later
  in major 24, or Node.js 26, plus npm and a modern browser with
  `requestAnimationFrame`, `cancelAnimationFrame`, and `matchMedia`.
- **Environment:** React 19.2.8, Vite 8.2.1, Vitest 4.1.11, and a local browser.
- **Non-goals:** a physics engine, timeline system, game loop, performance
  guarantee, animation library, deployment, and publication.

## Canonical artifacts

- Article: `article/tutorial.md`
- Runnable example: this repository root
- Example documentation: `README.md`
- Design and requirements: `design.md`
- Teaching history: `history.md`
- Teaching bundle: `teaching-history.bundle`
- Verification: `verification.md`
- Sources and provenance: `sources.md`
- Static reconciliation: `scripts/verifyTutorial.mjs`

The repository source is canonical for executable behavior. The human-readable
records follow the internal format used by the newer TWA pairs. The current TWA
v1 workflow does not model a repository-root example, so no generated pair lock
or release approval is claimed.

## Directional decisions

- **DG-01 AudienceOutcome:** preserve the current article's experienced React
  audience and one observable pause, resume, restart, and reduced-motion flow.
- **DG-02 ProductBoundary:** keep a visual timing example with explicit delta
  policy and no claim that per-frame React rendering fits every product.
- **DG-03 ArchitectureDirection:** use React 19.2 Effect Events for the latest
  callback, an effect for request ownership, `useSyncExternalStore` for the
  media query, and native controls for the interface.
- **DG-04 HistoryPackaging:** preserve `main`; construct a separate additive
  teaching repository and retain its exact internal bundle.
- **DG-05 DistributionRights:** keep the pair internal until prose, dependency,
  favicon, and existing MIT license scope have been reviewed.
- **DG-06 CompatibilityMigration:** retain the exact React 19.2.8 and current
  toolchain basis because `useEffectEvent` is part of the lesson.
- **DG-07 ReleaseApproval:** not open. The current worktree is not an immutable
  candidate, and manual evidence, sealing workflow, and destination are
  incomplete.

## Requirement traceability

| Requirement                              | Implementation                           | Validation                                                                      |
| ---------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| RAF-01 closed hook policy                | `animationFramePolicy.js`                | valid and invalid option tests                                                  |
| RAF-02 timestamp and delta policy        | `useRequestAnimationFrame.js`            | first, ordinary, capped, and negative delta tests                               |
| RAF-03 latest callback without reconnect | Effect Event in the hook                 | rerender and scheduling-count test                                              |
| RAF-04 exact scheduling cleanup          | active guard and latest frame identifier | pause, unmount, zero identifier, synchronous teardown, and Strict Mode tests    |
| RAF-05 live reduced-motion ownership     | `usePrefersReducedMotion.js`             | unavailable, changed, connection-race, modern, legacy, and incomplete API tests |
| RAF-06 observable integration            | `App.jsx`, `BotBlock.jsx`                | pause, restart, status, structure, focus, and preference tests                  |
| RAF-07 scoped accessibility evidence     | semantic UI, styles, article, and README | automated interaction plus separate manual review                               |
| RAF-08 article-to-code agreement         | article markers and `verifyTutorial.mjs` | exact canonical, excerpt, command, and history checks                           |
| RAF-09 truthful production boundary      | article, README, and `sources.md`        | technical, performance, accessibility, and rights review                        |
