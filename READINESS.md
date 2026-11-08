# Readiness: ai-industry-map-explorer

| works | usable | polished | production | operated |
| --- | --- | --- | --- | --- |
| not-met | not-met | not-met | not-met (target) | not-targeted |

Target: production

## Next gaps

- typecheck (failing): Type check passes. Not applicable only when package.json has no typecheck script and the app has no tsconfig.json.
- B1.1 (could-not-tell): Every core flow named in SPEC.md runs end to end.
- B1.3 (no-check): PRODUCT.md names who the app is for and why it exists.

## B1 Purpose and core flows

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B1.1 | Every core flow named in SPEC.md runs end to end. | agent | could-not-tell | 2026-11-08 |
| B1.2 | A fresh judge finds the app does what PRODUCT.md, SPEC.md and Douglas's asks say. | judge | could-not-tell | 2026-11-08 |
| B1.3 | PRODUCT.md names who the app is for and why it exists. | auto | no-check | never |

## B2 Feedback and response time

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B2.1 | A control reacts within 0.1 s. | agent | could-not-tell | 2026-11-08 |
| B2.2 | Any wait over 1 s shows progress. | agent | could-not-tell | 2026-11-08 |
| B2.3 | Work over 10 s can be left running or cancelled. | agent | could-not-tell | 2026-11-08 |

## B3 States

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B3.1 | Every data region has loading, empty and error states. | auto | could-not-tell | 2026-11-08 |
| B3.3 | An empty state says what belongs there and offers one action. | judge | could-not-tell | 2026-11-08 |

## B4 Errors and recovery

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B4.1 | No uncaught errors on the core flows. | auto | met | 2026-11-08 |
| B4.2 | An error message says what happened and what to do next. | judge | failing | 2026-11-08 |
| B4.3 | A failed action can be retried without retyping. | agent | met | 2026-11-08 |

## B5 Data safety and undo

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B5.1 | Nothing typed is lost on reload, back or crash. | agent | failing | 2026-11-08 |
| B5.2 | Reversible actions can be undone; only irreversible ones ask to confirm. | agent | failing | 2026-11-08 |

## B6 Navigation

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B6.1 | The user always knows where they are and how to get back. | judge | failing | 2026-11-08 |
| B6.2 | Each view has its own URL and a unique title. | auto | no-check | never |
| B6.3 | Frequent actions have shortcuts. | agent | failing | 2026-11-08 |

## B7 Accessibility to WCAG 2.2 AA

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B7.1 | Core flows work by keyboard alone, with visible focus. | auto | met | 2026-11-08 |
| B7.2 | Text contrast is at least 4.5:1. | auto | could-not-tell | 2026-11-08 |
| B7.3 | Large text and interface graphics contrast is at least 3:1. | auto | no-check | never |
| B7.4 | Zero axe violations at WCAG 2.2 AA. | auto | could-not-tell | 2026-11-08 |
| B7.5 | Pointer targets are at least 24 px. | auto | no-check | never |
| B7.7 | Every non-text element has a text alternative. | auto | could-not-tell | 2026-11-08 |

## B8 Layout from 320 px to 1440 px

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B8.1 | No horizontal scroll or clipped text at 320 px and 1440 px. | auto | met | 2026-11-08 |
| B8.2 | No horizontal scroll or clipped text at 768 px. | auto | met | 2026-11-08 |
| B8.3 | Layout holds at 200% text zoom. | auto | no-check | never |

## B9 Performance budgets

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B9.1 | Nothing jumps around after it loads. | agent | met | 2026-11-08 |
| B9.2 | LCP is at most 2.5 s at the 75th percentile. | auto | failing | 2026-11-08 |
| B9.3 | INP is at most 200 ms at the 75th percentile. | auto | failing | 2026-11-08 |
| B9.4 | CLS is at most 0.1 at the 75th percentile. | auto | failing | 2026-11-08 |

## B10 Error tracking and logs

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B10.1 | Uncaught errors are captured with the release, the route and the last action. | auto | failing | 2026-11-08 |
| B10.2 | Errors reach a place the owner looks, with personal data scrubbed. | agent | failing | 2026-11-08 |
| B10.3 | Logs are structured, one JSON object per line. | auto | failing | 2026-11-08 |

## B11 Security and privacy

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B11.1 | No secrets in the client bundle or the repository. | auto | no-check | never |
| B11.2 | Security headers are set. | auto | failing | 2026-11-08 |
| B11.3 | Privacy and terms pages exist. | auto | failing | 2026-11-08 |

## B12 Onboarding and help

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B12.1 | A transient app is ready the moment it opens, with no setup step. | agent | met | 2026-11-08 |
| B12.2 | A newcomer gets first-run guidance. | judge | failing | 2026-11-08 |
| B12.3 | A first-time user reaches a useful result without help. | agent | failing | 2026-11-08 |

## B13 Copy

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B13.1 | Copy is reread, with no machine vocabulary left. | judge | could-not-tell | 2026-11-08 |

## B14 Visual design

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B14.1 | Visual design follows .agents/DESIGN.md and the project design language. | judge | failing | 2026-11-08 |
| B14.2 | Every style comes from tokens, and dark mode reuses them. | auto | no-check | never |

## B15 Operability

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| B15.1 | A fresh clone runs from one command, with its environment documented. | auto | could-not-tell | 2026-11-08 |
| B15.2 | The deployed address responds. | auto | met | 2026-11-08 |

## VZ1 Overview and reading

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| VZ1.1 | The default view opens on an overview of the whole data set, with its time range stated. \(when the data has a time axis\) | agent | met | 2026-11-08 |

## VZ2 Interaction latency

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| VZ2.3 | A recomputation that takes over 1 s shows progress on the chart's own area. | agent | could-not-tell | 2026-11-08 |

## VZ3 Zoom, filter and details

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| VZ3.3 | Selecting a mark shows its exact value and unit in place, without navigating away. | agent | failing | 2026-11-08 |

## VZ4 Linked views and compare

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| VZ4.1 | Selecting records in one linked view highlights the same records in every linked view. | auto | no-check | never |
| VZ4.2 | A compare shows two selections on one shared scale, with the scale named. | judge | could-not-tell | 2026-11-08 |
| VZ4.3 | A compare's difference is shown with its sign and unit. | agent | could-not-tell | 2026-11-08 |

## VZ5 Shareable state and export

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| VZ5.2 | An export contains exactly the filtered records the view shows. | agent | could-not-tell | 2026-11-08 |
| VZ5.3 | An export names its time range and data source in its header or title. \(when the data has a time axis\) | agent | could-not-tell | 2026-11-08 |

## VZ6 Readable table behind every chart

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| VZ6.1 | Every chart has a table view listing the same records, reachable from the chart. | auto | no-check | never |
| VZ6.2 | Each table column header names its unit, and each numeric cell keeps the unit of its column. | auto | no-check | never |

## VZ7 Dashboard design checklist

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| VZ7.1 | The Before it ships checklist in dashboards.md passes. | judge | could-not-tell | 2026-11-08 |

## runtime Browser runtime errors

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| S-WEB.1 | A window error listener is registered before app code runs, and each uncaught error it receives reaches the error sink. | agent | failing | 2026-11-08 |
| S-WEB.2 | An unhandled promise rejection has its own listener and reaches the error sink. | agent | failing | 2026-11-08 |
| S-WEB.3 | Each route sits inside an error boundary that shows that route's fallback and reports the caught error, and the other routes stay usable. | agent | failing | 2026-11-08 |
| S-WEB.4 | A chunk that fails to load after a deploy shows a reload prompt, not a blank page. | agent | failing | 2026-11-08 |

## release Release symbols

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| S-WEB.5 | Source maps for each release reach the error sink and are not served from the public address. | auto | no-check | never |

## T-PUB Public site

| item | statement | verify | state | last run |
| --- | --- | --- | --- | --- |
| T-PUB.1 | The seo-tags and not-found-page site checks pass on the deployed address. | auto | no-check | never |
| T-PUB.2 | Core Web Vitals are judged on field data from real visits, and the 75th-percentile values are the ones the baseline bounds are checked against. | auto | no-check | never |
| T-PUB.3 | Every public route shows its content to a visitor who has not signed in. | agent | met | 2026-11-08 |
| T-PUB.4 | A production error from the deployed address appears in the error tracker with the original file and line, not minified positions. | auto | no-check | never |

Generated from `.agents/work/readiness.json` by `Test-ProductReadiness.ps1 -Write`; do not edit. States derive from receipts.

`met` means the app's own command reported success. It does not mean the app is correct or good.

Kind: ai-industry-map-explorer | Generated: 2026-11-08T02:44:00.0871225Z | Input hash: efd15c2f9ca7

## Next (checks, detail)

Stage: works

- typecheck (failing): npm run typecheck - child exited 1

## Refresh

```powershell
& 'C:\Program Files\PowerShell\7\pwsh.exe' -NoProfile -NonInteractive -File ~/.agents/tools/Test-ProductReadiness.ps1 -ProductPath . -Profile .agents/app-profile.json -Check all -Write
```

## Stages (checks, detail)

| stage | state |
| --- | --- |
| works | not-met |
| usable | not-met |
| polished | not-met |
| production | not-met |
| operated | not-met |

## Checks (detail)

### works

| check | state | last run | exit | note |
| --- | --- | --- | --- | --- |
| build | met | 2026-11-08T02:38:47.907691Z | 0 |  |
| typecheck | failing | 2026-11-08T02:38:48.3886185Z | 1 | child exited 1 |
| console-clean | met | 2026-11-08T02:38:51.0136956Z | 0 |  |

- tests: package.json declares no test script

### usable

| check | state | last run | exit | note |
| --- | --- | --- | --- | --- |
| loading-state | could-not-tell | 2026-11-08T02:38:51.7475374Z | 2 | \{"check":"loading-state","outcome":"could-not-tell","reason":"no .agents/app-selectors.json selector map","findings":\[\]\} |
| empty-state | could-not-tell | 2026-11-08T02:38:52.6515421Z | 2 | \{"check":"empty-state","outcome":"could-not-tell","reason":"no .agents/app-selectors.json selector map","findings":\[\]\} |
| error-state | could-not-tell | 2026-11-08T02:38:53.4207603Z | 2 | \{"check":"error-state","outcome":"could-not-tell","reason":"no .agents/app-selectors.json selector map","findings":\[\]\} |
| not-found-state | could-not-tell | 2026-11-08T02:38:54.1787439Z | 2 | \{"check":"not-found-state","outcome":"could-not-tell","reason":"no .agents/app-selectors.json selector map","findings":\[\]\} |
| keyboard-focus | met | 2026-11-08T02:38:56.0618567Z | 0 |  |
| error-capture | failing | 2026-11-08T02:38:57.3524347Z | 1 | child exited 1 |
| structured-logs | failing | 2026-11-08T02:38:58.0397539Z | 1 | child exited 1 |
| viewport-320-1280 | met | 2026-11-08T02:39:01.7932803Z | 0 |  |
| not-found-page | failing | 2026-11-08T02:39:02.5137639Z | 1 | child exited 1 |

Not applicable: cli-conformance, game-playable

### polished

| check | state | last run | exit | note |
| --- | --- | --- | --- | --- |
| design-banned-patterns | failing | 2026-11-08T02:39:03.6749425Z | 1 | child exited 1 |
| design-review-dated | never-run |  |  | no design-review receipt; run Write-DesignReviewReceipt.ps1 |

### production

| check | state | last run | exit | note |
| --- | --- | --- | --- | --- |
| privacy-terms | failing | 2026-11-08T02:39:04.275513Z | 1 | child exited 1 |
| seo-tags | failing | 2026-11-08T02:39:04.9517991Z | 1 | child exited 1 |
| security-headers | failing | 2026-11-08T02:39:05.6767591Z | 1 | child exited 1 |
| axe | could-not-tell | 2026-11-08T02:39:06.4164223Z | 2 | `{"check":"axe","target":"http://127.0.0.1:4202","verdict":"could-not-tell","findings":[],"note":"axe cannot run; unresolvable module(s): axe-core"}` |
| core-web-vitals | failing | 2026-11-08T02:39:25.0642016Z | 1 | child exited 1 |
| log-personal-data | met | 2026-11-08T02:39:26.0646902Z | 0 |  |

### operated

| check | state | last run | exit | note |
| --- | --- | --- | --- | --- |
| deployed-url | met | 2026-11-08T02:39:26.6756461Z | 0 |  |
| env-documented | could-not-tell | 2026-11-08T02:39:26.747214Z |  | setup gap: scripts/check-env-docs.js absent |
| monitoring | could-not-tell | 2026-11-08T02:39:26.839527Z |  | setup gap: scripts/check-monitoring.js absent |

Not applicable: restore-path
