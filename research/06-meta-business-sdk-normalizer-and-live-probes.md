# Meta Business SDK normalizer, Vercel IP header, and live transport probes

Written by the orchestrator during phase 2 to settle what the five research reports left open. Every finding carries its source.

## Sources

| URL | Format obtained | What it covers |
| --- | --- | --- |
| https://raw.githubusercontent.com/facebook/facebook-nodejs-business-sdk/main/src/objects/serverside/utils.js | JavaScript source (HTTP 200) | Meta's own `normalizeAndHash` and per-field normalizers |
| https://raw.githubusercontent.com/facebook/facebook-nodejs-business-sdk/main/src/objects/serverside/user-data.js | JavaScript source (HTTP 200) | Which `user_data` keys are normalized and hashed, which pass through |
| https://raw.githubusercontent.com/facebook/facebook-nodejs-business-sdk/main/src/objects/serverside/event-request.js | JavaScript source (HTTP 200) | Request-level keys the SDK sends (`data`, `test_event_code`, `partner_agent`, `namespace_id`, `upload_id`, `upload_tag`, `upload_source`) |
| https://vercel.com/docs/headers/request-headers | HTML (RSC payload, HTTP 200) | `x-forwarded-for`, `x-vercel-forwarded-for`, `x-real-ip` semantics on Vercel |
| https://graph.facebook.com/v26.0/{dataset_id}/events and https://graph.facebook.com/v25.0/{dataset_id}/events | JSON (HTTP 200) | Live transport probes, see below |

## Findings

### 1. Meta's reference normalization (Business SDK, `utils.js`)

`ServerSideUtils.normalizeAndHash(input, field)`:

| Step | Rule (from the source) | Applies to |
| --- | --- | --- |
| 0 | `null` input or `null` field returns `null` | all |
| 1 | `input.trim().toLowerCase()`; empty result returns `null` | all hashed fields |
| 2 | A value matching `^[a-f0-9]{64}$` (SHA-256) or `^[a-f0-9]{32}$` (MD5) is returned as is, never re-hashed | all hashed fields |
| 3 | Per-field normalization, then `sha256(normalized)` lowercase hex | see table below |

| Field | Per-field rule in the SDK |
| --- | --- |
| `country` | validated against ISO 3166-1 alpha-2 (`iso-3166-1` package) |
| `ct` | `replace(/[0-9\s().-]/g, '')` |
| `em` | validated with `email-validator`, throws on an invalid address |
| `ge` | `replace(/[^a-z]/g, '')` then mapped to `f` or `m`, otherwise `null` |
| `ph` | `replace(/[\-@#<>'",; ]|\(|\)|\+|[a-z]/g, '')`; when the result is an international number (`^\d{1,4}\(?\d{2,3}\)?\d{4,}$`, or `^1\(?\d{3}\)?\d{7}$` for US) leading zeros are dropped with `^\+?0{0,2}` |
| `st` | `replace(/[0-9\s().-]/g, '')` |
| `zp` | `replace(/[\s]/g, '')`, then `split('-', 1)[0]`; shorter than 2 characters returns `null` |
| `fn`, `ln`, `db`, `external_id` | no per-field rule: step 1 only (trim, lowercase) |
| `f5first`, `f5last`, `fi`, `dobd`, `dobm`, `doby` | SDK-only derived keys, not in the Conversions API parameter reference |
| `currency` (custom_data) | `trim().toUpperCase()`, then `replace(/[^A-Z]/g, '')`, validated as ISO 4217 |
| `delivery_category` | `trim().toLowerCase()`, must be one of `in_store`, `curbside`, `home_delivery` |

`user-data.js` `normalize()` hashes `em`, `ph`, `ge`, `db`, `ln`, `fn`, `ct`, `st`, `zp`, `country`, `external_id` (each as a list) and passes `client_ip_address`, `client_user_agent`, `fbc`, `fbp`, `subscription_id`, `fb_login_id`, `lead_id`, `madid`, `anon_id` through untouched.

`event-request.js` builds the request as `{ data: [...normalized events], test_event_code, partner_agent, namespace_id, upload_id, upload_tag, upload_source }` and sends it through the Graph API client as a `POST` to `/{pixel_id}/events`; when an app secret is configured it adds `appsecret_proof = HMAC-SHA256(access_token, app_secret)`.

### 2. Client IP on Vercel

From https://vercel.com/docs/headers/request-headers:

- `x-forwarded-for`: "The public IP address of the client that made the request." "If you are trying to use Vercel behind a proxy, we currently overwrite the" header.
- `x-vercel-forwarded-for`: "This header is identical to the `x-forwarded-for` header. However, `x-forwarded-for` could be overwritten if you're using a proxy on top of Vercel."
- `x-real-ip`: "This header is identical to the `x-forwarded-for` header."

Read order retained for the engine: `x-vercel-forwarded-for`, then `x-real-ip`, then the first comma-separated entry of `x-forwarded-for`.

### 3. Live transport probes (2026-09-05, dataset from `.env.local`, token redacted)

Probe A: `POST https://graph.facebook.com/v26.0/{dataset_id}/events`, headers `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`, body:

```json
{"data":[{"event_name":"PageView","event_time":<now>,"event_id":"smoke-a-<now>","action_source":"website","event_source_url":"https://example.com/smoke?fbclid=AbC123&utm_source=loop","user_data":{"em":["<sha256 of john_smith@gmail.com>"],"client_ip_address":"203.0.113.7","client_user_agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36","fbc":"fb.1.<now_ms>.AbC123"}}]}
```

Response: `HTTP 200` `{"events_received":1,"messages":[],"fbtrace_id":"APLCx54QR5fHdiGOSzpwM-s"}`

Probe B: `POST https://graph.facebook.com/v25.0/{dataset_id}/events`, header `Content-Type: application/json`, body with `"access_token":"<TOKEN>"` as a top-level JSON field and one `ViewContent` event carrying `custom_data: {"content_ids":["42"],"content_type":"product","value":19.9,"currency":"chf"}`.

Response: `HTTP 200` `{"events_received":1,"messages":[],"fbtrace_id":"AyGtGa5nLxyOugDkv1QLsk3"}`

What the probes establish:

- A JSON body is accepted; no form encoding is needed.
- The token is accepted both as `Authorization: Bearer` and as a top-level `access_token` field. The engine uses the header so the token never sits in a body or a URL.
- Both `v25.0` and `v26.0` accept the payload.
- `PageView` is accepted as an `event_name` through the Conversions API.
- `value` as a JSON number and `currency` in lowercase are accepted without a warning in `messages`.
- The token whose `debug_token` scope reads only `read_ads_dataset_quality` (report 05) does send events.
