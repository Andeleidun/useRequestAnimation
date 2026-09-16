# Teaching History: Resilient React Animation Frame Hook

**Format:** standalone Git bundle  
**Bundle:** `teaching-history.bundle`  
**Branch:** `main`  
**Bundle head:** `ff230ba69aded5a8d2a8ec8ad3d3e451e19c6d4b`  
**Identity:** `Technical Writing Assistant <twa@example.invalid>`  
**Constructed:** 2026-09-15

## Purpose and boundary

This bundle contains a separate additive learner history. It does not rewrite,
merge with, or add refs to this child repository's existing `main` history.
The teaching repository has no configured remote and no tags. Pair records,
article files, README content, verification tooling, the earlier explanation
draft, and the bundle itself are outside its declared example snapshot.

## Checkpoints

| Step | Commit                                     | Learner outcome                                                             | Files introduced                                                   | Check completed before promotion                |
| ---- | ------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| 1    | `07c46ea6dacd002a980101463e128a09c4b8b7e1` | Establish the locked Vite example and portability rules                     | configuration, lockfile, license, HTML, and public assets          | `npm ci --ignore-scripts`                       |
| 2    | `5363be5c2be4df11fb96c023559a5a52dbdfd87c` | Define the public callback, running-state, and delta policy                 | `src/hooks/animationFramePolicy.js`                                | ESLint on the policy source                     |
| 3    | `bd990998c180511f685e5ee7edbdf5afd89eddae` | Own timestamp calculation, current callback access, scheduling, and cleanup | animation hook, setup, and lifecycle tests                         | focused animation-hook tests                    |
| 4    | `bd97ff0adf9eadac393412ddac6dc6c68eb3c308` | Track live reduced-motion state through supported listener pairs            | media-query hook and focused tests                                 | focused reduced-motion tests                    |
| 5    | `ff230ba69aded5a8d2a8ec8ad3d3e451e19c6d4b` | Connect observable controls, status, motion, and layout                     | application, component, styles, entry point, and integration tests | lint, complete test suite, and production build |

Each example path enters the learner history in one checkpoint. The final
snapshot contains only the allowlisted runnable-example files enforced by
`scripts/verifyTeachingHistory.mjs`.

## Reconstruction and verification

From this repository root, reconstruct the branch in a disposable directory:

```sh
git clone --branch main teaching-history.bundle reconstructed-animation-hook
```

The repository verifier checks bundle validity, the sole branch ref, linear
parentage, author and committer identity, recorded checkpoint hashes, disjoint
checkpoint path ownership, allowlisted file-set parity, and byte parity with
the current example. Remove the disposable reconstruction after inspection.

The bundle is internal evidence. Its SVG favicon remains subject to the rights
limit recorded in `sources.md`.
