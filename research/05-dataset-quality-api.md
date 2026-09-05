# Dataset Quality API - Research

## Sources

| URL | Format obtained | What it covers |
| --- | --- | --- |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api.md | `text/markdown` (HTTP 200) | Main Dataset Quality API doc: endpoint, parameters, `web{...}` fields, EMQ, ACR (all variants), event coverage, event deduplication, data freshness, setup/permissions, FAQs |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api/offline-events.md | `text/markdown` (HTTP 200) | Offline-events variant: `offline{...}` field, `composite`/`match_key`/`frequency`/`freshness` scores, error codes |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api/crm-events.md | `text/html` (HTTP 200, soft-404: `og:title` = "Seite nicht gefunden - Meta for Developers") | Page does not resolve despite being indexed in the ads-commerce `llms.txt`. See Contradictions. |
| https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api | `text/markdown` (HTTP 200) | Old-site URL; content is byte-for-byte identical to the new-site main page above |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel.md | `text/markdown` (HTTP 200) | Ads Pixel (dataset) node: full field list, edges, create/update/delete, error codes |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel/stats.md | `text/markdown` (HTTP 200) | `/{dataset_id}/stats` edge: `aggregation`, `start_time`, `end_time`, `event`, `event_source`, `agent` params |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel/events.md | `text/markdown` (HTTP 200) | `/{dataset_id}/events` edge: POST-only (send events), no GET/read support |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel/ads_signal_diagnostic_issues.md | `text/markdown` (HTTP 200) | `/{dataset_id}/ads_signal_diagnostic_issues` edge: params, response shape |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel/integration_quality.md | `text/markdown` (HTTP 200) | `/{dataset_id}/integration_quality` edge: params, response shape |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel/recent_events.md | `text/markdown` (HTTP 200) | `/{dataset_id}/recent_events` edge: params, response shape |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel/real_time_event_log.md | `text/markdown` (HTTP 200) | `/{dataset_id}/real_time_event_log` edge: params, response shape |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel/domain_last_fired_time.md | `text/markdown` (HTTP 200) | `/{dataset_id}/domain_last_fired_time` edge: params, response shape |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel/event_last_fired_time.md | `text/markdown` (HTTP 200) | `/{dataset_id}/event_last_fired_time` edge: params, response shape |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel/setup_quality.md | `text/markdown` (HTTP 200) | `/{dataset_id}/setup_quality` edge: params, response shape (returns same node type as `integration_quality`) |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/llms.txt | `text/plain` (HTTP 200) | Full Marketing API reference index; used to enumerate every Ads Pixel sub-page |
| https://developers.facebook.com/documentation/ads-commerce/llms.txt | `text/plain` (HTTP 200, previously fetched in this project) | Confirmed the exact 3 Dataset Quality API page paths, including `crm-events.md` |
| https://developers.facebook.com/docs/graph-api/reference/debug_token | `text/html` shell via curl (unusable - JS SPA shell); content extracted via WebFetch | `/debug_token` endpoint: path, method, `input_token` param, auth requirement, full response field list |
| https://developers.facebook.com/documentation/facebook-login/guides/access-tokens | `text/markdown` (HTTP 200) | Access token types (App, Client, Page, System User, User), system-user-token generation flow, long-lived token behavior |

## Findings

### 1. The real endpoint

The Dataset Quality API is **not** a nested edge on the dataset node. It is a **top-level Graph API node**, and the dataset is passed as a query parameter:

```
GET https://graph.facebook.com/v25.0/dataset_quality?dataset_id=<DATASET_ID>&access_token=<ACCESS_TOKEN>
```
Source: dataset-quality-api.md ("### Endpoint" section: `https://graph.facebook.com/v25.0/dataset_quality`).

`/{dataset_id}/dataset_quality` (the nested-edge form) is **not a valid path** - confirmed live (see Live probes, probe 2).

Version note: the main page's endpoint declaration and all its Graph API Explorer / cURL examples use `v25.0`. The offline-events sub-page's own "Endpoint" line and cURL example instead show `v23.0`, while its own Graph API Explorer example on the same page shows `v25.0` (see Contradictions).

### 2. Parameters (dataset_quality)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `dataset_id` | integer | Yes | The ID of the dataset (Pixel) to retrieve quality data for. |
| `access_token` | string | Yes | Valid (unexpired) access token for the given dataset (Pixel) ID; a long-lived system user access token is recommended. |
| `agent_name` | string | No | Normalized `partner_agent` value used to filter to events sent with that `partner_agent` in the `/{pixel_id}/events` POST. If omitted, all events (agent or not) are included in the EMQ calculation. Now optional (previously required). |
| `fields` | string (field-expansion syntax) | conditionally | Selects `web{...}` and/or `offline{...}` and their sub-fields; `web` is "required by default" per the doc wording. |

Source: dataset-quality-api.md "### Parameters" and "### Fields" tables; offline-events.md "### Parameters" table (identical `dataset_id`/`access_token`/`agent_name`).

There is **no documented `breakdowns` parameter** and **no `start_time`/`end_time`/date-range parameter** on `dataset_quality` itself. Date ranges and hourly breakdowns exist only on the separate `/{dataset_id}/stats` edge (see below).

### 3. Fields / metrics returned (web events)

| Field | Node type | Definition (doc wording) |
| --- | --- | --- |
| `web` | array | "Structured set of data related to website events... required by default in this API." |
| `event_name` | string | A standard or custom event name. |
| `event_match_quality` | `AdsPixelCAPIEMQ` | "Event Match Quality indicates how effective the customer information sent from your server may be at matching event instances to a Facebook account." |
| `event_potential_aly_acr_increase` | `AdsPixelCAPIEventALYACR` | ACR for Conversions API Event: "estimates how many conversions... are measured as a result of an advertiser's Conversions API setup." |
| `acr` | `AdsDatasetCAPIACR` | ACR: "helps you understand how much your business benefits from using the Conversions API alongside the Meta Pixel... can help you decrease your cost per result." |
| `event_coverage` | `AdsDatasetEventCoverage` | "7-day average percent of Pixel events that are covered by the Conversions API, and share deduplication keys with events from the Conversions API." |
| `dedup_key_feedback` (field table) / `dedupe_key_feedback` (all code examples) | `AdsDatasetDedupKeyFeedback` | "Deduplication key feedback helps to identify any active issues with deduplication." See Contradictions for the name mismatch. |
| `data_freshness` | `AdsDatasetDataFreshness` | "Tells you how current your data is... the delay between the time the event occurred and when Meta received it." |

Source: dataset-quality-api.md "### Fields" table and per-metric sections.

**EMQ detail** (event_match_quality): score out of 10 ("composite_score" in the response). "Calculated by looking at which customer information parameters are received from your server..., the quality of the information received, and the percent of event instances that are matched to a Meta account." Calculated **in real time**. Available **only for web events** ("For other event types such as offline and physical store events, app events, conversion leads or any integration under alpha or beta stages, contact your Meta representative"). Response includes `match_key_feedback[]` with `identifier` (e.g. `user_agent`, `external_id`, `email`, `ip_address`) and `coverage.percentage`. A separate `diagnostics[]` sub-field (via `event_match_quality{diagnostics}`) returns `name`, `description`, `solution`, `percentage`, `affected_event_count`, `total_event_count`. Source: dataset-quality-api.md sections "EMQ", "EMQ diagnostics".

**ACR (Additional Conversions Reported)**: "a metric that helps you understand how much your business benefits from using the Conversions API alongside the Meta Pixel." Response shape: `{description, percentage}`, e.g. `"In the last 7 days, you saw about 37.9% more conversions reported for Search events..."` - so this metric is computed over a **rolling 7-day window**. Four ACR variants exist: `acr` (main), `event_potential_aly_acr_increase` (per Conversions API event), `event_match_quality.match_key_feedback[].potential_aly_acr_increase` (per EMQ parameter), `event_coverage.potential_aly_acr_increase` (per event coverage). Source: dataset-quality-api.md, sections "ACR", "ACR for Conversions API Event", "ACR for EMQ parameters", "ACR for Event Coverage".

**Event coverage**: "7-day average percentage of Meta Pixel events that are covered by the Conversions API, and share deduplication keys with events from the Conversions API." Response: `{percentage, goal_percentage, description}`. Doc example: `goal_percentage: 75`. Source: dataset-quality-api.md "Event coverage" section.

**Event deduplication**: response `dedupe_key_feedback[]` with `dedupe_key` (e.g. `event_id`, `external_id`, `fbp`), `browser_events_with_dedupe_key.percentage`, `server_events_with_dedupe_key.percentage`, `overall_browser_coverage_from_dedupe_key.percentage` ("incremental for each dedupe key"). Source: dataset-quality-api.md "Event deduplication" section.

**Data freshness**: response `{upload_frequency, description}` where `upload_frequency` observed doc values are `real_time` and `hourly`. "Data freshness indicates the delay between the time the event occurred and when Meta received it. Best practice is to share your events in real time." Source: dataset-quality-api.md "Data freshness" section.

**No spend metric exists.** The word "spend" does not appear anywhere in dataset-quality-api.md or offline-events.md. The only cost-adjacent language is narrative, not a field: "More reported conversions can help you decrease your cost per result" (in the `acr` field description) and "lowering their cost per action" (in a linked Business Help Center article title, not part of the API). There is no `spend`, `ad_spend`, `cost_per_event`, `cpm`, or `cpc` field documented anywhere in the Dataset Quality API. Source: full-text grep of dataset-quality-api.md and offline-events.md (see Live probes section note).

### 4. Fields / metrics returned (offline events - beta)

| Field | Type | Definition |
| --- | --- | --- |
| `offline` | array | "Structured set of data related to offline events... required by default." |
| `event_name` | string | Standard or custom event name. |
| `composite` | float, `{score, recommendation}` | "Composite Data Quality Score for the offline events. To calculate the data quality score, we consider factors such as data freshness, frequency and attribution over the **last 28 days**. These factors, each weighted differently, combine to give a score out of 10. Note: A composite score of 8.5 or higher allows the access to use of omnichannel ads." |
| `match_key` | integer (score /10), `{score, recommendation, coverage: {email, phone}}` | "Recommendations on how to improve that score and also the match key coverage for both email and phone." |
| `frequency` | integer (score /10), `{score, recommendation}` | "How often you send data." |
| `freshness` | integer (score /10), `{score, recommendation}` | "How real time your data is." |

Source: offline-events.md "### Fields" table and example JSON.

Error codes documented specifically for offline-events dataset_quality: `2044055` "The dataset_id that was inputted doesn't exist", `10` "The application doesn't have permission for this action." Source: offline-events.md "## Error Codes".

### 5. crm-events.md - could not be verified

The URL `https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api/crm-events.md`, though indexed by name in the ads-commerce `llms.txt` index (`- [Dataset Quality API for CRM Events](.../crm-events.md): Dataset Quality API for CRM Events`), returns HTTP 200 with `Content-Type: text/html` whose `og:title` is `"Seite nicht gefunden - Meta for Developers"` ("Page not found"). Confirmed on three separate fetch attempts (with and without an explicit `Accept: text/markdown` header) and via WebFetch on the non-`.md` HTML variant, which returned only a truncated shell with no article content. No CRM-events-specific content could be retrieved. See Contradictions.

### 6. Setup requirements / permissions (as documented)

**User permission** (on the dataset/business): "The user or system user used to make the API call requires (at minimum) the following user permission: **Partial access -> Use events dataset**." Source: dataset-quality-api.md "#### User permission".

**App permission**:

| Tier | Requirement |
| --- | --- |
| Basic (small number of datasets / testing) | **ads_read** AND (**ads_management** OR **business_management**) |
| Advanced (high volume / higher rate limits) | Advanced level of **ads_management** app permission + app feature **Marketing API Access Tier** (formerly "Ads Management Standard Access" / "Advanced Access", now "Full Access"); requires App Review |

Source: dataset-quality-api.md "#### App permission".

**Token type**: "Valid (unexpired) access token for given dataset (Pixel) ID... **Set up a long-lived system user access token**." A dedicated FAQ states: "The [client system user access token] onboarding method is **not compatible with the EMQ API at the moment**" - referring specifically to a client-side (partner-onboarded) system user token distinct from the advertiser's own system user token. Source: dataset-quality-api.md "### Parameters" (`access_token` row) and "## FAQs".

**Ownership/access setup paths documented**: (1) Advertiser self-service via Business Suite - assign system user "Manage Pixel" permission on the pixel, then generate token; (2) Partner platform via Facebook Login for Business (recommended); (3) Partner via Meta Business Extension (beta); (4) Client shares Pixel to partner's Business Manager, partner assigns its own system user; (5) Client generates a token manually in Events Manager (this method explicitly grants both event-send and Dataset-Quality-API-read access, and requires an opt-in acceptance step for tokens generated before July 2025). Source: dataset-quality-api.md "### Ownership and access", "## FAQs".

### 7. Ads Pixel (dataset) node - GET /{dataset_id}

No parameters (aside from `fields`/`access_token`). Selected fields relevant to the assignment:

| Field | Type | Description |
| --- | --- | --- |
| `id` | numeric string | ID of the pixel (default field) |
| `name` | string | Name of the pixel |
| `creation_time` | datetime | Time at which the pixel was created |
| `last_fired_time` | datetime | Time at which the pixel was last fired |
| `data_use_setting` | enum | Setting to capture how pixel data should be used |
| `owner_business` | Business | ID of the business that owns this pixel, or null if unclaimed |
| `is_unavailable` | bool | Whether this pixel is unavailable |
| `is_crm` | bool | True if a pixel contains lead-gen data source config |
| `event_time_min` / `event_time_max` | integer | Earliest / latest entry timestamps for this dataset |
| `match_rate_approx` | int32 | Approximate match rate percentage for entries in this dataset |
| `valid_entries` / `matched_entries` / `duplicate_entries` | integer | Entry counts |

Full field list (30 fields) and error codes (200, 100, 80004, 368, 190, 2500) source: ads-pixel.md "## Reading" section.

Edges listed on the node itself: `assigned_users`, `da_checks`, `offline_event_uploads`, `openbridge_configurations`, `shared_agencies`, `stats`. The other edges investigated below (`events`, `ads_signal_diagnostic_issues`, `integration_quality`, `recent_events`, `real_time_event_log`, `domain_last_fired_time`, `event_last_fired_time`, `setup_quality`) exist as separate reference pages in the Marketing API reference index but are **not listed in the "Edges" table on the ads-pixel.md overview page itself** - they were only discoverable via the reference `llms.txt` index. See Contradictions.

### 8. Ads Pixel sub-endpoints

| Endpoint | Method | Params | Response shape | Notes |
| --- | --- | --- | --- | --- |
| `/{dataset_id}/stats` | GET | `aggregation` (enum: `browser_type`, `custom_data_field`, `device_os`, `device_type`, `event` [default], `host`, `match_keys`, `had_pii`, `pixel_fire`, `event_detection_method`, `url`, `event_value_count`, `url_by_rule`, `event_total_counts`, `event_source`, `event_processing_results`), `start_time`, `end_time` (default: request time; "data up to seven days from the request time"), `event` (required when `aggregation=custom_data_field`), `event_source` (`WEB_ONLY`/`SERVER_ONLY`), `agent` | `{"data": [AdsPixelStatsResult...], "paging": {}}` | No spend field documented. Cannot create/update/delete. |
| `/{dataset_id}/events` | POST only | `data` (required, JSON-encoded event list), `platforms`, `progress`, `test_event_code` | `{events_received, messages, fbtrace_id}` or various attribution structs | **No GET support** - "You can't perform this operation on this endpoint" under Reading. This is the event-send endpoint, not a listing endpoint. |
| `/{dataset_id}/ads_signal_diagnostic_issues` | GET | `ad_account_id` (int64, **required**) | `{"data": [AdsSignalDiagnosticIssue...], "paging": {}}` | |
| `/{dataset_id}/integration_quality` | GET | `agent_name`, `time_range` | `{"data": [AdsPixelCAPIIntegrationQuality...], "paging": {}}` | Doc description: "Conversions API events integration quality of the pixel" |
| `/{dataset_id}/setup_quality` | GET | `agent_name` | `{"data": [AdsPixelCAPIIntegrationQuality...], "paging": {}}` | Same underlying node type as `integration_quality`. Doc description: "Setup Quality exposes feedback on the given Pixel's Conversions API setup based on computed aggregated metrics... calculated based on previous events sent by the calling Partner." |
| `/{dataset_id}/recent_events` | GET | `event` (required), `lookback_window` (int64, required, seconds) | `{"data": [AdsPixelRecentEventsResult...], "paging": {}}` | |
| `/{dataset_id}/real_time_event_log` | GET | `start_time`, `end_time`, `limit` (default 100), `session_key`, `trace_id` | `{"data": [AdsPixelRealTimeEventLogResult...], "paging": {}}` | "Edge to read list of recent pixel fires for the logged in user" |
| `/{dataset_id}/domain_last_fired_time` | GET | `domain_name_list` (array, required) | `{"data": [AdsPixelDomainLastFiredTime...], "paging": {}}` | |
| `/{dataset_id}/event_last_fired_time` | GET | `event` (string, optional) | `{"data": [AdsPixelEventLastFiredTime...], "paging": {}}` | |

Sources: sub-stats.md, sub-events.md, sub-adsdiag.md, sub-integquality.md, sub-setupquality.md, sub-recentevents.md, sub-rtel.md, sub-domainlastfired.md, sub-eventlastfired.md (all URLs listed in Sources table).

All GET edges above are documented as returning the standard `{"data": [...], "paging": {}}` shape and therefore support standard Graph API cursor pagination (per the linked "Graph API guide" paging reference in each page). `dataset_quality` itself does **not** use this `data`/`paging` shape - it returns a flat object keyed by `web`/`offline` (see section 1-4 above), so no pagination is documented for it.

### 9. debug_token reference (via WebFetch, curl returned unusable SPA shell)

- Path: `/debug_token`, Method: `GET`, API version referenced in the doc: `v26.0`.
- Required parameter: `input_token` (string) - "the access token being examined" (translated from German source).
- Auth requirement: "an app token, or a user access token of an app developer for the app associated with `input_token`."
- Response fields: `app_id`, `application`, `is_valid`, `issued_at`, `expires_at`, `data_access_expires_at`, `user_id`, `scopes` (string[]), `granular_scopes` (object[]), `profile_id`, `metadata`, `error`.

Source: https://developers.facebook.com/docs/graph-api/reference/debug_token (content extracted via WebFetch since curl returned only an unrendered SPA shell).

### 10. Access token types (system user relevance)

| Type | Relevant properties |
| --- | --- |
| System User Access Token | "Let your app perform programmatic, automated actions on Ad objects or Pages without requiring input from an app user or re-authentication." Admin system users get full access to all business-portfolio assets by default; Employee system users must be individually granted access to each asset. |
| Long-lived tokens | "Apps with Standard access to the Marketing API receive long-lived tokens that do not expire based on time... This also applies to access tokens for System Users in Business Manager." |

Source: access-tokens-doc.md, "System User Access Tokens" and "Short-lived and long-lived tokens" sections.

## Live probes

Graph API version used: `v25.0` (the version named throughout dataset-quality-api.md and ads-pixel.md; one additional probe repeated the call on `v23.0` since offline-events.md names that version for its own endpoint declaration). Dataset ID used: `1202835294532393` (from `DATASET-ID` in `.env.local`). Token used: from `META-CAPI-TOKEN` in `.env.local`, redacted as `<TOKEN>` below. All requests sent with `-A "MetaCapiHarness/0.1 (claude-sonnet-5) curl/8"`. No POST requests were sent.

**Probe 1** - `GET https://graph.facebook.com/v25.0/1202835294532393?fields=id,name,creation_time,last_fired_time,data_use_setting,owner_business&access_token=<TOKEN>`
Status: `400`
```json
{"error":{"message":"(#100) Missing Permission","type":"OAuthException","code":100,"fbtrace_id":"Al13HpGRHUsvT173DQBzZ5j"}}
```

**Probe 1b** - same call without `owner_business` field: `GET https://graph.facebook.com/v25.0/1202835294532393?fields=id,name,creation_time,last_fired_time,data_use_setting&access_token=<TOKEN>`
Status: `400`
```json
{"error":{"message":"(#100) Missing Permission","type":"OAuthException","code":100,"fbtrace_id":"ARIWNWBGf6BuyHVGB3eoeeB"}}
```

**Probe 1c** - minimal fields: `GET https://graph.facebook.com/v25.0/1202835294532393?fields=id,name&access_token=<TOKEN>`
Status: `400`
```json
{"error":{"message":"(#100) Missing Permission","type":"OAuthException","code":100,"fbtrace_id":"AJrOhNdttLXz7zcacVrHQ-x"}}
```

**Probe 1d** - no `fields` param (default fields): `GET https://graph.facebook.com/v25.0/1202835294532393?access_token=<TOKEN>`
Status: `400`
```json
{"error":{"message":"(#100) Missing Permission","type":"OAuthException","code":100,"fbtrace_id":"AGlYIVd_rBcZpczYDTBZRuU"}}
```

**Probe 2** - nested-edge form (the form the task said was "reported as refused"): `GET https://graph.facebook.com/v25.0/1202835294532393/dataset_quality?access_token=<TOKEN>`
Status: `400`
```json
{"error":{"message":"Unknown path components: \/dataset_quality","type":"OAuthException","code":2500,"fbtrace_id":"APiTc4L_xmmbXiNQTQBaukg"}}
```
This confirms the nested-edge path is structurally invalid (error 2500, "Unknown path components"), not a permissions rejection.

**Probe 2b** - documented top-level form: `GET https://graph.facebook.com/v25.0/dataset_quality?dataset_id=1202835294532393&access_token=<TOKEN>`
Status: `200`
```json
{}
```

**Probe 2c** - with explicit `fields=web{event_match_quality,event_name}`:
Status: `200`
```json
{}
```

**Probe 2d** - `fields=web` (no sub-selector):
Status: `200`
```json
{}
```

**Probe 2e** - `fields=offline`:
Status: `200`
```json
{}
```

**Probe 2f** - no `fields` param at all:
Status: `200`
```json
{}
```

**Probe 2g** - repeated on `v23.0` (the version offline-events.md names for its own endpoint), `fields=web{event_name,event_match_quality}`:
Status: `200`
```json
{}
```

**Probe 2h** - `fields=web{event_name}`:
Status: `200`
```json
{}
```

All seven variants of the `dataset_quality` call return HTTP 200 with an empty JSON object regardless of `fields` value or API version - the call is authorized but yields no data (see Contradictions/gaps for interpretation).

**Probe 3** - `GET https://graph.facebook.com/v25.0/1202835294532393/stats?aggregation=event&access_token=<TOKEN>`
Status: `400`
```json
{"error":{"message":"(#100) Missing Permission","type":"OAuthException","code":100,"fbtrace_id":"AsMX5DqOqX8Syk0lrJORiIp"}}
```

**Probe 4** - `GET https://graph.facebook.com/v25.0/1202835294532393/ads_signal_diagnostic_issues?access_token=<TOKEN>`
Status: `400`
```json
{"error":{"message":"(#100) Missing Permission","type":"OAuthException","code":100,"fbtrace_id":"AWIlmbpDOXpOAHQ2n1tMrd9"}}
```

**Probe 5** - `GET https://graph.facebook.com/v25.0/debug_token?input_token=<TOKEN>&access_token=<TOKEN>`
Status: `200`
```json
{"data":{"app_id":"2035997890260603","type":"SYSTEM_USER","application":"Conversions API Application","data_access_expires_at":0,"expires_at":0,"is_valid":true,"issued_at":1788608891,"scopes":["read_ads_dataset_quality"],"granular_scopes":[{"scope":"read_ads_dataset_quality","target_ids":["1202835294532393"]}],"user_id":"122190966536828574"}}
```

**Probe 6** - `GET https://graph.facebook.com/v25.0/me?access_token=<TOKEN>`
Status: `200`
```json
{"id":"122190966536828574"}
```

## Contradictions and gaps

- **`crm-events.md` does not resolve.** The URL is indexed by name in `https://developers.facebook.com/documentation/ads-commerce/llms.txt` (`- [Dataset Quality API for CRM Events](.../dataset-quality-api/crm-events.md): Dataset Quality API for CRM Events`), but every fetch of that exact URL (three attempts, with and without an `Accept: text/markdown` header, plus a WebFetch of the non-`.md` HTML variant) returns HTTP 200 whose title is `"Seite nicht gefunden - Meta for Developers"` ("Page not found"). No CRM-events-specific documentation could be retrieved from this path. Source: https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api/crm-events.md (live fetch, this session).

- **Field name mismatch inside dataset-quality-api.md itself.** The `### Fields` table names the field `dedup_key_feedback`, but every code example and JSON response sample in the "Event deduplication" section uses `dedupe_key_feedback` (with an extra "e"). Source: https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api.md, compare the "### Fields" table row (`dedup_key_feedback`) against the "## Event deduplication" section's `fields=web{dedupe_key_feedback{...}` examples and JSON response (`"dedupe_key_feedback": [...]`).

- **API version mismatch inside offline-events.md itself.** Its "### API Call" section states the endpoint as `https://graph.facebook.com/v23.0/dataset_quality` and its cURL example also targets `v23.0`, but the Graph API Explorer example directly above it in the same "### Example" block uses `v25.0` (`GET/v25.0/dataset_quality?dataset_id=...`), and a later example in the same file uses `v23.0` again. Source: https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api/offline-events.md, "### API Call" and "### Example" sections. Live probes (2b vs 2g) show both versions behave identically for this account, so the discrepancy is documentation drift, not a functional difference.

- **Terminology skew between the two Dataset Quality pages.** dataset-quality-api.md (main) has been updated to the current tier naming ("Marketing API Access Tier" / "Limited Access" / "Full Access", with the 500-call-in-15-days threshold banner). offline-events.md still uses the older naming ("Advanced Level of the ads_management app permission and app feature **Ads Management Standard Access**"), not yet updated to match the main page's own "What's new" banner. Sources: https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api.md vs https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api/offline-events.md, "#### App permission" sections.

- **No `owner_business`, `data_use_setting` etc. could be verified live** - the token cannot read the Ads Pixel node at all (Probes 1, 1b, 1c, 1d all return error 100 "Missing Permission", even for the single field `id`). The doc-only field list in Findings section 7 is therefore unverified against this account.

- **The token's actual OAuth scope is not the scope named in the Dataset Quality API doc's "App permission" section.** dataset-quality-api.md states Basic access requires **ads_read** AND (**ads_management** OR **business_management**) (source: dataset-quality-api.md, "#### App permission"). The live `debug_token` response (Probe 5) instead shows a single scope, `read_ads_dataset_quality`, granularly restricted to `target_ids: ["1202835294532393"]` (this exact dataset) - not `ads_read`, `ads_management`, or `business_management`. This scope name does not appear anywhere in any of the fetched documentation pages (grepped across all pages listed in Sources). This is consistent with the "Client generates token manually using Events Manager" onboarding path described in dataset-quality-api.md, which is documented only in prose ("the generated token will be able to fetch quality data and send events using the Conversions API") without naming the underlying OAuth scope - i.e., the doc describes the UX flow but never names the scope it grants, so the scope-name-to-flow mapping is unconfirmed from documentation, only inferred from the live probe.

- **This explains the split probe results**: with only `read_ads_dataset_quality` scoped to this one dataset, the token is accepted (HTTP 200) by `/dataset_quality?dataset_id=...` (Probes 2b-2h) but rejected (HTTP 400, error 100) by every other endpoint tested that requires broader Ads-management-style access: the Ads Pixel node itself (Probes 1-1d), `/{dataset_id}/stats` (Probe 3), and `/{dataset_id}/ads_signal_diagnostic_issues` (Probe 4). `ads_signal_diagnostic_issues` additionally requires an `ad_account_id` parameter (source: sub-adsdiag.md) that was not supplied in Probe 4, so that probe's 400 cannot be fully attributed to the permission error alone; however the error body itself reads "Missing Permission," which is the same error code/message as the Pixel-node and stats failures.

- **`/dataset_quality` returns `{}` for every field/version combination tried (Probes 2b-2h)**, despite HTTP 200 (i.e., authorized). Documentation does not state what an empty response means for this endpoint (no "no data available" case is documented in dataset-quality-api.md or offline-events.md). Two explanations are consistent with the data gathered but neither is confirmed by any fetched doc: either this dataset currently has no events/CAPI activity to compute quality metrics from, or the `web`/`offline` default-field behavior described in the docs ("This field is required by default in this API") does not trigger automatically as documented when no explicit sub-selector matches data. No documentation page states which.

- **No edges list on the ads-pixel.md overview page matches the sub-pages actually indexed.** ads-pixel.md's own "#### Edges" table lists only 6 edges (`assigned_users`, `da_checks`, `offline_event_uploads`, `openbridge_configurations`, `shared_agencies`, `stats`). The other 8 edges investigated per the assignment (`ads_signal_diagnostic_issues`, `integration_quality`, `setup_quality`, `recent_events`, `real_time_event_log`, `domain_last_fired_time`, `event_last_fired_time`, `events`) exist as separate, individually fetchable reference pages (confirmed live, all HTTP 200) but are not cross-linked from the parent node's own overview page. Sources: https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ads-pixel.md ("#### Edges" table) vs. https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/llms.txt (full sub-page listing).

- **No spend or cost-per-event metric exists in the Dataset Quality API.** Full-text search of dataset-quality-api.md and offline-events.md finds no `spend`, `ad_spend`, `cost_per_event`, `cpm`, or `cpc` field. The only cost-adjacent text is narrative framing inside the `acr` field's description ("can help you decrease your cost per result") and an external Business Help Center article title ("lowering their cost per action") - neither is a returned field or metric of this API. Source: dataset-quality-api.md, `acr` field description in "### Fields" table and "## Additional Conversions Reported (ACR)" section; no spend-bearing field exists anywhere else in the fetched documentation.
