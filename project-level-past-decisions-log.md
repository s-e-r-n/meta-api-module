# Past decisions

Append only. One row per decision. A row is never edited or deleted, a reversal is a new row.

A row exists when a problem was raised and a decision closed it. Nothing else gets a row.
Problem and decision are one line each. An error code, a trace id or a ticket number goes in Ref, never the error itself.

| Date | Problem | Decision | Ref |
| ---- | ------- | -------- | --- |
| 2026-09-05 | create-next-app refuses a directory holding `.env.local` and the implementation sheet | Scaffolded in the scratchpad, then rsynced into the project directory, git history included | - |
| 2026-09-05 | vitest 5 refuses the `@types/node@^20` that create-next-app pins | `@types/node` bumped to `^26`, matching the Node 26 runtime | ERESOLVE |
| 2026-09-05 | `.env.local` names carry dashes (`META-CAPI-TOKEN`, `DATASET-ID`), which no shell and no Vercel env accept | The module reads `META_CAPI_ACCESS_TOKEN` and `META_CAPI_DATASET_ID`; both appended to `.env.local`, original lines kept until research agents finish reading them | - |
| 2026-09-05 | The sheet states `llms.txt` does not index the Conversions API | `documentation/ads-commerce/llms.txt` indexes it and the Dataset Quality API, and every page has a `.md` twin; old `/docs/` pages answer `text/markdown` to the structured User-Agent | - |
| 2026-09-05 | Harness default appends an agent co-author line to commits, the global instructions forbid it | Global instructions win, no co-author line on any commit | - |
