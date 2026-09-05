---
name: working-with-meta-capi
description: Send, verify and debug Meta Conversions API (CAPI) events from a Next.js app with the meta-capi engine in src/lib/meta-capi - tagging a page or a gesture, the site policy file, hashing rules, what Graph really answers, and how to read Meta's docs as markdown. Use this whenever the work touches Meta, Facebook, Instagram, pixel, dataset, Events Manager, conversions, CAPI, server-side tracking, fbclid, fbp, fbc, event match quality, a Purchase or Lead event, a required field on a form's event, or any tracking tag on a Next.js page, even when nobody says "Conversions API".
---

# Working with the Meta Conversions API

The engine lives in `src/lib/meta-capi/`. Read `README.md` at the project root first: it is the manual, and its section 3 maps plain-language requests to the exact edit. This skill holds what the manual leaves out: what Meta's API actually does, verified live on 2026-09-05, and the traps that produce double or missing events.

## Where things go

| Need | Do |
| --- | --- |
| An event when something is shown | `<MetaEvent event_name="..." custom_data={...} />` in the Server Component that shows it. Never in a layout, never in a Server Component's body as a function call |
| An event on a click or submit | `void track_meta_event({...})` inside the handler of a Client Component |
| An event born on the server (webhook, payment callback, cron) | `send_meta_events([...])` from `@/lib/meta-capi/server`, with `event_source_url`, `client_ip_address` and `client_user_agent` stored at the time of the user's action |
| JSON arriving from outside the code | `send_inbound_meta_events(payload)` from `@/lib/meta-capi/server`; it parses the unknown body and answers with the same result shape |
| A field the site requires or recommends on an event, or a custom event | One line in `src/lib/meta-capi/policy.ts`. Nothing else in the engine is site-specific |
| Configuration | `META_CAPI_*` environment variables only. Never read a vault or hard-code a dataset id |

The main page stays a Server Component. `"use client"` lives in the tag's own file and nowhere above it.

## How the engine is cut

One Meta documentation page, or one technical boundary, is one file. A rule lives in one table, and both the TypeScript type and the runtime check derive from it.

| File | Decision it holds |
| --- | --- |
| `event_catalog.ts` | The 19 standard names, what Meta requires and recommends per event and per `action_source`, the rule evaluator |
| `policy.ts` | What this site requires and recommends, and its custom events |
| `user_data.ts` | The identity keys, which are hashed, how each is normalized, the `fbc` and `fbp` formats |
| `custom_data.ts` | The commerce keys, the custom property rule, the currency case |
| `event_schema.ts` | The envelope (`event_time`, `action_source`, `event_source_url`, privacy flags), the assembly of the tables into schemas, the declaration types |
| `user_data_hashing.ts` | SHA-256 over the normalized values, server only |
| `browser_context.ts` | What the browser contributes and its contract |
| `request_context.ts` | What the HTTP request says about the client machine: IP, user agent, cookies |
| `config.ts`, `graph_api_client.ts`, `send_meta_events.ts` | Environment, transport, the send pipeline and its result |
| `submit_browser_meta_event.ts`, `track_meta_event.ts`, `meta_event.tsx` | The client-server seam, the client entry, the tag |

Unit tests sit in the sibling folder `src/lib/meta-capi-tests/`, one file per module. Playwright owns `tests/`.

## Why the tag is built the way it is

- Prefetching runs Server Components. A tracking call in a Server Component body counts a view the user never made. The tag fires from a client effect, so only a real render in a real browser counts.
- StrictMode runs every effect twice in development. The tag defers its fire to a microtask and cancels it in the effect's cleanup, so the first setup never fires. Do not "fix" a double fire seen in dev by adding a module-level flag: production fires once, and a flag would stop the second page view.
- Under Cache Components a route left by navigation is hidden, not unmounted; its effects are cleaned up and recreated on return. The tag fires again when the user comes back, which is a new view.
- A search-param-only navigation does not remount a page's Client Components. The tag keys its effect on path, search params and declaration, so `?page=2` fires again and a rerender with the same props does not.
- `useSearchParams` needs a Suspense boundary or the build fails. The tag ships its own boundary; the rest of the page prerenders as static.
- A Server Action is a public POST endpoint. The action reparses its input with the same schema the client used, stamps `event_time`, forces `action_source: "website"`, and reads IP, user agent, `_fbp` and `_fbc` from the request, so a browser cannot spoof them.

## The shape, as Graph accepts it

Endpoint `POST https://graph.facebook.com/v26.0/{dataset_id}/events`, JSON body `{ "data": [event...], "test_event_code"?: string }`, header `Authorization: Bearer <token>`. Up to 1000 events per call; one invalid event rejects the whole batch. Success is `{ "events_received": n, "messages": [], "fbtrace_id": "..." }`.

Per event: `event_name`, `event_time` (unix seconds, at most 7 days old; older gets code 100, subcode 2804003), `action_source`, `event_source_url` (required for website events, the engine sends the full URL with its query string), `event_id` (dedup key with the pixel within 48 h), `user_data`, `custom_data`, `opt_out`, `data_processing_options` (`[]` or `["LDU"]`, US states only), `referrer_url`, `original_event_data`, `attribution_data`.

Verified live: `PageView` is accepted; `value` as a JSON number and lowercase `currency` are accepted; a website event without `client_user_agent` is accepted although the docs call it required, so the engine warns instead of refusing.

Typing: `event_name` is a discriminated union of the 19 standard names plus the custom names of `policy.ts`, so `Purchase` without `value` and `currency`, `AppendAttribution` without `attribution_data`, or a `Lead` without the `em` the policy requires, fails `tsc` before it fails at runtime. Invalid data can only enter through `send_inbound_meta_events`, which parses.

Full key tables and hashing rules: `references/payload-shape.md`.

## Identity and hashing

Hash on the server only, SHA-256 of the normalized value, lowercase hex: `em`, `ph`, `fn`, `ln`, `ge`, `db`, `ct`, `st`, `zp`, `country`, `external_id`. Never hash `client_ip_address`, `client_user_agent`, `fbc`, `fbp`, `subscription_id`, `fb_login_id`, `lead_id`. A 64-hex value is passed through, as Meta's own SDK does. Give the engine raw values; give phone numbers with their country code; give birth dates as `YYYY-MM-DD`.

`fbc` is `fb.1.<unix ms>.<fbclid>`, case preserved, built from the `fbclid` query parameter when the `_fbc` cookie is absent or holds another click id. The engine writes no cookie: consent is the application's, and the pixel owns `_fbp` and `_fbc`.

There is no consent field in the Conversions API. Meta's rule is "use the same logic as for the pixel": gate the rendering of the tag and the call to `track_meta_event`, nothing else.

## Verifying and debugging

1. Put the Test Events code in `META_CAPI_TEST_EVENT_CODE`; events show in the Test Events tab within seconds. The code does not drop events: they still count.
2. `npm test` covers the engine. `npm run e2e` loads `/` in Chromium against the dev server and asserts one server action and `events_received: 1`. It skips without a token.
3. A refused event is a return value: `{ ok: false, reason: "invalid_event" | "graph_rejected" }`. From the browser path the action throws `meta_capi_rejected_error`, which lands in `instrumentation.ts` with the route and request. A silent tracking failure does not exist by design; look at the server logs.
4. To reproduce what Meta answers, curl Graph directly with the token from `.env.local` and the same JSON; keep `User-Agent: MetaCapiHarness/0.1 (<model>) curl/8` on every call. Error bodies carry `error.code`, `error.error_subcode`, `error.message`, `error.fbtrace_id`, sometimes `is_transient`, `error_user_title`, `error_user_msg`. Code 190 is the token, code 100 is the payload, code 200 is a permission.
5. `messages` in a success answer is where Meta puts warnings; log it when it is not empty.

## Reading Meta's documentation

Every page under `developers.facebook.com/documentation/ads-commerce/` has a markdown twin: append `.md`. The index is `https://developers.facebook.com/documentation/ads-commerce/llms.txt`, and it does list the Conversions API and the Dataset Quality API. Old `/docs/...` URLs redirect there. Fetch with curl and the structured User-Agent above; the HTML site is a JavaScript shell. Details and the pages that matter: `references/meta-docs-access.md`.

Known documentation contradictions, so you do not chase them: two pages disagree on whether `AddToCart` needs `contents` or `content_ids` for catalogue ads; `data_processing_options_state` lists two values on one page and fourteen on another; the CAPI page promises two years of version support while the Marketing API page promises ninety days; `value` appears as both a string and a number in examples. The engine follows what Graph accepted live.

## Dataset Quality API

`GET https://graph.facebook.com/v26.0/dataset_quality?dataset_id=<id>&fields=web{event_name,event_match_quality,...}`. The nested `/{id}/dataset_quality` path does not exist (code 2500). It returns event match quality, additional conversions reported, event coverage, dedup key feedback and data freshness. It returns no spend or cost metric of any kind. A token generated in Events Manager can read it and send events, but cannot read the dataset node, `/stats` or diagnostics.
