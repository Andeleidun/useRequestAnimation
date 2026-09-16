# Verification Record: Resilient React Animation Frame Hook

**Record date:** 2026-09-15  
**Candidate state:** uncommitted internal worktree  
**Basis HEAD:** `589bfdffb7c4ba37da8ba69166d97bb0906b4e1f`  
**Bundle head:** `ff230ba69aded5a8d2a8ec8ad3d3e451e19c6d4b`

## Execution environment and frozen hashes

- Windows in the repository workspace
- Node.js 24.15.0
- npm 11.14.1
- React and build-tool versions from the exact lockfile

| Artifact                  | SHA-256                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| `article/tutorial.md`     | `6ca3fff7886f1ead9b995715a5a54eb1a52d1ffa74c87c13baff84eaff620f06` |
| `README.md`               | `5aa2501e0307d4d02221e17fb9a5f2353d9b1cf24bc7128f64624de6cc020e5a` |
| `package-lock.json`       | `723fa7fed58ba912fd6a80162f568cec9ccdc61d792ffb1065bf1ddf77827edb` |
| `teaching-history.bundle` | `b5088b064098099a69bb44996406ac9866e2974fe2c4a266eb3691055606fce8` |

## Automated evidence

| Lane                           | Status   | Observation                                                                                                    |
| ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------- |
| Teaching checkpoints           | `passed` | five additive commits each passed its recorded install, focused, lint, test, or build check                    |
| Tutorial source reconciliation | `passed` | 7 steps, 8 snippets, 5 canonical files, and 1 exact excerpt reconciled                                         |
| Complete behavior suite        | `passed` | 3 files and 17 tests passed on Vitest 4.1.11                                                                   |
| Format, lint, and build        | `passed` | Prettier check, ESLint, and Vite 8.2.1 production build passed                                                 |
| Composite `npm run check`      | `passed` | complete gate passed after output-claim repair, security update, and history rebuild                           |
| Dependency audit               | `passed` | after updating Vitest to 4.1.11, `npm audit --json` reported zero known vulnerabilities for the exact lockfile |

## Manual evidence

| Review                          | Status            | Required scope                                                                      |
| ------------------------------- | ----------------- | ----------------------------------------------------------------------------------- |
| Article and README rendering    | `manual_required` | headings, links, fences, wrapping, and standalone comprehension                     |
| Keyboard and visible focus      | `manual_required` | pause, resume, restart, state text, status results, and focus visibility            |
| Motion behavior                 | `manual_required` | live reduced-motion changes, disabled motion, and recovery when preference changes  |
| Zoom, reflow, and forced colors | `manual_required` | 200 and 400 percent zoom, narrow layout, and supported high-contrast mode           |
| Performance                     | `manual_required` | profile the intended product workload before adopting per-frame React state updates |
| Asset and license scope         | `blocked`         | SVG favicon provenance requires owner review before external distribution           |

## Evidence limits

The current child HEAD predates the adopted staged and unstaged worktree. A
passing local command establishes only the inspected worktree bytes. No release
approval, remote reachability, publication, deployment, performance result,
smoothness guarantee, battery result, or complete accessibility conformance is
claimed.
