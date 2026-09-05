# Conversions API - Server Event Shape and Responses

Scope: web only (`action_source: website`). Mobile app, offline/physical-store, and business-messaging material is included only where it appeared inline in a web-relevant page, and is marked out-of-scope where relevant.

All pages were fetched with: `curl -sL -A "MetaCapiHarness/0.1 (claude-sonnet-5) curl/8" <url>`. Content was returned as `text/markdown` unless noted otherwise. HTML entities in the source markdown (`&lt;`, `&gt;`, `&quot;`, `&#039;`, `&#123;`, `&#125;`, `&amp;`) are decoded in quotes below for readability; wording is otherwise verbatim.

## Sources

| URL | Format obtained | What it covers |
| --- | --- | --- |
| https://developers.facebook.com/llms.txt | markdown (text/plain) | Root llms.txt index |
| https://developers.facebook.com/documentation/ads-commerce/llms.txt | markdown (text/plain) | Full Ads & Commerce doc index, incl. all Conversions API page paths |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/llms.txt | markdown (text/plain) | Marketing API endpoint reference index |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api.md | markdown | Conversions API overview |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/get-started.md | markdown | Prerequisites, access token generation |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/using-the-api.md | markdown | Endpoint, request/response examples, batch limits, event_time window, test_event_code, DPO, rate limits, Business SDK/Gateway |
| https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api | markdown | Old-site twin of the page above (byte-identical, confirmed via diff) |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/verifying-setup.md | markdown | Events Manager verification, dedup rate, Event Match Quality |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters.md | markdown | Index of all parameter categories |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/main-body.md | markdown | Main body parameter table (`data`, `test_event_code`) |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event.md | markdown | Full server-event parameter table |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/original-event.md | markdown | `original_event_data` sub-parameters |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters.md | markdown | Full `user_data` parameter table, hashing/normalization rules |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/external-id.md | markdown | `external_id` semantics, matching, fbp fallback |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc.md | markdown | ClickID/`fbc`/`fbp` retrieval, format, storage |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/custom-data.md | markdown | Full `custom_data` standard parameter table |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/app-data.md | markdown | `app_data` parameters (app events, out of web scope) |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events.md | markdown | Full dedup rules (event_id/event_name, fbp/external_id) |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/end-to-end-implementation.md | markdown | Full integration flow, success response example, order_id dedup, event freshness thresholds, partner_agent format |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/append-attribution.md | markdown | `AppendAttribution` event guide (beta) |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/append-attribution/reference.md | markdown | `attribution_data` and `original_event_data` field-level reference |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/best-practices.md | markdown | Required/recommended parameter table, baseline matching rules, EMQ |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/support.md | markdown | Troubleshooting, HTTP status code behavior, timeout guidance |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/set-up-conversions-api-as-a-platform.md | markdown | `partner_agent` sample payload (confirms main-body placement) |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/offline-events.md | markdown | Offline/physical-store fields, `upload_tag` legacy note (out of web scope) |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api.md | markdown | Setup Quality / Dataset Quality API (EMQ at scale) |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library.md | markdown | Parameter Builder SDK, `fbc`/`fbp` appendix format |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/business-messaging.md | markdown | `messaging_channel` key (out of web scope) |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/error-reference.md | markdown | General Marketing API error code table, `blame_field_specs` |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/versioning.md | markdown | Marketing API version policy (90-day deprecation), auto-upgrade |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/rate-limiting.md | markdown | Marketing API rate-limit quotas, headers, throttling error codes |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/data-processing-options.md | markdown | Full LDU / `data_processing_options*` reference (14 US states) |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/marketing-api-changelog/versions.md | markdown | Version/release/expiration date table (confirms v25.0 current) |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel/events.md | markdown | Canonical Graph API reference for `POST /{pixel_id}/events`: full parameter list incl. `platforms`/`progress`, Return Type struct, Error Codes table |
| https://developers.facebook.com/docs/graph-api/guides/error-handling | HTML (curl); summarized via WebFetch | General Graph API error JSON shape and common error code/subcode tables |
| https://developers.facebook.com/docs/graph-api/overview/rate-limiting | HTML (curl); summarized via WebFetch | General Graph API rate-limit headers and BUC vs platform limits |
| https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper | markdown | Payload Helper tool description |

## Contradictions and gaps

- **`docs/graph-api/guides/error-handling` and `docs/graph-api/overview/rate-limiting` did not return markdown for curl with the required User-Agent.** Both returned `text/html; charset="utf-8"` (~1.07 MB), a full SPA shell, even with an `Accept: text/markdown` header and with/without trailing slash. Appending `.md` to `docs/graph-api/guides/error-handling` returned HTTP 404. This contradicts the assumption that all `docs/...` pages return markdown for this User-Agent; only some paths (e.g. `docs/marketing-api/conversions-api/using-the-api`, `docs/marketing-api/offline-conversions`) did. Content for these two pages was obtained via WebFetch (AI-summarized, not verbatim) and is marked accordingly in Findings; exact wording could not be independently verified. The raw HTML also carried `lang="de"` (German locale), so summarized text may reflect a translated render rather than the canonical English copy.
- **Version-policy contradiction between two current pages.** `conversions-api/using-the-api.md` states: "Our release cycle is aligned with the Graph API, so every version is supported for at least two years. This exception is only valid for the Conversions API." But `marketing-api/overview/versioning.md` (linked from the same CAPI page as "Marketing API Rate Limiting"/version source) states the Marketing API gives "at least a 90-day grace period" before a version is deprecated, and the version table (`marketing-api-changelog/versions.md`) shows actual gaps of roughly 8-12 months between release and expiration for recent versions (e.g. v22.0 released Jan 21 2025, expires Feb 19 2026), not a flat 90 days nor a flat 2 years. Neither the "2 years" claim nor the "90 days" claim matches the observed table exactly for recent versions. Not resolved by any fetched page.
- **`data_processing_options_state` allowed values differ between two current pages.** `conversions-api/parameters/server-event.md` documents only two values: `1000` for California or `0` for geolocation. `marketing-api/overview/data-processing-options.md` documents fourteen values: `1000`-`1013` (California, Colorado, Connecticut, Florida, Oregon, Texas, Montana, Delaware, Nebraska, New Hampshire, New Jersey, Minnesota, Maryland, Rhode Island) or `0` for geolocation. The server-event.md page appears stale relative to the DPO reference page.
- **Main-body parameters are incomplete on the dedicated Main Body Parameters page.** `conversions-api/parameters/main-body.md` documents only `data` and `test_event_code`. The canonical Graph API reference for the same edge (`marketing-api/reference/ads-pixel/events.md`) additionally lists `platforms` (array of JSON objects with required `name`, `type`, optional `version`) and `progress` (object with `start_inclusive`/`end_exclusive` int64, described as "upload progress for offline events") as accepted parameters on `POST /{ads_pixel_id}/events`. Neither is documented in the narrative Parameters pages, nor described further anywhere else fetched.
- **`namespace_id`, `upload_id`, `upload_source` are not documented as current Conversions API main-body parameters anywhere fetched.** They appear only as Business SDK Java setter calls (`.namespaceId("11")`, `.uploadId("22222")`, `.uploadSource("upload-source-4")`) in a code sample on `conversions-api/using-the-api.md`, with no accompanying prose definition, type, or constraint. `upload_tag` is mentioned in prose on `conversions-api/offline-events.md`: "the `upload_tag` parameter is still supported for offline event uploads for advertisers using legacy API for offline events" - i.e. flagged as a legacy/Offline-Conversions-API-only field, not part of the current Conversions API request shape for website events. Old-site `docs/marketing-api/offline-conversions/v2` and `docs/marketing-api/offline-conversions/create` both 404'd, so no further definition could be found.
- **`advanced_measurement_table` does not appear in any fetched page.** No hits searching all fetched Conversions API, Marketing API overview, dataset-quality, or append-attribution pages. Not found.
- **`messaging_channel` and business-messaging `action_source` context are out of the stated web scope but were found.** It appears only in `conversions-api/business-messaging.md`, with observed values `messenger`, `whatsapp`, `instagram` in example payloads (not in a formal parameter table). Not otherwise documented and not relevant to `action_source: website`.
- **Whether `event_source_url` includes the query string is not stated anywhere fetched.** `parameters/server-event.md` says only: "The browser URL where the event happened. The URL should match the verified domain." No page states whether query parameters should be stripped, preserved, or are irrelevant to matching. Not found.
- **`test_event_code` validity duration is not stated in developer documentation.** `using-the-api.md` describes obtaining and using the code but never states an expiration/TTL. Not found in any `developers.facebook.com` page fetched (Business Help Center articles were out of scope for this pass since they are off-domain and not the LLM-format docs this task prioritizes).
- **The distinction between the Events Manager "Test Events" tab, "Overview" tab, and a "Diagnostics" tab (as named in the assignment) is only partly documented.** `verifying-setup.md` and `using-the-api.md` describe "Overview" (raw/matched/attributed counts, connection method, Event Freshness sub-tab, Event Deduplication sub-tab, Event Match Quality) and "Test Events" (routes `test_event_code`-tagged events to a live preview) in detail. No fetched page names or describes a separate "Diagnostics" tab for the core Conversions API event pipeline (a "Diagnostics" tab does exist for the unrelated, beta `AppendAttribution`/Custom Attribution Source feature, per `guides/append-attribution.md`, but that is a different product). Not found for the core CAPI flow.
- **Exact HTTP status codes are not enumerated for the Conversions API.** `conversions-api/support.md` only states: "If the event payload is valid, a `2xx HTTP` response code is returned. If invalid, a `4xx HTTP` response code is returned, with minimal error details in the response body." No specific codes (e.g. 400, 401, 403, 429, 500) are enumerated for CAPI anywhere fetched. The general Graph API error-handling page (WebFetch summary only, unverifiable) likewise did not surface an HTTP status code table.
- **Content-type / access_token placement is shown inconsistently across examples rather than stated as a formal rule.** Working examples show `access_token` as a multipart form field (`curl -F 'access_token=<ACCESS_TOKEN>'`), as a URL query parameter (`?access_token={TOKEN}` in the described endpoint path, and again in "Attach your generated secure access token using the `access_token` query parameter to the request"), and `data` shown as both a multipart form field and, in the canonical Graph API reference example, as a URL-encoded form body (`data=%5B%7B...%7D%5D`). No page states whether an `Authorization: Bearer <token>` header is accepted for this edge, nor whether a raw `application/json` body (without form-encoding `data`) is accepted; the "example request body" JSON block on `using-the-api.md` is presented without an accompanying content-type statement.
- **`action_source` optimization-capability claim differs between two current pages.** `conversions-api/parameters/server-event.md` states: "All action source values enable ad measurement and custom audience creation capabilities. All action sources enable ad optimization capabilities." `conversions-api/guides/append-attribution/reference.md`, documenting the same `action_source` enum verbatim, instead states: "All action source values enable ad measurement and custom audience creation capabilities. All action sources except `physical_store` enable ad optimization capabilities." Not resolved by any fetched page.
- **`fbc`/`fbp` format string has a trailing/inconsistent period in one instance.** `customer-information-parameters.md` states the `fbc` format as "fb.$\{subdomain_index\}.$\{creation_time\}.$\{fbclid\}." (with a trailing period before the closing backtick), while `parameters/fbp-and-fbc.md` and the append-attribution reference give the format without a trailing period: "version.subdomainIndex.creationTime.\<fbclid\>". Likely a typo on the customer-information-parameters page rather than an intentional trailing-dot requirement; flagged, not resolved.

## Findings

### 1. Endpoint, method, content types, versioning

| Item | Value | Source |
| --- | --- | --- |
| Endpoint pattern | `https://graph.facebook.com/{API_VERSION}/{PIXEL_ID}/events?access_token={TOKEN}` (also written as `POST /{ads_pixel_id}/events`) | using-the-api.md; marketing-api/reference/ads-pixel/events.md |
| HTTP method | `POST` only. Reference page: "Reading: You can't perform this operation on this endpoint." / "Updating: You can't perform this operation on this endpoint." / "Deleting: You can't perform this operation on this endpoint." | marketing-api/reference/ads-pixel/events.md |
| Content types observed in examples | multipart/form-data (`curl -F 'data=[...]' -F 'access_token=...'`); URL-encoded form body (`data=%5B%7B...%7D%5D` per the reference page's raw HTTP example); a bare JSON object shown as "an example request body" without an explicit content-type statement | using-the-api.md; marketing-api/reference/ads-pixel/events.md |
| `access_token` placement observed | Query parameter (`?access_token={TOKEN}` in the documented path; "Attach your generated secure access token using the `access_token` query parameter to the request"); multipart form field (`-F 'access_token=<ACCESS_TOKEN>'` in the curl example) | using-the-api.md |
| `access_token` as Authorization header | Not documented anywhere fetched for this edge | gap |
| Current Graph/Marketing API version | v25.0 (all working examples use `v25.0`; changelog table lists v25.0 released February 18, 2026, expiration "TBD") | using-the-api.md; marketing-api-changelog/versions.md |
| Version support window (Marketing API general) | "When a new version of the Marketing API releases, Meta continues to support the previous version of the Marketing API for at least 90 days." Deprecated-version calls "may fail or be upgraded to the next available version" per the auto-upgrade feature (enabled since May 2024 for endpoints unaffected between versions). | marketing-api/overview/versioning.md |
| Version support window (Conversions API claim) | "Our release cycle is aligned with the Graph API, so every version is supported for at least two years. This exception is only valid for the Conversions API." (see Contradictions) | using-the-api.md |
| Unversioned calls | "We refer to this as an unversioned call. Unversioned calls are invalid and will fail when made against Marketing API endpoints." | marketing-api/overview/versioning.md |
| Version auto-upgrade signal | Response header `X-Ad-Api-Version-Warning: 'The call has been auto-upgraded to vXXX as vXXX has been deprecated'` | marketing-api/overview/versioning.md |
| Migrations | Separate from versioning; some breaking changes shipped as opt-in/out "migrations" via the `migrations` field on the `/app` node or the `migrations_override` query flag; "Migrations have at least a 90-day window during which you must migrate your app." | marketing-api/overview/versioning.md |

### 2. Main body (request-level) keys

| Key | Type | Required | Notes | Source |
| --- | --- | --- | --- | --- |
| `data` | array<object> | Required | "An array of server event objects." Max 1,000 events per request: "You can send up to 1,000 events in `data`." "If any event you send in a batch is invalid, we reject the entire batch." | main-body.md; using-the-api.md |
| `test_event_code` | string | Optional | "Code used to verify that your server events are received correctly by Facebook. Use this code to test your server events in the Test Events feature in Events Manager." Must be removed for production: "The `test_event_code` field should be used only for testing. You need to remove it when sending your production payload." Events sent with it "are not dropped. They flow into Events Manager and are used for targeting and ads measurement purposes." | main-body.md; using-the-api.md |
| `partner_agent` | string | Optional (partners/agencies) | Request-level, sibling of `data` (confirmed by sample payload placing it outside the `data` array). "Should be in a format that is less than 23 characters and includes at least two alphabetical characters." Used to attribute events to a platform sending on behalf of clients. | guides/end-to-end-implementation.md; set-up-conversions-api-as-a-platform.md |
| `platforms` | array<object> | Not marked required in the reference table but listed with sub-fields `name` (string, required), `type` (string, required), `version` (string, not marked required) | Only definition found is the bare field list in the Graph API reference; no narrative description | marketing-api/reference/ads-pixel/events.md |
| `progress` | object (`start_inclusive` int64, `end_exclusive` int64) | Optional | Described only as "upload progress for offline events" | marketing-api/reference/ads-pixel/events.md |
| `namespace_id`, `upload_id`, `upload_source` | unknown (seen only as SDK setter calls: string) | Undocumented | Not documented as current-API main-body keys; see Contradictions/gaps | using-the-api.md (code sample only) |
| `upload_tag` | unknown (seen only as SDK setter: string) | "Optional parameter... still supported for offline event uploads for advertisers using legacy API for offline events" | Positioned as legacy/offline-only | offline-events.md |
| `access_token` | string | Required (standard Graph API auth) | See placement notes in Section 1 | using-the-api.md |

Payload size / batching / retry guidance found:

- Batch cap: "You can send up to 1,000 events in `data`." (using-the-api.md)
- Freshness guidance: "for optimal performance, we recommend you send events as soon as they occur and ideally within an hour of the event occurring." (using-the-api.md)
- Freshness thresholds (from the end-to-end guide): "Sending your events more than 2 hours after they occurred can cause a significant decrease in performance for ads optimized for those events. Events sent with a delay of 24 hours or more may experience significant issues with attribution and optimized ad delivery." (guides/end-to-end-implementation.md)
- Retry guidance: "We recommend retrying the request in cases where the response indicates a non-client error, such as a timeout. To account for various network delays, we recommend setting a timeout of 1500 milliseconds on the request. For the majority of requests, the response time will be under 600 milliseconds." (support.md)
- Rate limiting: "There is no specific rate limit for the Conversions API. Conversions API calls are counted as Marketing API calls." and "The Marketing API has its own rate-limiting logic and is excluded from all the Graph API rate limitations." (using-the-api.md; marketing-api/overview/rate-limiting.md)
- Business SDK batching features: Asynchronous Requests, Concurrent Batching, and HTTP Service Interface, with minimum language versions PHP >= 7.2, Node.js >= 7.6.0, Java >= 8, Python >= 2.7, Ruby >= 2. (using-the-api.md)

### 3. Server event keys

| Key | Type | Required | Allowed values / format | Source |
| --- | --- | --- | --- | --- |
| `event_name` | string | Required | Standard or custom event name. Used for dedup together with `event_id`. Dedup window/precedence: "If we find a match between events sent within 48 hours of each other, we only consider the first one. If a server and browser/app event arrive at approximately the same time (that is, within 5 minutes of each other), we favor the browser/app event." | server-event.md |
| `event_time` | integer (Unix timestamp, seconds, GMT) | Required | "May be earlier than the time you send the event." Window: "can be up to 7 days before you send an event to Facebook. If any `event_time` in `data` is greater than 7 days in the past, we return an error for the entire request and process no events." For `physical_store` (out of web scope): "you should upload transactions within 62 days of the conversion." No explicit future-dated window stated (no upper bound documented for `event_time` being in the future). | server-event.md; using-the-api.md |
| `user_data` | object | Required | Map of customer information parameters; see full sub-table below | server-event.md |
| `custom_data` | object | Optional | Business data about the event; see custom-data.md for the full standard-parameter table | server-event.md |
| `event_source_url` | string | Optional in the table, but: "The `event_source_url` is required for website events shared using the Conversions API." | "The browser URL where the event happened. The URL should match the verified domain." Whether the query string is included: not stated (gap). | server-event.md; parameters.md |
| `opt_out` | boolean | Optional | "A flag that indicates we should not use this event for ads delivery optimization. If set to `true`, we only use the event for attribution." | server-event.md |
| `event_id` | string | Optional (recommended) | "Any unique string chosen by the advertiser." Used with `event_name` for dedup; must match the Pixel `eventID` for the corresponding browser event. | server-event.md |
| `action_source` | string (enum) | Required | Full enum: `email`, `website`, `app`, `phone_call`, `chat`, `physical_store`, `system_generated`, `business_messaging`, `other`. "All action source values enable ad measurement and custom audience creation capabilities. All action sources enable ad optimization capabilities." (Contradicted by another page - see Contradictions and gaps.) | server-event.md |
| `data_processing_options` | array | Optional | "Current accepted value is `LDU` for Limited Data Use. An empty array can be sent to explicitly specify that this event shouldn't be processed with the Limited Data Use restrictions." | server-event.md |
| `data_processing_options_country` | integer | Required if `LDU` is set | `1` = United States, `0` = request Meta geolocate | server-event.md; marketing-api/overview/data-processing-options.md |
| `data_processing_options_state` | integer | Required in some cases (if `LDU` set and no IP address provided; or if country is set) | Per server-event.md: only `1000` (California) or `0` (geolocate) documented. Per the DPO reference page (more complete/current): `1000` California, `1001` Colorado, `1002` Connecticut, `1003` Florida, `1004` Oregon, `1005` Texas, `1006` Montana, `1007` Delaware, `1008` Nebraska, `1009` New Hampshire, `1010` New Jersey, `1011` Minnesota, `1012` Maryland, `1013` Rhode Island, or `0` to geolocate. See Contradictions. | server-event.md; marketing-api/overview/data-processing-options.md |
| `app_data` | object | Required for app events (out of web scope) | Contains `extinfo` and other app/device fields | server-event.md; parameters/app-data.md |
| `extinfo` | array (16 positional string/int64 fields) | Required for app events (out of web scope) | Positional, all values required in order, empty string placeholder if missing; `version` must be `a2` (Android) or `i2` (iOS) | server-event.md; app-data.md |
| `referrer_url` | string | Optional | "The HTTP referrer header as observed by the page triggering the Conversions API or Meta Pixel event. This is usually the preceding page in the browser." | server-event.md |
| `original_event_data` | object | Optional | "All metadata fields advertisers can use to specify how a 'delayed' event should be associated with a past acquisition event. We highly recommend using `original_event_data` when there's a delay..." Sub-keys: `event_name` (string, optional), `event_time` (integer, optional, GMT), `order_id` (string, optional), `event_id` (string, optional, recommended for dedup). | server-event.md; parameters/original-event.md |
| `customer_segmentation` | enum | Optional | Values: `new_customer_to_business`, `new_customer_to_business_line`, `new_customer_to_product_area`, `new_customer_to_medium`, `existing_customer_to_business`, `existing_customer_to_business_line`, `existing_customer_to_product_area`, `existing_customer_to_medium`, `customer_in_loyalty_program`. Note: the server-event.md table places this field under the server-event level, but its own example payload nests it inside `custom_data`. | server-event.md |
| `attribution_data` | object (beta, `AppendAttribution` event only) | Required (within that event type) | Sub-keys: `ad_id` (required, ID from ad click context), `touchpoint_ts` (required, seconds), `attribution_share` (required, 0-1), `attribution_value` (required, = `attribution_share` * value). "This API is in Beta with limited access." | guides/append-attribution/reference.md |
| `advanced_measurement_table` | - | - | Not found anywhere fetched | gap |
| `messaging_channel` | string | Out of web scope | Observed values in example payloads: `messenger`, `whatsapp`, `instagram` (no formal parameter table found) | business-messaging.md |
| `opt_out`, `data_processing_options*` examples | - | - | See Section 2/6 for full JSON examples | using-the-api.md |

`user_data` (Customer Information Parameters) full table:

| Parameter | Type | Hashing | Notes |
| --- | --- | --- | --- |
| `em` (Email) | string or list<string> | Required | Trim, lowercase, then SHA-256 |
| `ph` (Phone) | string or list<string> | Required | Strip symbols/letters/leading zeros; must include country code |
| `fn` (First name) | string or list<string> | Required | Lowercase Roman a-z recommended; UTF-8 if special chars |
| `ln` (Last name) | string or list<string> | Required | Same rules as `fn` |
| `ge` (Gender) | string or list<string> | Required | Single lowercase initial: `f` or `m` |
| `db` (Date of birth) | string or list<string> | Required | `YYYYMMDD` |
| `ct` (City) | string or list<string> | Required | Lowercase, no punctuation/spaces |
| `st` (State) | string or list<string> | Required | 2-char ANSI code (US), lowercase |
| `zp` (Zip) | string or list<string> | Required | Lowercase, no spaces/dash; first 5 digits for US |
| `country` | string or list<string> | Required | Lowercase ISO 3166-1 alpha-2 |
| `external_id` | string or list<string> | Recommended | Advertiser's own user ID; consistent format across channels |
| `client_ip_address` | string | Do not hash | Valid IPv4 or IPv6; "must never be hashed" |
| `client_user_agent` | string | Do not hash | "Required for website events shared using the Conversions API" |
| `fbc` (Click ID) | string | Do not hash | Format `fb.${subdomain_index}.${creation_time}.${fbclid}` |
| `fbp` (Browser ID) | string | Do not hash | Format `fb.${subdomain_index}.${creation_time}.${random_number}` |
| `subscription_id` | string | Do not hash | "Similar to the order ID for an individual product" |
| `fb_login_id` | integer | Do not hash | App-Scoped ID |
| `lead_id` | integer | Do not hash | ID from Meta Lead Ads |
| `anon_id` | string | Do not hash | App events only |
| `madid` | string | (not marked, listed "do not hash" in index page) | Android advertising ID / iOS IDFA |
| `page_id` | string | Do not hash | Messenger bot page ID |
| `page_scoped_user_id` | string | Do not hash | Messenger bot page-scoped user ID |
| `ctwa_clid` | string | Do not hash | Click-to-WhatsApp ID |
| `ig_account_id` | string | Do not hash | Instagram Account ID |
| `ig_sid` | string | Do not hash | Instagram-Scoped User ID |

Source for the full table: parameters/customer-information-parameters.md and parameters.md (index, matches the same hashing annotations).

Baseline matching-validity rule (best-practices.md): an event is invalid if its `user_data` contains only one of these combinations (or a subset): `ct + country + st + zp + ge + client_user_agent`; `db + client_user_agent`; `fn + ge`; `ln + ge`.

`custom_data` standard parameters: full three-column table (Website / App / Offline standard parameter names, which differ per surface, e.g. `value` vs `_valueToSum`) reproduced at parameters/custom-data.md; includes `currency` (required for purchase events, ISO 4217), `value` (required for purchase/value-optimization events), `content_ids`, `content_type`, `contents` (`id`, `quantity`, `item_price`, `delivery_category`), `delivery_category` (`in_store` | `curbside` | `home_delivery`), `order_id`, `num_items`, `search_string`, `predicted_ltv`, `net_revenue`, and many vertical-specific fields (travel, auto, real estate).

`fbc`/`fbp` format details (parameters/fbp-and-fbc.md):
- `fbc` value: `version.subdomainIndex.creationTime.fbclid` where `version` is always `fb`; `subdomainIndex` is `0` for `com`, `1` for `example.com`, `2` for `www.example.com` (use `1` if generating server-side without a saved cookie); `creationTime` is Unix epoch **milliseconds**. Recommended to set the `_fbc` cookie with a **90 days** expiration.
- `fbp` value: `version.subdomainIndex.creationTime.randomnumber`, same `version`/`subdomainIndex` rules, `randomnumber` generated by the Pixel SDK.
- Parameter Builder library appends an 8-character suffix to `fbc`/`fbp`/hashed fields: `fb.${subdomain_index}.${creation_time}.${fbclid}.${appendix}` - "a legacy appendix" of 2 characters exists for older SDK versions.

### 4. Deduplication (Pixel vs. Conversions API)

Two documented mechanisms, both from deduplicate-pixel-and-server-events.md and cross-confirmed in server-event.md / guides/end-to-end-implementation.md:

**A. `event_id` + `event_name` (recommended)**
- "For an event to be deduplicated: 1. In corresponding events, a Meta Pixel's `eventID` must match the Conversion API's `event_id`. 2. In corresponding events, a Meta Pixel's `event` must match the Conversion API's `event_name`."
- "If we find the same server key combination (`event_id` and `event_name`) and browser key combination (`eventID` and `event`) sent to the same Pixel ID within 48 hours, we discard the subsequent events."
- Tie-break: "If server and browser events do not differ meaningfully in their content, we generally prefer the event that is received first" (and per server-event.md, "If a server and browser/app event arrive at approximately the same time (that is, within 5 minutes of each other), we favor the browser/app event.")
- Pixel-side `eventID` is passed as the 4th argument to `fbq('track', ...)` or via the `eid` image-tag parameter.

**B. `fbp` or `external_id` (fallback)**
- Requires consistent `event_name` plus `fbp` and/or `external_id` on both channels.
- "Generally, it only works for deduplicating events sent first from the browser and then through the server. Server events will not be discarded if a browser event has not been received in the past 48 hours, even if an identical browser event arrives after the server event."
- "Does not deduplicate events when only using one event source, that is browser-only or server-only."
- `external_id`-vs-`fbp` precedence, from parameters/external-id.md: if an event includes `fbp` but not `external_id`, `fbp` is used as the external ID; if it has both, both are saved and `external_id` "is always favored, since it offers improved performance"; if only `external_id`, it is processed as a regular `external_id` event.

**`order_id`-based purchase dedup** (guides/end-to-end-implementation.md, access-limited): "This implementation is limited to select Meta partners. Contact your Meta representative for access." Works only on `custom_data.order_id` for purchase events; discards the second event with the same `order_id` if Meta resolves the same user completed both orders; deduplication window is "48 hours (recommended) or 28 days."

**`event_id` format requirement:** no fetched page states a required format (length, charset, UUID-ness) for `event_id` beyond "any unique string chosen by the advertiser" — examples used both order numbers (e.g. `"event.id.123"`) and free-form strings.

**CAPI-only events with an `event_id` and no matching Pixel event:** no page fetched states explicit behavior beyond the general rule that dedup only discards the *later*-received duplicate within the 48-hour window; a CAPI event with no matching Pixel counterpart within that window is implied (not explicitly stated) to simply be processed as a standalone event. Not explicitly documented; treated as a gap.

### 5. Responses

**Success response shape**, with a verbatim example (guides/end-to-end-implementation.md):

```
{
  "events_received": 1,
  "messages": [],
  "fbtrace_id": <FB-TRACE-ID>
}
```

Canonical Graph API return-type struct for `POST /{ads_pixel_id}/events` (marketing-api/reference/ads-pixel/events.md):

```
Struct {
  events_received: integer,
  messages: List[string],
  fbtrace_id: string,
}
```
(The reference page also lists three other, unrelated return-type structs as alternates for the same edge - applink/attribution-claims and a bare `{success: bool}` shape - which appear to belong to other, non-CAPI uses of the same `/events` edge name and are not explained further on that page.)

`messages` content: no page states example contents of a non-empty `messages` array; the only observed example shows it empty (`[]`). Not found.

**Error response shape**, from a verbatim example on marketing-api/error-reference.md:

```
{
  "error": {
    "type": "Exception",
    "message": "The budget for your Ad-Set is too low. It must be at least $1.00 per day.",
    "code": 1487901,
    "is_transient": false,
    "error_data": {
      "blame_field_specs": [
        ["daily_budget"]
      ]
    }
  }
}
```

`blame_field_specs`: "This is a property included in the `error_data` blob of any API call that results in a validation error, which indicates which field(s) is at fault for the validation error... an array, where each element of the array is a `blame_field_spec`... itself is an array also, which indicates the name of the field that is at fault and the location of this field within the overall API spec provided."

General Graph API error JSON shape (from WebFetch summary of docs/graph-api/guides/error-handling; not independently verified against raw markdown - see Contradictions):
```
{
  "error": {
    "message": "Message describing the error",
    "type": "OAuthException",
    "code": 190,
    "error_subcode": 460,
    "error_user_title": "A title",
    "error_user_msg": "A message",
    "fbtrace_id": "EJplcsCHuLu"
  }
}
```
Per that same summary: `message` = "a human-readable description of the error"; `error_subcode` = "additional information to this error"; `error_user_msg` = "the message displayed to the user" (locale-matched to the request); `error_user_title` = "the title of the dialog, if displayed" (locale-matched); `fbtrace_id` = "internal support ID" for debugging, "expires quickly."

Error codes documented specifically for `POST /{ads_pixel_id}/events` (marketing-api/reference/ads-pixel/events.md):

| Error Code | Description |
| --- | --- |
| 200 | Permissions error |
| 100 | Invalid parameter |
| 190 | Invalid OAuth 2.0 Access Token |

Broader Marketing API error code table (marketing-api/error-reference.md) - selected entries relevant to CAPI-style usage (full table is much longer and mostly ad-object-specific, not reproduced in full here since most entries concern campaign/ad-set/creative objects outside this task's scope):

| Code | Description |
| --- | --- |
| `-` (negative) | "Negative-value error codes are internal Facebook errors. Check `error_subcode` for the actual failure code." |
| `1` | An unknown error occurred. |
| `4` | Application request limit reached. |
| `10` | Application does not have permission for this action. |
| `17` | User request limit reached. |
| `100` | Invalid parameter. |
| `100`, subcode `33` | Unsupported post request (often an access-token/system-user permission issue). |
| `102` | Session key invalid or no longer valid. |
| `104` | Incorrect signature. |
| `190` | Invalid OAuth 2.0 Access Token. |
| `200` | Permission error. |
| `294` | Managing advertisements requires the extended permission `ads_management` and an allow-listed app. |
| `5000` | Unknown error code. |

"**Warning:** Error handling should be done using only the Error Codes. The Description string is subject to change without prior notice." (marketing-api/error-reference.md)

Rate-limit-specific error codes/messages (marketing-api/overview/rate-limiting.md):
- `17, Error subcode: 2446079, Message: User request limit reached.`
- `613, Error subcode: 1487742, Message: There have been too many calls from this ad-account. Please wait a bit and try again.`
- `613, Error subcode: 5044001, Message: Your ad account {ad_account_id} has exceeded the maximum allowed rate of mutation requests...`
- `4, Error subcode: 1504022 or 1504039, Message: There have been too many calls from this app. Wait a bit and try again.`
- `4, Message: Application request limit reached`
- `80000, 80003, 80004, 80014, Message: There have been too many calls from this ad-account. Wait a bit and try again...` (Business Use Case rate limits)
- `613, Error subcode: null, Message: (#613) Calls to this api have exceeded the rate limit.` (Abuse Prevention limit; distinguished by having no subcode)

**HTTP status codes:** only a generic statement is documented for CAPI - "If the event payload is valid, a `2xx HTTP` response code is returned. If invalid, a `4xx HTTP` response code is returned, with minimal error details in the response body." (support.md). No specific numeric codes are enumerated anywhere fetched for this API.

**Whole-batch vs. per-event rejection:** "If any event you send in a batch is invalid, we reject the entire batch." (using-the-api.md, under "Batch Requests"). No documented partial-success/partial-failure response shape (e.g. per-event error array) was found; the success response's `events_received` count and `messages` array are the only per-batch feedback documented.

**Transient vs. permanent errors:** the `is_transient` boolean field appears in the general error-reference.md example (`"is_transient": false`) but no page defines the semantics of `true` vs `false`, nor gives a `true` example. support.md gives operational guidance instead: "We recommend retrying the request in cases where the response indicates a non-client error, such as a timeout."

### 6. `test_event_code` and validation flow

- **Obtaining the code:** "The Test Events tool generates a test ID." Location: "go to `Events Manager > Data Sources > Your Pixel > Test Events`." (using-the-api.md)
- **What it does:** "Send the test ID as a `test_event_code` parameter to start seeing event activity appear in the Test Events window." (using-the-api.md)
- **Must be removed for production:** explicit warning, quoted in Section 2 above.
- **Test events are NOT dropped and ARE counted:** "Events sent with `test_event_code` are not dropped. They flow into Events Manager and are used for targeting and ads measurement purposes." (using-the-api.md)
- **Validity duration:** not documented anywhere fetched (gap, listed above).
- **What Test Events shows / can be used for** (best-practices.md): "Verify that you've set up your server events correctly and Meta has received them. Verify that you've deduplicated events correctly by seeing which events were processed and deduplicated. Debug any unusual activity."
- **`external_id` is explicitly NOT visible in Test Events:** "`external_id`s are not available in the Test Events tool." (parameters/external-id.md) - this directly contradicts an implicit expectation that all match keys would be visible there; flagged as a specific, sourced limitation rather than a cross-page contradiction.
- **Test Events vs. Overview tab** (verifying-setup.md): Overview shows "the number of events we received before they are deduplicated, discarded due to consent controls and other policies, or processed," plus a per-event "Connection Method" and drill-down sub-tabs: "Event Freshness" (average event delay, "Real Time to Weekly" scale) and "Event Deduplication" (two sub-metrics: "Rate of Events Deduplicated" and "Rate of Deduplication Key Usage"/"Overlap"). No separate "Diagnostics" tab is named for this core flow (gap, see Contradictions).
- **Verification timing:** "After you start sending events, you should be able to verify them within 20 minutes." (using-the-api.md; verifying-setup.md repeats "within 20 minutes after they were sent")
- **Event Match Quality (EMQ):** "scored from 1 to 10... we typically recommend that you aim for an Event Match Quality score of 6.0 or higher." Available "only for web events" (Currently); for other event types "contact your Meta representative." (verifying-setup.md; best-practices.md)
- **How to verify a setup, per Meta's own checklist** (verifying-setup.md headings): (1) Verifying that events are received correctly; (2) Verifying that events are being sent as close to real-time as possible (Event Freshness); (3) Verifying that events are deduplicated correctly (Event Deduplication rate/overlap); (4) Verifying that events are matched to users with high accuracy (Event Match Quality, or the Setup/Dataset Quality API at scale).

### 7. Payload Helper and other validation tools

- **Payload Helper:** "Fill out the required and recommended data parameter fields to see how your payload should be structured when it's sent to Facebook from your server." "Web, app, and physical store events shared using the Conversions API require specific parameters. The list of required parameters is available here [Parameters page]." It can generate a sample payload and includes a "Send to Test Events" action (tied to a Pixel ID) that routes into the Test Events tab. It also offers "Get Code" / "Generate Code" with Business SDK snippets in multiple languages. (docs/marketing-api/conversions-api/payload-helper; guides/end-to-end-implementation.md; parameters/fbp-and-fbc.md)
- **Parameter Builder library:** open-source client-side (JavaScript) and server-side (PHP, Java, Python, NodeJS, Ruby) SDKs that auto-generate/normalize `fbc`, `fbp`, `client_ip_address`, and the hashed `user_data` fields, appending an 8-character appendix (SDK version/incrementality/language) to processed values for Meta-side performance evaluation. (parameter-builder-library.md)
- **Setup Quality API / Dataset Quality API** (formerly "Integration Quality API"): programmatic, at-scale access to Event Match Quality and related metrics (event coverage, event deduplication rate, data freshness, "Additional Conversions Reported" metrics, added "as of May 28th, 2025"). Intended for partners/agencies managing many pixels. (dataset-quality-api.md; verifying-setup.md)
- **Pixel Helper Chrome Extension** and **Developer FAQ/Community Forum** are mentioned as general debugging resources but not described further. (support.md)
