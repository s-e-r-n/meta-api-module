# Conversions API payload, verified 2026-09-05

Sources: Meta's Conversions API parameter pages (markdown twins), Meta's Business SDK normalizer, and live calls against Graph v26.0. Where a page and Graph disagreed, Graph won.

## Request

| Level | Key | Type | Rule |
| --- | --- | --- | --- |
| request | `data` | array, 1 to 1000 events | one invalid event rejects the batch |
| request | `test_event_code` | string | routes to the Test Events tab; events still count; remove in production |
| request | `partner_agent` | string under 23 characters | platforms sending for clients only |
| auth | `Authorization: Bearer <token>` | header | accepted with a JSON body; `access_token` in the body also works |

## Event

| Key | Type | Required | Notes |
| --- | --- | --- | --- |
| `event_name` | string, 1 to 50 characters | yes | standard name or custom name |
| `event_time` | integer, unix seconds, GMT | yes | at most 7 days in the past; Graph answers code 100 subcode 2804003 beyond |
| `action_source` | `email` `website` `app` `phone_call` `chat` `physical_store` `system_generated` `business_messaging` `other` | yes | |
| `event_source_url` | absolute URL | for website events | full URL, query string included |
| `event_id` | string | recommended | dedup with the pixel's `eventID` within 48 hours; browser wins within 5 minutes |
| `user_data` | object | yes | see below |
| `custom_data` | object | `Purchase` needs `value` and `currency` | see below |
| `opt_out` | boolean | no | attribution only, no optimization |
| `data_processing_options` | `[]` or `["LDU"]` | no | US state laws only; EU and CH send `[]` or omit |
| `data_processing_options_country` | `0` or `1` | with LDU | |
| `data_processing_options_state` | `0`, `1000` to `1013` | with LDU | |
| `referrer_url` | string | no | the HTTP referrer of the page |
| `customer_segmentation` | enum of nine values | no | `new_customer_to_business`, ... |
| `original_event_data` | `{ event_name?, event_time?, order_id?, event_id? }` | no | ties a delayed event to its acquisition event |
| `attribution_data` | `{ ad_id, touchpoint_ts, attribution_share, attribution_value }` | `AppendAttribution` only | beta, access limited |

## Standard event names

`AddPaymentInfo` `AddToCart` `AddToWishlist` `CompleteRegistration` `Contact` `CustomizeProduct` `Donate` `FindLocation` `InitiateCheckout` `Lead` `Purchase` `Schedule` `Search` `StartTrial` `SubmitApplication` `Subscribe` `ViewContent` `PageView` `AppendAttribution`

## `user_data`

| Key | Hash | Normalization before SHA-256 |
| --- | --- | --- |
| `em` | yes | trim, lowercase; must look like an address |
| `ph` | yes | digits only, leading zeros removed, country code included, at least 7 digits |
| `fn`, `ln` | yes | trim, lowercase, punctuation removed, accents and other scripts kept |
| `ge` | yes | `f` or `m` |
| `db` | yes | `YYYYMMDD`; the engine accepts `YYYY-MM-DD` too |
| `ct`, `st` | yes | lowercase, digits, spaces, punctuation and symbols removed |
| `zp` | yes | lowercase, spaces removed, part before a dash, first 5 digits when country is `us` |
| `country` | yes | lowercase ISO 3166-1 alpha-2 |
| `external_id` | yes | trim, lowercase |
| `client_ip_address` | no | IPv4 or IPv6, IPv6 preferred |
| `client_user_agent` | no | raw user agent; docs say required for website events, Graph accepts without |
| `fbc` | no | `fb.1.<unix ms>.<fbclid>`, case preserved |
| `fbp` | no | `fb.1.<unix ms>.<random>` from the `_fbp` cookie |
| `subscription_id`, `fb_login_id`, `lead_id` | no | |

Every hashed key takes a string or a list of strings. A 64-hex lowercase value is already a hash and passes through. Empty values are dropped.

Meta's own priority for match quality: email and click id high; birth date, country, phone, external id, browser id, login id medium; names, city, postal code low.

## `custom_data`

| Key | Type |
| --- | --- |
| `value` | number, sent as a JSON number |
| `currency` | ISO 4217, the engine uppercases it |
| `content_ids` | `string[]` |
| `content_type` | `product` or `product_group` |
| `contents` | `{ id, quantity, item_price?, delivery_category? }[]` |
| `content_name`, `content_category`, `order_id`, `search_string` | string |
| `num_items` | integer |
| `predicted_ltv`, `net_revenue` | number |
| `status` | boolean |
| `delivery_category` | `in_store`, `curbside`, `home_delivery` |
| custom properties | any key without whitespace; string, number, boolean, or list of strings or numbers |

Vertical keys (auto, real estate, travel, hotel) exist in Meta's table and travel as custom properties.

## Answers

| Case | HTTP | Body |
| --- | --- | --- |
| accepted | 200 | `{ "events_received": n, "messages": [...], "fbtrace_id": "..." }` |
| payload refused | 400 | `{ "error": { "message", "type": "OAuthException", "code": 100, "error_subcode"?, "is_transient"?, "error_user_title"?, "error_user_msg"?, "fbtrace_id" } }` |
| bad token | 401 | `{ "error": { "code": 190, ... } }` |
| permission | 400 | `{ "error": { "code": 200 or 100 "Missing Permission", ... } }` |
| rate limit | 4xx | codes 4, 17, 613, 80000 to 80014 |

Meta recommends a 1500 ms timeout and a retry on non-client errors; most answers arrive under 600 ms.
