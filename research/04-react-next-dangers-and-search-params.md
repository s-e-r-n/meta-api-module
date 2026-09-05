# React 19 / Next.js 16 double-firing and no-firing dangers, and search-params handling

Research scope: Assignment A (double/no-firing dangers) and Assignment B (search params, client→server URL handoff, Meta `event_source_url`/`fbc`).

## Sources

| URL / path | Format | What it covers |
| --- | --- | --- |
| `/Users/graydafflon/Desktop/meta-api-module/node_modules/next/dist/docs/` (Next.js `16.3.4`, confirmed via `node_modules/next/package.json`) | Local Markdown, shipped with the installed package | Primary source for all Next.js findings below. Directory appeared during polling (found at ~20s after scaffolding began). |
| `https://react.dev/llms.txt` | Plain text (`.md` link index), HTTP 200 | Index confirming every `react.dev` page has a `.md` twin. `https://react.dev/llms-full.txt` returns HTTP 404 — does not exist. |
| `https://react.dev/reference/react/StrictMode.md` | Markdown | StrictMode double-invoke behavior for renders, Effects, ref callbacks. |
| `https://react.dev/reference/react/useEffect.md` | Markdown | Effect firing rules, empty deps, dev double-fire. |
| `https://react.dev/reference/react/useEffectEvent.md` | Markdown | `useEffectEvent` purpose and non-reactive semantics. |
| `https://react.dev/reference/react/useRef.md` | Markdown | Ref identity stability across renders. |
| `https://react.dev/reference/react/useState.md` | Markdown | Lazy initializer semantics, StrictMode double-call. |
| `https://react.dev/reference/react/useTransition.md` | Markdown | `isPending`, Actions, pending-state UI pattern. |
| `https://react.dev/reference/react/useActionState.md` | Markdown | `useActionState` pending state, action queueing behavior. |
| `https://react.dev/reference/react/Suspense.md` | Markdown | Suspense state-preservation rules, `key`-based boundary reset. |
| `https://react.dev/reference/react-dom/client/hydrateRoot.md` | Markdown | Hydration mismatch causes and recovery, `onRecoverableError`. |
| `https://react.dev/learn/synchronizing-with-effects.md` | Markdown | Dev-only remount, analytics-in-Effects guidance, production behavior. |
| `https://react.dev/learn/you-might-not-need-an-effect.md` | Markdown | Event-vs-Effect placement, the analytics/register POST example. |
| `https://react.dev/learn/separating-events-from-effects.md` | Markdown | Reactive vs non-reactive logic, event handlers not reactive. |
| `https://react.dev/learn/react-compiler/introduction.md` | Markdown | React Compiler's interaction with `useMemo`/`useCallback` as an effect-dependency escape hatch. |
| `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` | Local Markdown | `searchParams` prop contract. |
| `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md` | Local Markdown | `cacheComponents` flag, Activity-based navigation state. |
| `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md` | Local Markdown | Exact Suspense-boundary-or-error rules for `cookies()`/`headers()`/`searchParams`/`useSearchParams`/client route hooks. |
| `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` | Local Markdown | `useSearchParams` Suspense requirement, build failure message, prerendering vs dynamic-rendering behavior. |
| `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-pathname.md` | Local Markdown | `usePathname` scope and rewrite/hydration caveat. |
| `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md` | Local Markdown | Layout non-re-render on navigation, query-param/pathname staleness. |
| `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/template.md` | Local Markdown | Template remount semantics, keying, per-segment remount tree. |
| `node_modules/next/dist/docs/01-app/02-guides/prefetching.md` | Local Markdown | What `<Link>` prefetches, side-effect-during-prefetch troubleshooting. |
| `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/partialPrefetching.md` | Local Markdown | Next 16 Partial Prefetching (App Shell) mechanics. |
| `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md` | Local Markdown | Direct-visit vs client-navigation Suspense-boundary scope difference. |
| `node_modules/next/dist/docs/01-app/02-guides/streaming.md` | Local Markdown | Suspense boundaries as independent streaming points. |
| `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` | Local Markdown | Server Action security model, sequential client dispatch, deployment/retry notes. |
| `node_modules/next/dist/docs/01-app/02-guides/data-security.md` | Local Markdown | Server Action POST-endpoint security note, `server-only` package. |
| `node_modules/next/dist/docs/01-app/02-guides/forms.md` | Local Markdown | `useActionState`/`useFormStatus` pending-state button-disable pattern. |
| `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-server.md` | Local Markdown | `'use server'` file-level vs inline transitivity. |
| `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` | Local Markdown | `'use client'` boundary/entry-point semantics. |
| `node_modules/next/dist/docs/01-app/02-guides/server-and-client-boundary.md` | Local Markdown | What crosses the client/server boundary (code vs serializable data). |
| `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` | Local Markdown | When to use Server vs Client Components; `server-only` package usage and build-time error. |
| `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md` | Local Markdown | `after()` purpose, request-API availability inside it. |
| `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/headers.md` | Local Markdown | `headers()` read-only contract. |
| `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md` | Local Markdown | `cookies()` read/write context rules. |
| `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-request.md` | Local Markdown | `NextRequest.nextUrl`, cookies API, `.ip`/`.geo` removal history. |
| `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` | Local Markdown | Route Handler `headers()`/`referer` example, GET caching version history. |
| `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` | Local Markdown | Route Handler default caching, Cache Components behavior. |
| `node_modules/next/dist/docs/01-app/02-guides/cdn-caching.md` | Local Markdown | What the `next-url` header actually is (interception routes only). |
| `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` | Local Markdown | Proxy (renamed middleware) request/response cookie and header API. |
| `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/userAgent.md` | Local Markdown | `userAgent()` helper return shape, used inside `proxy`. |
| `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md` | Local Markdown | `router.refresh()`, `router.bfcacheId`. |
| `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md` | Local Markdown | `revalidatePath` cache-invalidation scope. |
| `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md` | Local Markdown | Activity-based route retention (up to 3 routes), `bfcacheId` guidance. |
| `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` | Local Markdown | `.env.local` load order, `NEXT_PUBLIC_` exposure rule. |
| `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/env.md` | Local Markdown | `next.config.js` `env` key (build-time inlining, distinct mechanism from `.env` files). |
| `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/reactStrictMode.md` | Local Markdown | Confirms Strict Mode is `true` by default in the App Router since Next.js 13.5.1. |
| `node_modules/next/dist/docs/03-architecture/fast-refresh.md` | Local Markdown | Fast Refresh: `useState`/`useRef` preservation, dependency-array-ignoring re-run of `useEffect`/`useMemo`/`useCallback` on save, `// @refresh reset`. |
| `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` | Local Markdown | `searchParams` prop vs `useSearchParams` vs `window.location.search` guidance. |
| `https://developers.facebook.com/documentation/ads-commerce/llms.txt` | Plain text index, fetched with the required `curl -sL -A "MetaCapiHarness/0.1 (claude-sonnet-5) curl/8"` | Confirms every Ads/Commerce doc page under `/documentation/ads-commerce/` has a `.md` twin. |
| `https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc.md` | Markdown, fetched with the required curl UA | `fbc`/`fbp` formatting algorithm from `fbclid`, cookie-setting guidance. |
| `https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc` | HTML/plaintext hybrid, fetched with the required curl UA | Legacy URL; HTTP 302-redirects (`curl -w '%{num_redirects}'` = 1) to the `documentation/ads-commerce/...` URL above and serves identical content. Appending `.md` to this legacy URL returns HTTP 404. |
| `https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event.md` | Markdown, fetched with the required curl UA | `event_source_url`, `event_id`, `action_source` field definitions. |
| `https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters.md` | Markdown, fetched with the required curl UA | `client_ip_address`, `client_user_agent`, `fbc`, `fbp` field definitions (hashing rules). |
| `https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/custom-data.md` | Markdown, fetched with the required curl UA | Full standard-parameters table (no `utm_*`/`gclid` entries). |
| `https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/main-body.md` | Markdown, fetched with the required curl UA | Top-level payload parameter list (short index page). |
| `https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/original-event.md` | Markdown, fetched with the required curl UA | `original_event_data` object — confirms it is unrelated to URL/`fbc` deduplication. |
| `https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events.md` | Markdown, fetched with the required curl UA | Deduplication key definition (`event_id`+`event_name`, or `fbp`/`external_id`). |

---

## Findings

### Assignment A: double-firing and no-firing dangers

#### A1. React StrictMode: double-invoking renders, Effects, ref callbacks, initializers/updaters

| Behavior | Dev-only or also prod | What the docs say to do |
| --- | --- | --- |
| Renders double-invoked | Dev only | `StrictMode.md`: "Your components will re-render an extra time to find bugs caused by impure rendering." |
| Effects: one extra setup+cleanup cycle on mount | Dev only | `StrictMode.md`: "When Strict Mode is on, React will also run **one extra setup+cleanup cycle in development for every Effect.**" `useEffect.md` confirms: "React runs setup and cleanup one extra time before the actual setup... **In production, there will only be one request.**" (from the fetch example) |
| Ref callbacks: one extra setup+cleanup cycle | Dev only | `StrictMode.md`: "When Strict Mode is on, React will also run **one extra setup+cleanup cycle in development for every callback `ref`.**" |
| `useState` initializer/updater functions called twice | Dev only | `useState.md`: "In Strict Mode, React will **call your initializer function twice** in order to help you find accidental impurities. This is development-only behavior and does not affect production... The result from one of the calls will be ignored." Same wording is given for updater functions. |
| State and refs across the simulated remount | Preserved (explicit) | `synchronizing-with-effects.md`: "When Strict Mode is on, React **remounts every component once after mount (state and DOM are preserved)**." This is the direct answer to whether refs/state survive StrictMode's simulated unmount/remount — they do, per this exact sentence. `useRef.md` separately confirms general ref stability: "On the next renders, `useRef` will return the same object." |
| Nested-effect ordering constraint | N/A, explains why StrictMode only runs at all when active from the root | `StrictMode.md`: "if `<StrictMode>` is not enabled at the root of the app, it will not re-run Effects an extra time on initial mount, since this would cause child effects to double fire without the parent effects, which cannot happen in production." |
| Event handlers | Never double-invoked | `useState.md`: "**Only component, initializer, and updater functions need to be pure.** Event handlers don't need to be pure, so React will never call your event handlers twice." |

Confirmed default: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/reactStrictMode.md`: "Since Next.js 13.5.1, Strict Mode is `true` by default with `app` router" — so this double-invoke behavior is active out of the box in this project's dev server.

#### A2. Fast Refresh

| Claim | Exact quote | Source |
| --- | --- | --- |
| `useState`/`useRef` state survives an edit | "Fast Refresh attempts to preserve the state of your component between edits. In particular, `useState` and `useRef` preserve their previous values as long as you don't change their arguments or the order of the Hook calls." | `node_modules/next/dist/docs/03-architecture/fast-refresh.md` |
| Effects with dependencies always re-run on save, deps ignored | "Hooks with dependencies—such as `useEffect`, `useMemo`, and `useCallback`—will **always** update during Fast Refresh. Their list of dependencies will be ignored while Fast Refresh is happening." | same |
| Even an empty-deps `useEffect` re-runs once per save | "Sometimes, this can lead to unexpected results. For example, even a `useEffect` with an empty array of dependencies would still re-run once during Fast Refresh." | same |
| Framing: dev-only, and why writing idempotent Effects matters regardless | "However, writing code resilient to occasional re-running of `useEffect` is a good practice even without Fast Refresh... it's enforced by React Strict Mode, which we highly recommend enabling." | same |
| `// @refresh reset` forces a full remount on every edit | "You can add `// @refresh reset` anywhere in the file you're editing. This directive is local to the file, and instructs Fast Refresh to remount components defined in that file on every edit." | same |
| React's own framing of the same mechanism (remount on save) | "React will remount the Effects whenever you save a file in development. Both of these behaviors are development-only." | `react.dev/learn/synchronizing-with-effects.md` |

Fast Refresh only runs during `next dev`; both sources frame it as a save-triggered, development-only mechanism with no production analogue.

#### A3. Hydration: do Effects run on the server, and what happens on a mismatch

| Question | Answer | Quote | Source |
| --- | --- | --- | --- |
| Do Effects run during SSR? | No | `useEffect.md` (from the "Fetching data with Effects" FAQ): "**Effects don't run on the server.** This means that the initial server-rendered HTML will only include a loading state with no data." | `react.dev/reference/react/useEffect.md` |
| When do Effects run after SSR? | After hydration | `useEffect.md`: "the user will see the initial render output. Then, when it's loaded and hydrated, your Effect will run..." | same |
| What causes hydration mismatches | Listed explicitly | `hydrateRoot.md`: "The most common causes leading to hydration errors include: Extra whitespace... Using checks like `typeof window !== 'undefined'`... Using browser-only APIs like `window.matchMedia`... Rendering different data on the server and the client." | `react.dev/reference/react-dom/client/hydrateRoot.md` |
| Does React recover from hydration errors? | Partially, with a caveat | `hydrateRoot.md`: "React recovers from some hydration errors, but **you must fix them like other bugs.** In the best case, they'll lead to a slowdown; in the worst case, event handlers can get attached to the wrong elements." | same |
| Error reporting hook | `onRecoverableError` root option | `hydrateRoot.md`: "**optional** `onRecoverableError`: Callback called when React automatically recovers from errors." | same |

#### A4. Suspense: state on suspend-after-mount, and `key`-forced reset

| Behavior | Quote | Source |
| --- | --- | --- |
| State for a tree that suspends **before** first mount | "React does not preserve any state for renders that got suspended before they were able to mount for the first time. When the component has loaded, React will retry rendering the suspended tree from scratch." | `react.dev/reference/react/Suspense.md` |
| Content that **already mounted**, then suspends again | "If Suspense was displaying content for the tree, but then it suspended again, the `fallback` will be shown again unless the update causing it was caused by `startTransition` or `useDeferredValue`." and "If React needs to hide the already visible content because it suspended again, it will clean up layout Effects in the content tree. When the content is ready to be shown again, React will fire the layout Effects again." | same |
| Does `key` force a Suspense boundary reset | Yes, explicitly documented pattern | "With a different `key`, React treats the profiles as different content and resets the Suspense boundary during navigation. The `key` can go on the boundary itself or on a component above it. Suspense-integrated routers should do this automatically." | same, "Resetting Suspense boundaries on navigation" section |

Gap: the docs describe layout-Effect cleanup/refire on hide/show explicitly, but do not use the word "remount" for a component that suspends after being mounted, nor do they state explicitly whether ordinary (non-layout) `useEffect` Effects are also cleaned up and refired on hide/show the same way layout Effects are. Treat this as undocumented for plain `useEffect`.

#### A5. `useSearchParams` Suspense requirement and the `cacheComponents` build-time error

| Claim | Exact quote | Source |
| --- | --- | --- |
| `useSearchParams` always needs Suspense under Cache Components | "The `useSearchParams` hook always needs a `<Suspense>` boundary, since search params are only known at request time." | `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md` |
| `cookies`/`headers`/`searchParams` outside Suspense under Cache Components | "**Wrap runtime data access in `<Suspense>`.** ... With Cache Components, accessing them outside a `<Suspense>` boundary surfaces the **blocking-prerender-runtime** insight." | same |
| Build-time failure for client route hooks (incl. the search-param family) without Suspense | "Wrap the component that reads the hook in `<Suspense>` (push the read down to the smallest leaf so the rest stays prerendered), **or the build fails**" | same |
| Pre-`cacheComponents` build failure for `useSearchParams` specifically | "During production builds, a static page that calls `useSearchParams` from a Client Component must be wrapped in a `Suspense` boundary, **otherwise the build fails** with the [Missing Suspense boundary with useSearchParams] error." | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` |
| Dev-mode exception | "In development, routes are rendered on-demand, so `useSearchParams` doesn't suspend and things may appear to work without `Suspense`." | same |
| Without Cache Components, at all | Reading `searchParams` opts the **whole route** into dynamic rendering, per: "Without Cache Components, reading `cookies()`, `headers()`, or `searchParams` opts the whole route into dynamic rendering." | `migrating-to-cache-components.md` |

Both mechanisms confirm the assignment's premise precisely: under `cacheComponents: true`, reading these APIs outside Suspense is a build-time failure, not merely a runtime client-side-rendering bailout.

#### A6. Layouts persist across navigation; `template.tsx` remounts; `key` forces remount; what triggers `usePathname`/`useSearchParams`

| Claim | Exact quote | Source |
| --- | --- | --- |
| Layouts do not re-render on navigation | "Layouts do not re-render on navigation, so they do not access pathname which would otherwise become stale." | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md` |
| Layouts do not receive `searchParams` at all | "Unlike Pages, Layouts (Server Components) **do not** receive the `searchParams` prop. This is because a shared layout is not re-rendered during navigation which could lead to stale `searchParams` between navigations." | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` |
| Practical consequence for this project | A "page view" side effect placed in a Server Component **layout** fires once per layout mount (i.e., effectively once per session for a persistent layout), not once per navigation — confirmed by the two quotes above. | derived directly from the two quotes above |
| Template remounts on every navigation of its own segment | "Unlike layouts that persist across routes and maintain state, templates are given a unique key, meaning children Client Components reset their state on navigation." | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/template.md` |
| Template use cases listed | "Resynchronize `useEffect` on navigation. Reset the state of a child Client Components on navigation... Suspense boundaries inside layouts only show a fallback on first load, while templates show it on every navigation." | same |
| Template `key` mechanic | "Templates receive a unique key for their own segment level. They remount when that segment (including its dynamic params) changes. Navigations within deeper segments do not remount higher-level templates. **Search params do not trigger remounts.**" | same |
| `usePathname`: excludes search params | Confirmed by contrast — `usePathname.md` documents only pathname reading (`const pathname = usePathname()`); the "search params do not trigger remounts" line above is the explicit statement that pathname/template remounting is unaffected by search-param changes. | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-pathname.md` and `template.md` |
| `usePathname` reading from a Server Component | Not supported, and intentionally so | "Reading the current URL from a Server Component is not supported. This design is intentional to support layout state being preserved across page navigations." | `use-pathname.md` |

#### A7. Prefetching: does it execute Server Components, and is a "page view" counted early?

| Claim | Exact quote | Source |
| --- | --- | --- |
| Prefetch fetches the RSC payload ahead of navigation | "During the initial navigation, the browser fetches the HTML, JavaScript, and React Server Components (RSC) Payload. For subsequent navigations, the browser will fetch the RSC Payload for Server Components and JS bundle for Client Components." | `node_modules/next/dist/docs/01-app/02-guides/prefetching.md` |
| Impure Server Component side effects DO run during prefetch — documented as a named troubleshooting problem | "If your layouts or pages are not pure and have side-effects (e.g. **tracking analytics**), Next.js **might run them when the route is prefetched, not when the user visits the page**." | same, "Triggering unwanted side-effects during prefetching" |
| Documented fix | "To avoid this, move side-effects to a `useEffect` hook or a Server Action triggered from a Client Component." The doc's own "Before"/"After" example is literally `trackPageView()` moved from a Server Component layout body into a Client Component's `useEffect`. | same |
| Server Actions during prefetch | Not directly asserted either way for prefetch specifically, but the doc's own recommended fix uses "a Server Action triggered from a Client Component" as the *safe* alternative to a side effect that runs during prefetch — implying Server Actions are not auto-invoked by prefetching (they require an explicit client-side trigger). This is the closest the docs come to an explicit statement; treat the absolute claim ("Server Actions never execute during prefetch") as inferred, not directly quoted. | same, inferred |
| Partial Prefetching (Next 16): what is prefetched | "With `partialPrefetching: true`, Next.js prefetches one reusable App Shell per route instead... URL-specific content, including content that depends on `params` or `searchParams`, resolves after navigation by default." | `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/partialPrefetching.md` |
| Partial Prefetching requires `cacheComponents` | "`partialPrefetching` requires `cacheComponents`. Without it, `next dev` and `next build` throw at config validation." | same |
| Session-aware shells | "Routes that read `cookies()` or `headers()` produce an App Shell that includes session data. The framework auto-detects this and caches the shell per session on the client." | same |
| `<Link prefetch={true}>` resolves URL data early | "A link can ask for more than the App Shell with `<Link prefetch={true}>`. The prefetch also resolves URL data like `params`, `searchParams`, and the full URL, and the cached content behind it." | same |
| Version introduced | `partialPrefetching` introduced in `16.3.0` | same, Version History table |

#### A8. Server Actions: invocation, security, headers/cookies, `after()`, retries/double-click

| Claim | Exact quote | Source |
| --- | --- | --- |
| Server Action is a public POST endpoint | "A Server Action runs as a POST request against the page that invokes it... The implementation stays on the server, but **the route is reachable to anyone who can send the same POST. Treat every action as an untrusted entry point.**" | `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` |
| Same point, restated | "By default, when a Server Action is created and exported, it is **reachable via a direct POST request, not just through your application's UI**. This means, even if a Server Action or utility function is not imported elsewhere in your code, it can still be called externally." | `node_modules/next/dist/docs/01-app/02-guides/data-security.md` |
| Recommended mitigations | "Authenticate and authorize. Render-time gating (only rendering a form on an authenticated page) is not a security boundary, because requests can be sent without going through the UI. Validate inputs. Treat `FormData`, query parameters, and headers as untrusted." | `server-actions.md` |
| Invocation surfaces from a Client Component | "A **Server Action** is a React Server Function invoked through React's action mechanisms, such as `<form action>`, `<button formAction>`, or a client-side transition... invoke it from a form, or from an event handler or `useEffect` wrapped in `startTransition`." | `server-actions.md` |
| `headers()`/`cookies()` readable inside a Server Action | `cookies.md`: "`cookies` is an **async** function that allows you to read the HTTP incoming request cookies in Server Components, and **read/write outgoing request cookies in Server Functions** or Route Handlers." `after.md` shows `cookies()`/`headers()` called directly inside a Server Function's `after()` callback. | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md`, `after.md` |
| Setting cookies only allowed in Server Function / Route Handler, not Server Component render | "**Setting cookies** is not supported during Server Component rendering. To modify cookies, invoke a Server Function from the client or use a Route Handler." | `cookies.md` |
| `Referer` header available via `headers()` | Demonstrated directly in a Route Handler example: `const headersList = await headers(); const referer = headersList.get('referer')` | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` |
| `next-url` header — **not** a general referring-page header | "`next-url` — added only for routes that use interception routes, carries the URL being intercepted." / "used for interception routes to vary the response based on the referring page. If omitted, interception routes are not supported..." | `node_modules/next/dist/docs/01-app/02-guides/cdn-caching.md` |
| Sequential dispatch (relevant to double-click) | "Next.js dispatches Server Actions **one at a time per client**. If a user triggers three actions in quick succession, the second waits for the first to finish, then the third waits for the second." — this only guarantees *ordering*, not deduplication; two separate clicks still produce two separate dispatched/queued action invocations. | `server-actions.md`, "Sequential dispatch on the client" |
| Retries / duplicate invocation from network issues | Not framed as request idempotency. Docs discuss action-ID rotation across deployments causing a *different* failure mode: "New deployments typically generate new IDs (Next.js rotates them at most every 14 days...), so a client still running the previous build may invoke an action ID that no longer exists." Recommended handling: "Surface the error as a retry path in the UI rather than a hard failure, so a refresh recovers the user." | `server-actions.md`, "Deployment considerations" |
| `useOffline` connectivity-drop behavior | "With the **experimental** `useOffline` config enabled, a Server Action interrupted by a connectivity drop **stays pending and completes when the network returns**, so a user does not lose their submission." | `forms.md` |
| `useActionState`/`useTransition` pending-state UI pattern | "The `isPending` flag that tells you whether there is a pending Transition" (`useTransition.md`); Next's `forms.md`: "The `useActionState` hook exposes a `pending` boolean that can be used to show a loading indicator **or disable the submit button** while the action is being executed," shown as `<button disabled={pending}>`. | `react.dev/reference/react/useTransition.md`, `node_modules/next/dist/docs/01-app/02-guides/forms.md` |
| `after()` purpose | "`after` allows you to schedule work to be executed after a response (or prerender) is finished. This is useful for tasks and other side effects that should not block the response, **such as logging and analytics**." | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md` |
| `after()` usable in Server Actions, Route Handlers, proxy | "It can be used in Server Components... Server Functions, Route Handlers, and Proxy." | same |
| `after()` runs even on error | "`after` will be executed even if the response didn't complete successfully. Including when an error is thrown or when `notFound` or `redirect` is called." | same |

Gap, explicitly confirmed absent: nothing in `server-actions.md`, `use-server.md`, or `serverActions.md` states that a double-click on a submit button is deduplicated or debounced by the framework, nor that retried network requests are deduplicated server-side. Sequential dispatch (above) only orders concurrent client-triggered actions; it does not merge or drop duplicates. This must be handled by the application (e.g., disabling the trigger via `isPending`, or an idempotency key in the action payload) — the docs do not claim otherwise.

#### A9. Route Handlers: headers/cookies/nextUrl, IP header access, default caching, `cacheComponents`

| Claim | Exact quote | Source |
| --- | --- | --- |
| GET Route Handlers not cached by default (current version) | "Route Handlers are not cached by default. You can, however, opt into caching for `GET` methods." | `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` |
| Version history of the default | "The default caching for `GET` handlers was changed from static to dynamic" as of `v15.0.0-RC`. | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`, Version History table |
| `cacheComponents` effect on GET Route Handlers | "When Cache Components is enabled, `GET` Route Handlers follow the same model as normal UI routes in your application. They run at request time by default, can be prerendered when they don't access uncached or runtime data, and you can use `use cache` to include uncached data in the static response." | `15-route-handlers.md`, "With Cache Components" |
| `headers()`/`cookies()`/`request.nextUrl` in a Route Handler | Demonstrated directly: `const headersList = await headers()` and `request.cookies.get('token')` in `route.md`; `nextUrl` documented in `next-request.md`: "`nextUrl` — Extends the native URL API with additional convenience methods, including Next.js specific properties," with `pathname` and `searchParams` listed for the App Router. | `route.md`, `next-request.md` |
| `x-forwarded-for` / `x-real-ip` / `x-vercel-forwarded-for` | **Not documented anywhere** in the local Next.js docs tree — a targeted `grep -rn -i` across the entire `node_modules/next/dist/docs/` tree for these three header names returned zero hits. | confirmed absence, whole-tree grep |
| `NextRequest.ip` / `.geo` | Explicitly removed, not deprecated-with-guidance | Version History table in `next-request.md`: "`v15.0.0` | `ip` and `geo` removed." | `next-request.md` |
| Local dev IP behavior (`::1`, `127.0.0.1`) | **Not documented** — whole-tree grep for `::1` and `127.0.0.1` found only unrelated debugger/testing-tool examples, none describing request IP behavior in local dev. | confirmed absence, whole-tree grep |

#### A10. Proxy (renamed from `middleware`): what it reads/sets, fitness for capturing `fbclid`

| Claim | Exact quote | Source |
| --- | --- | --- |
| Rename confirmed in-doc | "**Note**: The `middleware` file convention is deprecated and has been renamed to `proxy`. See Migration to Proxy for more details." | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` |
| When it runs | "Proxy executes before routes are rendered. It's particularly useful for implementing custom server-side logic like authentication, logging, or handling redirects." | same |
| Reading query params | Demonstrated directly via `NextRequest.nextUrl.searchParams` in the `userAgent.md` proxy example: `const url = request.nextUrl` then `url.searchParams.set('viewport', viewport)` — confirms the proxy has full read/write access to the incoming URL's search params through the same `nextUrl` API documented for Route Handlers. | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/userAgent.md` |
| Setting a cookie on the response | "Setting cookies on the response using the `ResponseCookies` API": `const response = NextResponse.next(); response.cookies.set('vercel', 'fast')` ... "The outgoing response will have a `Set-Cookie:vercel=fast;path=/` header." | `proxy.md`, "Using Cookies" |
| Fitness for capturing `fbclid` into a cookie | Directly supported by the two quotes above: reading `request.nextUrl.searchParams.get('fbclid')` and writing it via `response.cookies.set(...)` are both explicitly documented proxy capabilities. | derived from `userAgent.md` + `proxy.md` |
| `userAgent()` helper return shape | Fields documented: `isBot` (boolean), `browser: {name, version}`, `device: {model, type, vendor}`, `engine: {name, version}`, `os: {name, version}`, `cpu: {architecture}`. | `userAgent.md` |
| Matcher default (runs on every request) | "Without a `matcher`, Proxy runs on **every request**, including static files (`_next/static`), image optimizations (`_next/image`), and assets in the `public/` folder." | `proxy.md` |

#### A11. `useEffect` production semantics, `useEffectEvent`, `useRef` guard flags, `useState` lazy init

| Claim | Exact quote | Source |
| --- | --- | --- |
| Empty-deps Effect runs once per mount in production | "**Even with empty dependencies, setup and cleanup will run one extra time in development** to help you find bugs." (implying exactly one production run) | `react.dev/reference/react/useEffect.md` |
| Analytics-in-Effect: React's own explicit guidance for this exact use case | "Consider this code that sends an analytics event on the page visit: `useEffect(() => { logVisit(url); }, [url]);` In development, `logVisit` will be called twice for every URL... **We recommend keeping this code as is.**... **In production, there will be no duplicate visit logs.**" | `react.dev/learn/synchronizing-with-effects.md`, "Sending analytics" |
| Alternative if dev double-fire is disruptive | "You may also send analytics from the route change event handlers instead of Effects. For more precise analytics, intersection observers can help track which components are in the viewport." | same |
| View-event vs gesture-event placement — React's own worked example | Form component: "It sends an analytics event when it mounts... The analytics POST request should remain in an Effect. This is because the reason to send the analytics event is that the form was displayed... However, the `/api/register` POST request is not caused by the form being displayed. You only want to send the request at one specific moment in time: when the user presses the button... Delete the second Effect and move that POST request into the event handler." | `react.dev/learn/you-might-not-need-an-effect.md`, "Sending a POST request" |
| `useEffectEvent` purpose | "They always 'see' the latest values from render (like props and state) without re-synchronizing your Effect, so they're excluded from Effect dependencies." | `react.dev/reference/react/useEffectEvent.md` |
| `useEffectEvent` identity is unstable by design | "Effect Event functions **do not have a stable identity**. Their identity intentionally changes on every render." | same |
| `useEffectEvent` calling constraints | "Effect Events can only be called from inside Effects or other Effect Events. Do not call them during rendering or pass them to other components or Hooks." | same |
| `useRef` stability across renders | "On the next renders, `useRef` will return the same object." | `react.dev/reference/react/useRef.md` |
| `useState` lazy initializer runs once per mount, not per render | "This example passes the initializer function, so the `createInitialTodos` function only runs during initialization. It does not run when component re-renders." | `react.dev/reference/react/useState.md` |
| StrictMode calls the lazy initializer twice in dev | "In Strict Mode, React will **call your initializer function twice**... This is development-only behavior and does not affect production." | same |
| React Compiler and effects with empty/unstable deps | Next's own `reactCompiler.md` says nothing about Effect scheduling — it only describes auto-memoizing `useMemo`/`useCallback`-equivalent values and is opt-in (`reactCompiler: true`, requires `babel-plugin-react-compiler`), not on by default. React's own Compiler docs add one directly relevant caveat: "The `useMemo` and `useCallback` hooks can continue to be used with React Compiler as an escape hatch to provide control over which values are memoized. **A common use-case for this is if a memoized value is used as an effect dependency, in order to ensure that an effect does not fire repeatedly even when its dependencies do not meaningfully change.**" This means the Compiler does not itself guarantee an Effect's dependency array is stable across renders; a dependency the Compiler does not memoize as expected can still cause repeated firing, and manual `useMemo`/`useCallback` remains the documented escape hatch. | `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/reactCompiler.md` (opt-in status); `https://react.dev/learn/react-compiler/introduction.md` (effect-dependency caveat) |

Note: the React docs do not explicitly describe the "ref as an already-fired flag surviving StrictMode's simulated remount" pattern by name; this is a direct logical consequence of two separately documented facts quoted above — ref identity is stable across renders (`useRef.md`), and StrictMode's simulated remount explicitly preserves state and DOM (`synchronizing-with-effects.md`) — not a pattern the docs describe in those words themselves.

#### A12. `router.refresh()`, `revalidatePath`, bfcache/`pageshow`, soft-navigation rerender vs remount

| Claim | Exact quote | Source |
| --- | --- | --- |
| `router.refresh()` behavior | "`router.refresh()`: Refresh the current route. Making a new request to the server, re-fetching data requests, and re-rendering Server Components. **The client will merge the updated React Server Component payload without losing unaffected client-side React (e.g. `useState`) or browser state (e.g. scroll position)**. This clears the Client Cache for the current route, but does **not** invalidate the server-side cache." | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md` |
| `revalidatePath` scope | "revalidatePath allows you to invalidate cached data on-demand for a specific path... When you call `revalidatePath`, only the specified path gets fresh data on the next visit. Other pages that use the same data tags will continue to serve cached data until those specific tags are also revalidated." | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md` |
| Browser `bfcache` / `pageshow` event | **Not documented anywhere** in the Next.js docs — whole-tree `grep -rn -i "pageshow"` and `grep -rln -i "bfcache"` (outside the three files below) returned zero and three hits respectively, and none of those three describe the browser's native back-forward cache or the `pageshow` event. | confirmed absence, whole-tree grep |
| Next.js's own (different) concept named `bfcacheId` | "`router.bfcacheId`: An opaque string identifier scoped to the current route segment. It changes when the surrounding segment is freshly created by a push or replace navigation, and **stays the same for back/forward navigations**, `router.refresh()`, and search-param- or hash-only navigations." | `use-router.md` |
| `bfcacheId` recommended usage | "The recommended use is to pass it as a React `key` to opt out of state preservation on fresh navigations, while still restoring it during a back/forward navigation... Instead of `bfcacheId`, prefer resetting state explicitly in an event handler... Use `bfcacheId` only as a last resort, like when migrating an existing codebase." | same |
| `cacheComponents` navigation model: rerender vs remount on soft nav | "Rather than unmounting the previous route when you navigate away, Next.js sets the Activity mode to `\"hidden\"`. This means: Component state is preserved when navigating between routes. When you navigate back, the previous route reappears with its state intact. **Effects are cleaned up when a route is hidden, and recreated when it becomes visible again**." | `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`, "Navigation with Activity" |
| How many hidden routes are retained | "Next.js preserves up to 3 routes. Beyond that, the oldest route is evicted and will re-render fresh." | `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md` |
| Direct-visit vs client-navigation Suspense scope differs | "On a client navigation between `/store/shoes` and `/store/hats`, only the components below the `/store` layout re-render. A `<Suspense>` boundary in the root layout covers everything on a page load, but on this navigation, it sits above the re-render scope and does not trigger." | `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md` |
| `useSearchParams` resolves synchronously on client nav vs suspends on SSR | "`useSearchParams()` suspends during server rendering because search params are not available at build time. But on a client navigation, the router already has the params from the URL and the hook resolves synchronously." | same |

#### A13. Client IP and User-Agent

| Claim | Exact quote | Source |
| --- | --- | --- |
| `client_user_agent` readable via `headers()` | Demonstrated in `headers.md`: `const userAgent = headersList.get('user-agent')`. | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/headers.md` |
| Client IP: no documented Next.js API | `NextRequest.ip`/`.geo` were "removed" (not replaced) as of `v15.0.0`, per `next-request.md`. No replacement header-reading pattern (`x-forwarded-for`, `x-real-ip`, `x-vercel-forwarded-for`) appears anywhere in the docs tree (see A9 above). | `next-request.md`; confirmed absence, whole-tree grep |
| `userAgent()` helper — parses device/browser/OS, not IP | Documented fields: `isBot`, `browser`, `device`, `engine`, `os`, `cpu` — no IP-related field. | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/userAgent.md` |

#### A14. Environment variables, `server-only`, directive transitivity, client-boundary placement

| Claim | Exact quote | Source |
| --- | --- | --- |
| `.env.local` load order | "Environment variables are looked up in the following places, in order, stopping once the variable is found: 1. `process.env` 2. `.env.$(NODE_ENV).local` 3. `.env.local` (Not checked when `NODE_ENV` is `test`.) 4. `.env.$(NODE_ENV)` 5. `.env`" | `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` |
| `NEXT_PUBLIC_` exposure rule | "**By default, environment variables are only available on the server**. To expose an environment variable to the browser, it must be prefixed with `NEXT_PUBLIC_`. However, these public environment variables will be inlined into the JavaScript bundle during `next build`." | same |
| Dashes/hyphens in variable names | **Not documented** — targeted greps for "dash", "hyphen" in `environment-variables.md` and `env.md` returned no hits. Treat as an undocumented gap, not a confirmed yes/no. | confirmed absence |
| `server-only` package | "To prevent accidental usage in Client Components, you can use the `server-only` package... Now, if you try to import the module into a Client Component, **there will be a build-time error**." | `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` |
| `server-only` is optional in Next.js | "In Next.js, installing `server-only` or `client-only` is **optional**. However, if your linting rules flag extraneous dependencies, you may install them to avoid issues." | same |
| `'use client'` transitivity | "The `'use client'` directive defines the server and client boundary, and the components exported from such a file serve as entry points to the client." Applies file-by-file at entry points, not to every importer of an importer — only files whose own components you want usable directly inside Server Components need the directive. | `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` |
| `'use server'` at file top marks every export | "It can be used at the top of a file to indicate that **all functions in the file are server-side**, or inline at the top of a function to mark the function as a Server Function." | `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-server.md` |
| Boundary-crossing rules (code vs data) | "**Code** crosses through imports. Whatever a Client Component imports is pulled into the client bundle. **Data** crosses through props, and it must be serializable, so functions like event handlers cannot cross." | `node_modules/next/dist/docs/01-app/02-guides/server-and-client-boundary.md` |
| Server Function crosses as reference, not plain function | "A Server Function marked with `'use server'` crosses as a reference." | same |
| Push the client boundary to the leaf | No sentence phrased as an explicit rule ("push down as low as possible") was found. The doc instead demonstrates the pattern directly: a `Page` Server Component fetches data and renders `<LikeButton likes={post.likes} />`, where only `LikeButton` carries `'use client'`. Treat "push the boundary to the leaf" as the docs' worked example, not a quoted directive. | `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` |

---

### Assignment B: search params

#### B1. The `searchParams` page prop (Server Component)

| Claim | Exact quote | Source |
| --- | --- | --- |
| Type and shape | "`searchParams` (optional) — A promise that resolves to an object containing the search parameters of the current URL." Signature shown: `searchParams: Promise<{ [key: string]: string \| string[] \| undefined }>` | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` |
| Must be awaited (Promise as of Next 15) | "Since the `searchParams` prop is a promise. You must use `async/await` or React's `use` function to access the values. In version 14 and earlier, `searchParams` was a synchronous prop. To help with backwards compatibility, you can still access it synchronously in Next.js 15, but this behavior will be deprecated in the future." | same |
| Makes the route dynamic | "`searchParams` is a **Request-time API** whose values cannot be known ahead of time. Using it will opt the page into **dynamic rendering** at request time." | same |
| Not a `URLSearchParams` instance | "`searchParams` is a plain JavaScript object, not a `URLSearchParams` instance." | same |
| `cacheComponents` interaction | "With Cache Components, where you access `searchParams` in the component tree determines how much of the page can be prerendered." — and per A5 above, reading it outside a `<Suspense>`-wrapped leaf surfaces the **blocking-prerender-runtime** insight in dev / fails the build. | `page.md`; `migrating-to-cache-components.md` |

#### B2. `useSearchParams` (Client Component hook)

| Claim | Exact quote | Source |
| --- | --- | --- |
| Client-only hook | "`useSearchParams` is a **Client Component** hook that lets you read the current URL's **query string**." | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` |
| Return type | "`useSearchParams` returns a **read-only** version of the `URLSearchParams` interface." | same |
| Suspense requirement and reasoning | See A5 above for the full quotes (prerendering-bailout behavior, dev-mode exception, and the exact build-failure error name `Missing Suspense boundary with useSearchParams`). | same |
| `window.location` as a client alternative | Documented, but scoped to callbacks/event handlers, not render: "As a small optimization, you can use `new URLSearchParams(window.location.search)` in **callbacks or event handlers** to read search params without triggering re-renders." | `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` |
| `usePathname` excludes search params | Confirmed by scope: `usePathname` "lets you read the current URL's **pathname**" only (no query string in its return value or examples). | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-pathname.md` |

**What survives a client-side navigation** (cross-referenced from A6/A12, same sources): a Server Component **layout** is not re-rendered on navigation, so any `searchParams`-derived state it captured at its own mount goes stale — "Layouts do not re-render on navigation, so they do not access pathname which would otherwise become stale" (`layout.md`). A **Client Component** holding `useSearchParams()`/`usePathname()` re-renders (not remounts) on navigation and always reflects the current URL — "Since Client Components re-render on navigation, they have access to the latest query parameters" (`layout.md`). A `template.tsx` subtree remounts on navigation into its own segment, resetting any local state, except that "search params do not trigger remounts" (`template.md`). With `cacheComponents: true`, up to 3 previously-visited routes are kept alive via `<Activity>` rather than unmounted, so their Client Component state (including anything derived from the URL at the time they were last visible) survives a back/forward navigation until evicted (`cacheComponents.md`, `preserving-ui-state.md`).

#### B3. Handing the current URL from a Client Component to a Server Action

No file in the Next.js docs tree (`page.md`, `use-search-params.md`, `use-pathname.md`, `server-actions.md`, `use-server.md`, `forms.md`) explicitly states the pattern "pass `window.location.href` (or `usePathname()` + `useSearchParams()`) as an explicit argument to a Server Action call." This is a genuine gap — the mechanics that make it necessary are documented (Server Actions are plain async functions invoked from the client and take explicit arguments; `useSearchParams`/`usePathname` are the only client-side ways to read the URL; a Server Action itself receives no ambient browser-URL argument), but the combined pattern itself is not spelled out anywhere in the fetched pages. Treat "pass the URL as an explicit argument" as the logical, not documented, consequence of these separately-confirmed facts.

Server-side (inside an action), the `Referer` header is readable via `headers()` (see A8/A9 above), but the `next-url` header is documented as being for **interception routes only**, not as a general current-page-URL carrier (see A8 above, `cdn-caching.md` quote) — this directly contradicts an assumption that `next-url` could substitute for an explicit URL argument.

#### B4. Meta side: `event_source_url`, `fbclid` → `fbc`, and other URL params

| Claim | Exact quote | Source |
| --- | --- | --- |
| `event_source_url` definition | "The browser URL where the event happened. The URL should match the verified domain. **Note:** The `event_source_url` is required for website events shared using the Conversions API." | `https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event.md` |
| Query-string inclusion/exclusion | **Not stated.** The definition above ("the browser URL where the event happened") does not specify whether the query string must be included or stripped. Confirmed gap — do not assume either way. | same |
| `fbclid` → `fbc` retrieval | "Whenever present in the URL query parameters, try to obtain the parameter server-side by reading it from the HTTP request URL's query string." Example: `GET /?fbclid=IwAR2F4-dbP0l7Mn1IawQQGCINEz7PYXQvwjNwB_qa2ofrHyiLjcbCRxTDMgk` | `https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc.md` |
| Case sensitivity | "ClickID value is case sensitive - do not apply any modifications before using, such as lower or upper case." | same |
| `fbc` exact format | "The formatted ClickID value must be of the form `version.subdomainIndex.creationTime.<fbclid>`, where: version is always this prefix: **fb**; subdomainIndex is which domain the cookie is defined on ('com' = 0, 'example.com' = 1, 'www.example.com' = 2); creationTime is the UNIX time since epoch in **milliseconds** when the `_fbc` was stored. If you don't save the `_fbc` cookie, use the timestamp when you first observed or received this `fbclid` value." Example value: `fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890` | same |
| Server-generated `fbc` without a saved `_fbc` cookie | "If you're generating this field on a server, and not saving an `_fbc` cookie, **use the value 1**" for `subdomainIndex`. | `customer-information-parameters.md` field table, and `fbp-and-fbc.md` |
| `_fbc` cookie recommendations | "It is highly recommended to set `_fbc` as: HTTP cookie in the HTTP response headers, with the **90 days expiration time**." Only set it when it doesn't already exist, or when the new `fbclid` differs from the cookie's stored value. | `fbp-and-fbc.md` |
| `fbp` format (distinct from `fbc`) | "The `fbp` event parameter value must be of the form `version.subdomainIndex.creationTime.randomnumber`" — a Meta Pixel-generated random number, not derived from any URL parameter. | `fbp-and-fbc.md` |
| `client_ip_address` hashing rule | "**Do not hash.** The IP address of the browser corresponding to the event must be a valid IPV4 or IPV6 address... The `client_ip_address` user data parameter must never be hashed." | `customer-information-parameters.md` |
| `client_user_agent` hashing rule | "**Do not hash.** The user agent for the browser corresponding to the event. The `client_user_agent` is required for website events shared using the Conversions API." | same |
| Other URL parameters (`utm_*`, `gclid`, `msclkid`) consumed by CAPI | **None found.** A recursive, case-insensitive search across every fetched Meta CAPI parameter page (`fbp-and-fbc.md`, `server-event.md`, `custom-data.md`, `main-body.md`, `customer-information-parameters.md`, `original-event.md`, `dedup.md`) for `utm_`, `gclid`, and `msclkid` returned zero matches. The full standard-parameters table in `custom-data.md` (Website/App/Offline columns) contains no such fields. | confirmed absence, multi-file grep across all fetched Meta docs |
| Deduplication key — confirms it is **not** URL/`fbc`-based | "We determine if events are identical based on their **ID** and **name**. So, for an event to be deduplicated: 1. In corresponding events, a Meta Pixel's `eventID` must match the Conversion API's `event_id`. 2. In corresponding events, a Meta Pixel's `event` must match the Conversion API's `event_name`." A second, alternative method exists: "For this approach, you must use `event_name`, `fbp` and/or `external_id` consistently across browser and server events." Neither method references `event_source_url` or `fbc`. | `https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events.md` |
| `original_event_data` — confirmed unrelated to URL/dedup-by-URL | The object only carries `event_name`, `event_time`, `order_id`, `event_id` — the same `event_id`/`event_name` pair used for dedup above, with no URL or `fbc` field. | `https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/original-event.md` |

---

## Contradictions and gaps

- **`next-url` header does not mean "the current page URL."** A naive reading of the assignment brief ("the `Referer`/`next-url` headers available") could suggest `next-url` is a general current-URL header available to Server Actions/Route Handlers. The docs explicitly restrict it: it is "added only for routes that use interception routes, carries the URL being intercepted," and is used "to vary the response based on the referring page" specifically for that feature. It is not a substitute for capturing the browser's current URL in a Server Action. Source: `node_modules/next/dist/docs/01-app/02-guides/cdn-caching.md`.
- **Two different, unrelated concepts both named "bfcache" exist.** The assignment asks about the browser's native back/forward cache and the `pageshow` event — neither is documented anywhere in the Next.js docs (confirmed by whole-tree grep). Next.js instead has its own `router.bfcacheId`, a client-side route-segment identity used to opt in/out of Activity-based state preservation across navigations. Do not conflate the two: `router.bfcacheId` does not fire on a browser `pageshow` restore, and no Next.js doc describes behavior specific to a page being restored from the browser's native bfcache.
- **Client IP and `x-forwarded-for`/`x-real-ip`/`x-vercel-forwarded-for` are entirely undocumented in the local Next.js docs tree.** `NextRequest.ip`/`.geo` were removed in `v15.0.0` with no documented replacement pattern. Any implementation reading these headers, or handling local dev's `::1`/`127.0.0.1`, will need a source outside this docs tree (e.g., Vercel's platform docs, not fetched here per the assignment's Next.js-first source rule) — this is a confirmed, load-bearing gap for the module's IP-capture logic.
- **Server Action double-click/duplicate-invocation prevention is not built in.** "Sequential dispatch" only orders same-client action calls; it does not deduplicate two separate dispatches caused by a genuine double-click. The docs' only related idempotency-adjacent guidance concerns action-ID rotation across deployments, a different failure mode. Treat this as unhandled by the framework — the module must implement its own guard (e.g., disable-on-pending, or a client-generated idempotency/event ID compared server-side, mirroring Meta's own `event_id` deduplication key).
- **Dash/hyphen support in environment variable names is undocumented** in `environment-variables.md` and `env.md`. Do not assume either way; verify against the JavaScript identifier rules of `process.env.X` access shown throughout the examples (all example names use underscores, never dashes), which is suggestive but not a direct statement.
- **Whether Server Actions execute during route prefetching is not directly stated.** The docs document that impure Server Component code *does* run during prefetch (the `trackPageView()` troubleshooting example), and recommend moving action-triggering logic to a Server Action invoked from a Client Component as the fix — which only makes sense as a fix if Server Actions are *not* auto-invoked by prefetch. This is a strong implication, not a directly quoted guarantee.
- **`event_source_url`'s query-string inclusion is unstated.** Meta's own definition ("the browser URL where the event happened... should match the verified domain") does not say whether query parameters (including `fbclid`, `utm_*`, etc.) should be included, stripped, or are immaterial. Since `fbclid` is separately and specifically extracted into `fbc` per the documented algorithm, sending it again inside `event_source_url`'s query string is not addressed as required, forbidden, or redundant anywhere in the fetched pages.
- **How a Client Component should hand the URL to a Server Action is not documented as a named pattern**, only inferable from separately confirmed facts (see B3). No contradiction was found, only an absence of an explicit worked example combining `useSearchParams()`/`usePathname()`/`window.location.href` with a Server Action call signature.
