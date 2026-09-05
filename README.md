# Meta Conversions API engine for Next.js

One module, `src/lib/meta-capi/`, that lets any component carry a Meta event. The browser declares the event, the server completes it (IP, user agent, `fbp`, `fbc`, time), normalizes and hashes the identity, and posts it to the Conversions API. The access token never leaves the server.

## 1. Install

1. Copy `src/lib/meta-capi/` into your Next.js 16 app (App Router, React 19).
2. Add the two packages it needs:

```sh
npm i zod server-only
```

3. Put the configuration in `.env.local` locally and in the host's environment variables in production:

| Variable | Required | What it is |
| --- | --- | --- |
| `META_CAPI_DATASET_ID` | yes | The dataset (pixel) id from Events Manager |
| `META_CAPI_ACCESS_TOKEN` | yes | The Conversions API access token generated in Events Manager |
| `META_CAPI_GRAPH_VERSION` | no | Graph API version, default `v26.0` |
| `META_CAPI_TEST_EVENT_CODE` | no | Routes every event to the Test Events tab while set. Remove it in production |
| `META_CAPI_SITE_ORIGIN` | no | `https://www.example.ch`. When set, browser events from another origin are refused |
| `META_CAPI_TIMEOUT_MS` | no | Timeout of one call to Meta, default `1500` |
| `META_CAPI_INBOUND_SECRET` | no | Bearer secret of the reference route `POST /api/meta-events` |

`.env*` stays in `.gitignore`.

## 2. Tag a page or a component that is shown

Import `MetaEvent` in a Server Component. The page stays a Server Component; the tag is the only client leaf.

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

`<MetaEvent event_name="PageView" />` is the page view tag.

## 3. Tag a gesture

From a Client Component, call `track_meta_event` in the handler. It returns a promise; `void` it when nothing waits for the answer.

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

## 4. Send from the server

For a webhook, a route handler, or your own server action, import from the server entry. Give the event what the browser would have given.

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

`result` is one of:

| `result` | Meaning |
| --- | --- |
| `{ ok: true, events_received, fbtrace_id, messages, warnings }` | Meta counted the events. `warnings` lists identifiers that were dropped |
| `{ ok: false, reason: "invalid_event", issues }` | Refused before sending. `issues[]` carry the event index, the path and the message |
| `{ ok: false, reason: "graph_rejected", status, error }` | Meta refused. `error.code`, `error.error_subcode`, `error.message`, `error.fbtrace_id` |

It throws `meta_capi_config_error` when the environment is incomplete and `meta_capi_transport_error` when Meta is unreachable after one retry.

The reference route `src/app/api/meta-events/route.ts` shows the external inbound case: `POST /api/meta-events` with `Authorization: Bearer $META_CAPI_INBOUND_SECRET` and a body `{ "events": [ ... ] }`.

## 5. What an event may carry

`event_name` is one of Meta's standard names, or any custom name up to 50 characters:

`AddPaymentInfo` `AddToCart` `AddToWishlist` `CompleteRegistration` `Contact` `CustomizeProduct` `Donate` `FindLocation` `InitiateCheckout` `Lead` `Purchase` `Schedule` `Search` `StartTrial` `SubmitApplication` `Subscribe` `ViewContent` `PageView` `AppendAttribution`

`Purchase` requires `custom_data.value` and `custom_data.currency`.

`custom_data`, all optional:

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

Other event keys: `event_id`, `opt_out`, `data_processing_options` (`[]` or `["LDU"]`, US only), `data_processing_options_country`, `data_processing_options_state`, `customer_segmentation`, `original_event_data`, `attribution_data`. From the server only: `event_time`, `action_source`, `event_source_url`, `referrer_url`.

## 6. Identity

Give raw values in `user_data`. The server normalizes and hashes them. A value already hashed with SHA-256 is sent as is.

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

Each of `em` to `external_id` also takes a list. A value the engine cannot use is dropped and named in `warnings`.

From the browser, the server adds on its own: `client_ip_address`, `client_user_agent`, `fbp` and `fbc` from the `_fbp` and `_fbc` cookies, `fbc` rebuilt from a `fbclid` in the URL, `event_source_url` with its full query string, `referrer_url`, `event_time`, and a UUID `event_id` when the declaration carries none.

## 7. Consent

The engine holds no consent state and writes no cookie. Render `MetaEvent` and call `track_meta_event` only once your consent manager allows Meta, the same way you would gate the pixel.

## 8. Check that it works

1. Set `META_CAPI_TEST_EVENT_CODE` to the code shown in Events Manager, Test Events tab.
2. Load a tagged page, or run:

```sh
npm run e2e
```

3. The event appears in the Test Events tab within seconds, and in the Overview within twenty minutes.
4. Remove the test code before going to production.

## 9. Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on `http://localhost:3000` |
| `npm test` | Unit tests of the engine |
| `npm run e2e` | Real browser: one page load, one event at Meta. Skipped without a token |
| `npm run verify` | Typecheck, lint, tests, e2e, production build |
