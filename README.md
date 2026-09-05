# Meta Conversions API engine for Next.js

One module: `src/lib/meta-capi/`.

What it does:

- Lets any component of this site carry a Meta event.
- The browser declares the event.
- The server completes it: IP, user agent, `fbp`, `fbc`, time.
- The server normalizes and hashes the identity.
- The server posts it to the Conversions API.
- The access token never leaves the server.

Who this manual is for:

- The agent who changes the site.
- Requests arrive in plain language.
- The table in section 3 says which edit each request is.

## 1. Install

**Install the module and its configuration in the Next.js app.**

1. Copy `src/lib/meta-capi/` into the Next.js 16 app (App Router, React 19).
2. Add the two packages it needs:

```sh
npm i zod server-only
```

3. Put the configuration in `.env.local` locally.
4. Put the same configuration in the host's environment variables in production.

| Variable | Required | What it is |
| --- | --- | --- |
| `META_CAPI_DATASET_ID` | yes | The dataset (pixel) id from Events Manager |
| `META_CAPI_ACCESS_TOKEN` | yes | The Conversions API access token generated in Events Manager |
| `META_CAPI_GRAPH_VERSION` | no | Graph API version, default `v26.0` |
| `META_CAPI_TEST_EVENT_CODE` | no | Routes every event to the Test Events tab while set. Remove it in production |
| `META_CAPI_SITE_ORIGIN` | no | `https://www.example.ch`. When set, browser events from another origin are refused |
| `META_CAPI_TIMEOUT_MS` | no | Timeout of one call to Meta, default `1500` |
| `META_CAPI_INBOUND_SECRET` | no | Bearer secret of the reference route `POST /api/meta-events` |

- `.env*` stays in `.gitignore`.

## 2. The one file that belongs to this site: `policy.ts`

**Add this site's own rules on top of the engine's defaults, in one file: `src/lib/meta-capi/policy.ts`.**

- Everything Meta demands is already inside the engine.
- Everything this site demands on top goes in `src/lib/meta-capi/policy.ts`, and nowhere else.
- The file is a table keyed by event name, or `"*"` for every event.

```ts
import type { event_rule_table } from "./event_catalog";

export const policy = {
  "*": { requires: { custom_data: ["value", "currency"] } },
  Lead: { requires: { user_data: ["em"] }, recommends: { user_data: ["ph"] } },
  ShareDiscount: {},
} as const satisfies event_rule_table;
```

What a line does:

- `requires` makes the listed keys mandatory for that event. The type checker refuses every declaration that lacks them, and the server refuses the event if one slips through.
- `recommends` lets the event through and adds a warning naming the missing key in the send result.
- A key that is not one of Meta's standard names declares a custom event. `ShareDiscount: {}` is enough; from then on `event_name="ShareDiscount"` autocompletes and an undeclared name does not compile.

Sections a rule can name:

- `custom_data` (a list of keys)
- `user_data` (a list of keys)
- `attribution_data: true`

## 3. Recipes

**Look up a plain-language request and find the matching edit.**

| The request, in plain language | The edit |
| --- | --- |
| "On this product page, send a ViewContent" | In the page component: `<MetaEvent event_name="ViewContent" custom_data={{ content_ids: [id], content_type: "product" }} />` |
| "Every page sends a PageView" | `<MetaEvent event_name="PageView" />` in each page component, never in the layout |
| "On this form, the email becomes required" | `policy.ts`: `Lead: { requires: { user_data: ["em"] } }`. Then pass `user_data={{ em: email }}` where the form fires its Lead; `npm run typecheck` lists every call that still lacks it |
| "We add a newsletter checkbox, I want a CompleteRegistration tagged newsletter" | In the submit handler: `void track_meta_event({ event_name: "CompleteRegistration", custom_data: { content_name: "newsletter" } })`. `content_name` is Meta's key for naming a variant of a standard event; it is usable in custom conversions and audiences |
| "A purchase" | `Purchase` needs `custom_data.value` and `custom_data.currency`; without them the code does not compile |
| "Every event must carry a value, even 0" | `policy.ts`: `"*": { requires: { custom_data: ["value", "currency"] } }` |
| "A custom event named ShareDiscount" | `policy.ts`: `ShareDiscount: {}`, then use it like a standard name |
| "Track something that happens on the server, a paid webhook for instance" | `send_meta_events([...])` from `@/lib/meta-capi/server`, see section 6 |
| "Check what Meta received" | Section 10 |

## 4. Tag a page or a component that is shown

**Tag a page or a component that is shown on screen.**

1. Import `MetaEvent` in a Server Component.
2. Keep the page a Server Component; the tag is the only client leaf.

```tsx
import { MetaEvent } from "@/lib/meta-capi";

const ProductPage = async ({ params }: PageProps<"/products/[id]">) => {
  const { id } = await params;
  return (
    <main>
      <MetaEvent event_name="ViewContent" custom_data={{ content_ids: [id], content_type: "product" }} />
      ...
    </main>
  );
};
```

Rules of the tag:

- It renders nothing.
- It fires once when it appears on screen, and again whenever the URL (path or search params) changes while it stays on screen.
- It never fires during server rendering, prefetching, or a rerender with the same declaration.
- Put it in the page or component that shows the thing it describes. In a layout it would fire once per visit, not once per page.
- It works inside Client Components too.

## 5. Tag a gesture

**Tag a gesture from a Client Component.**

1. Call `track_meta_event` in the handler, from a Client Component.
2. `void` the call when nothing waits for the answer, since it returns a promise.

```tsx
"use client";
import { track_meta_event } from "@/lib/meta-capi";

export const AddToCartButton = ({ sku, price }: { sku: string; price: number }) => (
  <button
    type="button"
    onClick={() => {
      void track_meta_event({
        event_name: "AddToCart",
        custom_data: { content_ids: [sku], content_type: "product", value: price, currency: "CHF" },
      });
    }}
  >
    Add to cart
  </button>
);
```

## 6. Send from the server

**Send an event from the server: a webhook, a route handler, or a server action.**

1. Import `send_meta_events` from `@/lib/meta-capi/server`.
2. Give the event what the browser would have given.

```ts
import { send_meta_events } from "@/lib/meta-capi/server";

const result = await send_meta_events([
  {
    event_name: "Purchase",
    event_id: order.id,
    event_time: Math.floor(order.paid_at.getTime() / 1000),
    event_source_url: "https://www.example.ch/checkout/thank-you",
    user_data: { em: order.email, ph: order.phone, client_ip_address: order.ip, client_user_agent: order.user_agent },
    custom_data: { value: order.total, currency: "CHF", order_id: order.id, content_ids: order.skus },
  },
]);
```

- `order.paid_at` must be a real `Date`, built from a timestamp that carries its offset.
- A date parsed from a string without one is read in the server's time zone.

Check: inspect the returned `result`.

| `result` | Meaning |
| --- | --- |
| `{ ok: true, events_received, fbtrace_id, messages, warnings }` | Meta counted the events. `warnings` lists identifiers that were dropped and recommended keys that were missing |
| `{ ok: false, reason: "invalid_event", issues }` | Refused before sending. `issues[]` carry the event index, the path and the message |
| `{ ok: false, reason: "graph_rejected", status, error }` | Meta refused. `error.code`, `error.error_subcode`, `error.message`, `error.fbtrace_id` |

- Throws `meta_capi_config_error` when the environment is incomplete.
- Throws `meta_capi_transport_error` when Meta is unreachable after one retry.

For JSON that comes from outside the code:

- `send_inbound_meta_events(payload)` takes an unknown body shaped `{ "events": [ ... ] }` and returns the same `result`.
- The reference route `src/app/api/meta-events/route.ts` uses it: `POST /api/meta-events` with `Authorization: Bearer $META_CAPI_INBOUND_SECRET`.

## 7. What an event may carry

**Know what fields an event may carry.**

`event_name` is one of Meta's standard names, offered by autocompletion, or a custom name declared in `policy.ts`:

- `AddPaymentInfo`
- `AddToCart`
- `AddToWishlist`
- `CompleteRegistration`
- `Contact`
- `CustomizeProduct`
- `Donate`
- `FindLocation`
- `InitiateCheckout`
- `Lead`
- `Purchase`
- `Schedule`
- `Search`
- `StartTrial`
- `SubmitApplication`
- `Subscribe`
- `ViewContent`
- `PageView`
- `AppendAttribution`

- `Purchase` requires `custom_data.value` and `custom_data.currency`.
- `AppendAttribution` requires `attribution_data` and `custom_data.currency`.

`custom_data`, all optional unless a rule says otherwise:

| Key | Type |
| --- | --- |
| `value` | number, the amount |
| `currency` | three-letter ISO 4217 code, any case |
| `content_ids` | `string[]`, catalogue ids |
| `content_type` | `"product"` or `"product_group"` |
| `contents` | `{ id, quantity, item_price?, delivery_category? }[]` |
| `content_name`, `content_category`, `order_id`, `search_string` | string |
| `num_items` | integer |
| `predicted_ltv`, `net_revenue` | number |
| `status` | boolean |
| `delivery_category` | `"in_store"`, `"curbside"` or `"home_delivery"` |
| any other key without whitespace | string, number, boolean, or a list of strings or numbers |

Other event keys:

- `event_id`
- `opt_out`
- `data_processing_options` (`[]` or `["LDU"]`, US only)
- `data_processing_options_country`
- `data_processing_options_state`
- `customer_segmentation`
- `original_event_data`
- `attribution_data`

From the server only:

- `event_time`
- `action_source`
- `event_source_url`
- `referrer_url`

## 8. Identity

**Give identity in `user_data`; the server normalizes and hashes it.**

- Give raw values in `user_data`.
- The server normalizes and hashes them.
- A value already hashed with SHA-256 is sent as is.

| Key | Give | Example |
| --- | --- | --- |
| `em` | email | `John.Smith@example.ch` |
| `ph` | phone with country code | `+41 79 123 45 67` |
| `fn`, `ln` | names | `Valéry`, `O'Brien` |
| `ge` | gender | `f` or `m` |
| `db` | birth date | `1997-02-16` or `19970216` |
| `ct`, `st` | city, state | `Zürich`, `ZH` |
| `zp` | postal code | `8000` |
| `country` | ISO 3166-1 alpha-2 | `CH` |
| `external_id` | your own user id | `user-42` |
| `subscription_id`, `fb_login_id`, `lead_id` | as Meta defines them, sent in clear | |

- Each of `em` to `external_id` also takes a list.
- A value the engine cannot use is dropped and named in `warnings`.

From the browser, the server adds on its own:

- `client_ip_address`
- `client_user_agent`
- `fbp` and `fbc` from the `_fbp` and `_fbc` cookies
- `fbc` rebuilt from a `fbclid` in the URL
- `event_source_url` with its full query string
- `referrer_url`
- `event_time`
- a UUID `event_id` when the declaration carries none

## 9. Consent

**Gate the engine behind consent, the same way the pixel is gated.**

- The engine holds no consent state and writes no cookie.
- Render `MetaEvent` and call `track_meta_event` only once the consent manager allows Meta, the same way the pixel is gated.

## 10. Check that it works

**Confirm that a tagged event reaches Meta.**

1. Set `META_CAPI_TEST_EVENT_CODE` to the code shown in Events Manager, Test Events tab.
2. Load a tagged page, or run:

```sh
npm run e2e
```

Check:

- The event appears in the Test Events tab within seconds.
- The event appears in the Overview within twenty minutes.

3. Remove the test code before going to production.

## 11. Commands

**Run the project's commands.**

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on `http://localhost:3000` |
| `npm run typecheck` | Lists every declaration that breaks a rule of `policy.ts` or of Meta |
| `npm test` | Unit tests of the engine, in `src/lib/meta-capi-tests/` |
| `npm run e2e` | Real browser: one page load, one event at Meta. Skipped without a token |
| `npm run verify` | Typecheck, lint, tests, e2e, production build |
