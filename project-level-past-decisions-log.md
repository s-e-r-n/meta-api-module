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
| 2026-09-05 | Runtime validation of a 60-key nested payload at two boundaries, with a static type that must never drift from the parser | `zod` 4 taken, imported as `zod/mini` so the client bundle pays a few kB; one schema is both the type and the parse. Known miss on the house rule: a single maintainer, offset by three majors shipped, weekly releases, and Vercel's own SDKs depending on it | - |
| 2026-09-05 | The access token must fail loudly if a server module ever reaches a client bundle | `server-only` (Vercel) imported at the top of every server-side module of the engine | - |
| 2026-09-05 | Docs show `value` both as a number and as a string, and `currency` in both cases | Probe B accepted a JSON number and lowercase `chf`; the engine sends `value` as a number and uppercases `currency` as Meta's own SDK does | research/06 |
| 2026-09-05 | Meta never says whether `event_source_url` carries the query string | The full `window.location.href` is sent, query string included, which is how 100% of the search params reach Meta | research/04 B4 |
| 2026-09-05 | Docs name `v25.0` as current, Gray's example and `debug_token` use `v26.0` | Default Graph version `v26.0`, verified by probe A, overridable with `META_CAPI_GRAPH_VERSION` | research/06 |
| 2026-09-05 | Docs show the token as a form field or a query parameter only | Probe A proved `Authorization: Bearer` with a JSON body works; the token never enters a URL or a body | research/06 |
| 2026-09-05 | A server action is a POST endpoint anyone can call, yet validation must not be written twice | One zod schema; `track_meta_event` runs it before any network call and the action runs the same schema on what arrives | research/04 A8 |
| 2026-09-05 | Under Cache Components a hidden route's effects are cleaned up and recreated on return, StrictMode doubles effects in dev, and a URL-only navigation never remounts a page's client components | A tag fires when it appears and again whenever the URL changes while it stays mounted; StrictMode's extra cycle is neutralised by a cleanup flag checked in a microtask; deps are primitive strings | research/04 A1, A6, A11, A12 |
| 2026-09-05 | Meta recommends writing the `_fbc` cookie for 90 days, EU and CH law require consent before any cookie | The engine writes no cookie; `fbc` is rebuilt from `fbclid` on every request that still carries it; the pixel, out of this loop, owns the cookies | research/03 |
| 2026-09-05 | `AppendAttribution` is beta and access-limited but is a documented Meta event | Included in the standard names with `attribution_data` support, so the catalogue is complete | research/01 §4 |
| 2026-09-05 | `custom_data` carries some sixty vertical keys with loosely documented enums | The commerce keys are typed and validated; every other key is accepted as a string, number, boolean or array of those, with no whitespace in the key | research/01 §6 |
| 2026-09-05 | Meta's SDK passes a 64-hex value through unhashed, the docs never mention it | Same behaviour adopted: a value already hashed is sent as is, so partners storing hashed emails are not double-hashed | research/06 §1 |
| 2026-09-05 | Meta accepts `2/16/1997` for a birth date, which is ambiguous outside the US | Only `YYYYMMDD` and `YYYY-MM-DD` are accepted; anything else is dropped with a warning | research/03 §1 |
| 2026-09-05 | Pixel docs allow `content_ids` as integers or strings | Strings only; a catalogue id is text | research/01 §2 |
| 2026-09-05 | A refused event and a broken network are not the same kind of failure | `send_meta_events` returns refusals as values and throws on missing config and on transport failure; the server action and `track_meta_event` throw on any not-ok result so fire-and-forget failures still reach `instrumentation.ts` and the browser console | - |
| 2026-09-05 | Meta recommends a 1500 ms timeout and a retry on non-client errors | One retry on timeout, network failure or 5xx, then `meta_capi_transport_error`; 4xx is never retried | research/02 §2 |
| 2026-09-05 | The sheet routes external inbound through a route handler and verifies by cURL | `POST /api/meta-events` guarded by `META_CAPI_INBOUND_SECRET` is the reference route and the cURL surface of the whole pipeline | - |
| 2026-09-05 | Criterion 6 needs a server page carrying a tag to be provable at build time | `src/app/page.tsx` renders `<MetaEvent event_name="PageView" />` and nothing else; it stays a Server Component and the build proves the Suspense split | - |
| 2026-09-05 | Next documents no client IP API since `NextRequest.ip` was removed | `x-vercel-forwarded-for`, then `x-real-ip`, then the first entry of `x-forwarded-for`, per Vercel's header reference | research/06 §2 |
| 2026-09-05 | The Dataset Quality API has no spend metric and the token reads an empty `{}` from it | Nothing about it enters the engine; the endpoint and permissions are recorded in research/05 for a later loop | research/05 |
| 2026-09-05 | `server-only` throws under vitest, which would leave every server module untested | An `enforce: "pre"` Vite plugin maps `server-only` to an empty module for tests only | - |
| 2026-09-05 | Unit tests cannot prove one fire per load under the real router, StrictMode and hydration | One Playwright test loads `/` on the dev server, counts one server action POST and reads `events_received: 1` from Meta in its body; it skips without credentials | tests/page_view_fires_once.spec.ts |
| 2026-09-05 | Graph accepted a website event without `client_user_agent` although the docs call it required | Kept optional in the schema; `send_meta_events` returns a warning naming the event so match quality problems are visible without refusing the event | research/07 |
| 2026-09-05 | The `working-with-meta-capi` skill serves every partner site, not only this harness | Installed at project level under `.agents/skills/` with its `.claude/skills` symlink, as the house default; it is a general-purpose tool and belongs in `~/.agents/skills/` if Gray agrees | - |
| 2026-09-05 | Gray's original dashed keys in `.env.local` are no longer read by anything | Kept untouched; the file is Gray's, removing the two lines is Gray's call | - |
