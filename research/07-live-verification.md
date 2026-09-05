# Phase 5 - live verification of the shape

2026-09-05, dataset `1202835294532393` (Gray's test Events Manager), Graph `v26.0`, token redacted as `<TOKEN>`, inbound secret redacted as `<SECRET>`. Direct Graph calls carry `User-Agent: MetaCapiHarness/0.1 (claude-fable-5-1) curl/8`. The engine's own calls carry Node's default agent.

## A. Through the engine (`next dev` on localhost:3000, route `POST /api/meta-events`)

### A1. No bearer

```
curl -X POST http://localhost:3000/api/meta-events -H "content-type: application/json" -d '{"events":[]}'
```

`HTTP 401` `{"error":"unauthorized"}`

### A2. Raw Purchase, every identifier in clear, custom property included

```
curl -X POST http://localhost:3000/api/meta-events -H "authorization: Bearer <SECRET>" -H "content-type: application/json" -d '{"events":[{"event_name":"Purchase","event_id":"curl-purchase-<now>","event_source_url":"https://shop.example/thank-you?order=42&fbclid=CurlClick","user_data":{"em":"John_Smith@gmail.com","ph":"+41 79 123 45 67","fn":"Valéry","ln":"O'"'"'Brien","ct":"Zürich","zp":"8000","country":"CH","external_id":"user-42","client_ip_address":"203.0.113.7","client_user_agent":"Mozilla/5.0 (Macintosh) curl-verification","fbc":"fb.1.<now_ms>.CurlClick"},"custom_data":{"value":129.9,"currency":"chf","order_id":"42","content_ids":["sku-1","sku-2"],"content_type":"product","contents":[{"id":"sku-1","quantity":1,"item_price":99.9},{"id":"sku-2","quantity":1,"item_price":30}],"num_items":2,"compared_product":"banner-shoes"}}]}'
```

`HTTP 200` `{"ok":true,"events_received":1,"messages":[],"fbtrace_id":"Ap15kJWFpVIhPbM7teS-bvX","warnings":[]}`

The engine hashed `em`, `ph`, `fn`, `ln`, `ct`, `zp`, `country`, `external_id`, uppercased `currency`, stamped `event_time`, and Meta counted one event. Matches research/02 §5 (success shape) and research/03 §1 (hashing rules).

### A3. Purchase without currency

```
curl -X POST http://localhost:3000/api/meta-events -H "authorization: Bearer <SECRET>" -H "content-type: application/json" -d '{"events":[{"event_name":"Purchase","event_source_url":"https://shop.example/x","custom_data":{"value":1}}]}'
```

`HTTP 400` `{"ok":false,"reason":"invalid_event","issues":[{"path":"events.0.custom_data.currency","message":"Purchase requires custom_data.currency"}]}`

Refused before any network call, as research/01 §1 requires for `Purchase`.

## B. Direct Graph calls, to observe the error shapes the engine parses

### B1. `event_time` eight days old

```
curl -X POST https://graph.facebook.com/v26.0/1202835294532393/events -H "Authorization: Bearer <TOKEN>" -H "content-type: application/json" -d '{"data":[{"event_name":"Lead","event_time":<now-8d>,"action_source":"website","event_source_url":"https://shop.example/","user_data":{"client_user_agent":"curl"}}]}'
```

`HTTP 400`

```json
{
  "error": {
    "message": "Invalid parameter",
    "type": "OAuthException",
    "code": 100,
    "error_subcode": 2804003,
    "is_transient": false,
    "error_user_title": "Timestamp de l’évènement trop ancien",
    "error_user_msg": "Le timestamp pour cet évènement est trop éloigné dans le passé. Les évènements doivent être envoyés depuis votre serveur dans les 7 jours après avoir eu lieu. Entrez un timestamp qui a eu lieu au cours des 7 derniers jours.",
    "fbtrace_id": "ASrojb9Zf5r-cU8FBLq9HY0"
  }
}
```

Every field of `graph_error_schema` appears: `message`, `type`, `code`, `error_subcode`, `is_transient`, `error_user_title`, `error_user_msg`, `fbtrace_id`. The 7-day rule of research/02 §3 is enforced by Meta with code 100 and subcode 2804003; the engine refuses such an event locally before sending.

### B2. Invalid token

`HTTP 401` `{"error":{"message":"Invalid OAuth access token - Cannot parse access token","type":"OAuthException","code":190,"fbtrace_id":"ArrDTKwNSI_BDSmS3-M4h56"}}`

Code 190 as research/02 §5 lists.

### B3. Website event without `client_user_agent`

```
curl -X POST https://graph.facebook.com/v26.0/1202835294532393/events -H "Authorization: Bearer <TOKEN>" -H "content-type: application/json" -d '{"data":[{"event_name":"Lead","event_time":<now>,"action_source":"website","event_source_url":"https://shop.example/","user_data":{"em":["62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f"]}}]}'
```

`HTTP 200` `{"events_received":1,"messages":[],"fbtrace_id":"ATHEd8F7ddsITPV0fE5TWjY"}`

Discrepancy with research/02 §3 and research/03 §1, which quote `client_user_agent` as "required for website events": Graph accepts the event. The engine keeps the key optional and returns a warning naming the event.

## C. Real browser, real router (`tests/page_view_fires_once.spec.ts`)

Chromium loads `http://localhost:3000/?utm_source=playwright&fbclid=PlaywrightClick` on the dev server, React Strict Mode on. Observed: exactly one `POST /` carrying a `next-action` header within 1.5 s of the load, whose body contains `"events_received":1`. The dev log shows one `POST / 200`. One page view, one server action, one event at Meta.

## D. Earlier probes (phase 2, research/06 §3)

JSON body with `Authorization: Bearer` on `v26.0`, and `access_token` in the body on `v25.0`, both answered `HTTP 200` with `events_received: 1`. `PageView` accepted as an event name. `value` as a number and lowercase `currency` accepted.

## E. Identity cookies in a real browser (2026-09-05, `tests/identity_cookies.spec.ts`)

Chromium, fresh context, dev server, React Strict Mode on.

- `GET /` with curl, no cookie in the request: the response carries no `Set-Cookie`. Nothing is written outside a send.
- Load `/?utm_source=e2e&fbclid=E2EClick`: exactly one server action POST. Its response carries two headers, observed verbatim: `_fbc=fb.1.1788623130951.E2EClick; Path=/; Expires=Fri, 04 Dec 2026 15:45:30 GMT; Max-Age=7776000; SameSite=lax` and `_fbp=fb.1.<ms>.<ten digits>; Path=/; Expires=...; Max-Age=7776000; SameSite=lax`. Next adds `Expires` next to `Max-Age` and lowercases the `SameSite` value. No `Secure` on http, no `HttpOnly`.
- The browser stores both with `httpOnly: false`, `secure: false`, `sameSite: Lax`, `path: /`, `domain: localhost`, expiry within two minutes of now plus ninety days.
- Load `/` again: one server action POST, whose `Cookie` request header carries both values back, and whose response carries no `Set-Cookie`.
- The action response with cookies set weighs 5 926 bytes and contains the re-rendered page; the one without weighs 164 bytes and contains no page. This confirms the documentation of `cookies()` and of Server Actions: a cookie mutation re-renders the current route in the same round trip, even for a plain function call from an effect. The tag fired once per load in both cases.

## F. Two tags on one landing page, fresh cookie jar (2026-09-05, `tests/two_tags_one_fbp.spec.ts`)

`/two-tags?fbclid=RaceClick` carries a `PageView` tag and a `ViewContent` tag, so two server actions start in the same tick on a browser with no cookie. Observed: the first send arrives with no `Cookie` header and its response sets `_fbc` and `_fbp`; the second send already carries `_fbc=fb.1.1788623371353.RaceClick; _fbp=fb.1.1788623371353.5957399388` in its request and its response sets nothing. One `_fbp` and one `_fbc` in the jar. Next's sequential dispatch of Server Actions per client, documented in `server-actions.md`, holds for plain function calls made from effects: the second request leaves after the first response is applied. No serialization is needed in the engine.

## G. Systematic external_id (2026-09-05, `tests/identity_cookies.spec.ts` and `tests/two_tags_one_fbp.spec.ts`)

Same runs as E and F, extended: the first send's response also carries `external_id=<uuid v4>; Path=/; Expires=...; Max-Age=7776000; SameSite=lax`, the browser stores it with the same attributes as `_fbp`, the next load sends it back and nothing re-sets it, and two simultaneous tags on a fresh browser end with exactly one `external_id`.

## Verdict

No gap between the observed responses and the shape closed in phase 2. One documented requirement (`client_user_agent` on website events) is not enforced by Graph; recorded as a warning in the engine and in the decisions log. Phase 2 stays closed.
