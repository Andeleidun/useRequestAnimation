# Sources and Provenance: Resilient React Animation Frame Hook

**Last checked:** 2026-09-15  
**Claim basis:** repository implementation plus primary documentation

## Technical sources

| Source                                                                                                                        | Use in this pair                                                                           | Applicability and limits                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| [React 19.2](https://react.dev/blog/2025/10/01/react-19-2)                                                                    | Release basis for `useEffectEvent` in this React 19.2.8 example                            | The package manifest and lockfile establish the exact installed patch version.                                                    |
| [`useEffectEvent`](https://react.dev/reference/react/useEffectEvent)                                                          | Reading the latest committed animation callback without reconnecting the scheduling effect | This pair requires React 19.2.8 and does not present the hook as compatible with earlier React versions.                          |
| [`useEffect`](https://react.dev/reference/react/useEffect)                                                                    | Owning the external request and cleanup lifecycle                                          | Repository tests establish the example's exact scheduling, teardown, and Strict Mode behavior.                                    |
| [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore)                                              | Subscribing to the browser's reduced-motion media-query state                              | The hook supplies an explicit server snapshot and tests modern, legacy, incomplete, and unavailable listener interfaces.          |
| [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)                      | Browser timestamp and scheduling semantics                                                 | The browser owns cadence and throttling. The 100 millisecond delta cap is the example's visual policy.                            |
| [`cancelAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame)                        | Canceling the most recently scheduled callback                                             | The implementation and tests cover zero-valued identifiers and synchronous teardown.                                              |
| [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) | User motion-preference query                                                               | This example stops JavaScript scheduling and also applies static CSS safeguards. It does not establish all product motion policy. |
| [Vite 8.0 announcement](https://vite.dev/blog/announcing-vite8)                                                               | Toolchain generation and Node.js floor context                                             | The lockfile and `package.json` are authoritative for exact versions.                                                             |
| [Node.js releases](https://nodejs.org/en/about/previous-releases)                                                             | Runtime lifecycle context                                                                  | The supported local ranges are the exact `engines.node` expression in `package.json`.                                             |

## Repository and content provenance

- The public example originated in this child repository and retains its
  existing MIT license file and 2024 copyright notice.
- The tutorial-pair work adopts and completes the coherent staged and unstaged
  animation tutorial changes found in the inspected child worktree. It does
  not discard or rewrite that prior work.
- Example copy and test data are synthetic. No private connector data,
  credentials, personal messages, or production datasets are used.
- `package-lock.json` and `package.json` are the authoritative dependency
  inventory. Documentation pages do not establish performance, battery, or
  smoothness results for a product workload.

## Rights and release limits

The current SVG favicon was present in the adopted worktree, but its author and
redistribution provenance still require owner confirmation. Keep the pair
internal until that review is recorded or the asset is replaced with a
reviewed alternative. The existing MIT file is preserved; this record does not
reinterpret its legal scope or authorize publication.
