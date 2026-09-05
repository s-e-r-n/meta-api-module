# Customer Information, Hashing/Normalization, and Consent (EU/CH) — Meta Conversions API

Scope: web only, `action_source: website`, audience in Switzerland and the EU.

## Sources

| URL | Format obtained | What it covers |
| --- | --- | --- |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters.md | markdown | Full `user_data` parameter reference table: type, hashing rule, normalization, examples with SHA-256 outputs |
| https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters | markdown | Old-site URL — byte-for-byte identical content to the row above (verified with `diff`) |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/external-id.md | markdown | `external_id` semantics, multi-channel consistency, `fbp`-as-fallback table |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc.md | markdown | `fbc`/`fbp` exact formats, how to build `fbc` from `fbclid`, cookie storage guidance |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library.md | markdown | Parameter Builder Library (PBL) overview, supported parameters, the appendix suffix format, best practices |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library/get-started.md | markdown | PBL cookie-interaction rules and explicit cookie-consent integration requirement |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library/workflow-and-examples.md | markdown | PBL client/server workflow, repeats the cookie-consent requirement before calling cookie-writing APIs |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/data-processing-options.md | markdown | Data Processing Options / Limited Data Use (LDU) — titled "Data Processing Options for US Users" |
| https://developers.facebook.com/docs/marketing-apis/data-processing-options | markdown | Old-site URL attempt — redirected/served identical content to the row above (449 lines, identical to new-site doc) |
| https://developers.facebook.com/docs/marketing-api/data-processing-options | HTTP 404 (html) | Assignment-suggested old-site URL does not exist (singular "marketing-api", no trailing content) |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event.md | markdown | Server event parameters: `opt_out`, `data_processing_options*`, `action_source` enum, `event_id`/dedup |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events.md | markdown | Event dedup mechanics (`event_id`/`event_name`, `fbp`/`external_id` fallback, 48-hour window) |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/main-body.md | markdown | `data`, `test_event_code` |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters.md | markdown | Full parameter index with per-key hash requirement, required-for-website-events statement |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api.md | markdown | Conversions API overview |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/using-the-api.md | markdown | Hashing note (SDK hashes for you, otherwise you must), batch/dropped-events behavior |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/get-started.md | markdown | Prerequisites; no consent-specific content found |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/end-to-end-implementation.md | markdown | "General consent" section: reuse Pixel consent logic for Conversions API |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/verifying-setup.md | markdown | Events Manager overview mentions events "discarded due to consent controls and other policies" |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/payload-helper.md | markdown | Stub/pointer page only |
| https://developers.facebook.com/documentation/ads-commerce/llms.txt | text/plain | Ads & Commerce doc index — searched for GDPR/consent/Switzerland pages, none indexed there |
| https://developers.facebook.com/llms.txt | text/plain | Root llms.txt index |
| https://developers.facebook.com/docs/meta-pixel/implementation/gdpr | markdown | Pixel GDPR page: `fbq('consent','revoke'/'grant')` API, cookie policy pointer, data types received |
| https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching | markdown | Client-side Advanced Matching reference table, confirms Pixel accepts **unhashed lowercase** or hashed SHA-256 email |
| https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices | markdown | Required/recommended parameters for website events, "baseline requirements for matching" (invalid parameter-combination list), EMQ pointer, high-quality-parameter list |
| https://developers.facebook.com/docs/privacy | markdown | "Cookie Consent Resource" — Meta's own guide to GDPR/ePrivacy cookie-consent requirements for EU |
| https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/app-data.md | markdown | Confirms `anon_id`/`madid` are not documented on this page (they live only on the customer-information-parameters page, flagged app-events-only there) |
| https://www.facebook.com/business/help/611774685654668 | html (title only; body not extractable via curl or WebFetch — JS-rendered SPA) | **Resolves to "Advanced Matching for Web," not "Event Match Quality"** — see Contradictions |
| https://www.facebook.com/business/help/765081237991954 (fetched via `web.archive.org/web/20251116200602/`) | html, Wayback Machine snapshot dated 2025-11-16 (live page is a JS-only SPA; curl and WebFetch return only the page title) | "About Event Match Quality": scoring 0–10, 48-hour scoring window, parameter priority table (High/Medium/Low) |
| https://www.facebook.com/business/help/1151133471911882 (via `web.archive.org/web/20260619110146/`) | html, Wayback Machine snapshot dated 2026-06-19 | "About Limited Data Use": confirms LDU addresses **US state** privacy laws only; California/Colorado/Global Privacy Control mentioned; no EU/Switzerland reference |
| https://www.facebook.com/business/gdpr (via `web.archive.org/web/20240624045137/`) | html, Wayback Machine snapshot dated 2024-06-24 | Meta's GDPR microsite: legal bases, Controller vs Processor roles, EEA data transfers, Privacy Shield note |
| https://www.facebook.com/business/help/225009134722945 (via `web.archive.org/web/20200615160932/`) | html, Wayback Machine snapshot dated 2020-06-15 | Old "How does GDPR affect advertising on Facebook?" — text matches `docs/meta-pixel/implementation/gdpr` almost verbatim |
| https://www.facebook.com/legal/technology_terms (via `web.archive.org/web/20260210183521/`) | html, Wayback Machine snapshot dated 2026-02-10 | Meta Business Tools Terms: Contact Information hashing obligation, GDPR joint-controller clause, **Switzerland explicitly listed** alongside EU/EEA/UK territory, EU consent requirement for cookies, 2-year Event Data retention cap |
| https://www.facebook.com/business/help/471978536642445 (via `web.archive.org/web/20240721024850/`) | html, Wayback Machine snapshot dated 2024-07-21 | "About cookie settings for Meta Pixel": first-party vs third-party cookie explanation; no `_fbp`/`_fbc` names or explicit lifetimes stated on this particular page |
| https://www.facebook.com/business/help/823677331451951 (dedup help) | html, content not extractable (curl and Wayback Machine both returned an empty/near-empty SPA shell) | Not usable — see Contradictions and gaps |
| https://www.facebook.com/business/help/2041148702652965 (About Conversions API) | html, content not extractable (same SPA-shell issue) | Not usable |
| https://www.facebook.com/business/m/privacy-and-data | html, content not extractable ("Transparency Center" SPA shell) | Not usable |

Note on method: `curl -sL -A "MetaCapiHarness/0.1 (claude-sonnet-5) curl/8"` against `developers.facebook.com` reliably returns `text/markdown`. The same technique against `www.facebook.com/business/help/...` and `www.facebook.com/legal/...` returns only an HTML shell with the page `<title>` populated but no body text (a client-rendered SPA) — WebFetch was tried per the assignment's fallback rule and also could not extract body content for these pages. For the Business Help Center / legal pages that the assignment explicitly asks for, `web.archive.org` (Wayback Machine) snapshots of the same official Meta URLs, fetched with the same curl/User-Agent, were used instead, since they preserve a server-rendered capture of the actual page text. Snapshot timestamps are given for every such source above; content may have since changed on the live page.

## Findings

### 1. `user_data` parameters (Customer Information Parameters page)

All rows from https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters.md unless noted.

| Key | Type | Hashing | Normalization (quoted from the doc) | Example (input → normalized → SHA-256) |
| --- | --- | --- | --- | --- |
| `em` (Email) | string or list\<string\> | **Hashing required.** | "Trim any leading and trailing spaces. Convert all characters to lowercase." | `John_Smith@gmail.com` → `john_smith@gmail.com` → `62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f` |
| `ph` (Phone Number) | string or list\<string\> | **Hashing required.** | "Remove symbols, letters, and any leading zeros. Phone numbers must include a country code to be used for matching (e.g., the number 1 must precede a phone number in the United States). Always include the country code as part of your customers' phone numbers, even if all of your data is from the same country." | US `(650)555-1212` → `16505551212` → `e323ec626319ca94ee8bff2e4c87cf613be6ea19919ed1364124e16807ab3176` |
| `fn` (First Name) | string or list\<string\> | **Hashing required.** | "Using Roman alphabet a-z characters is recommended. Lowercase only with no punctuation. If using special characters, the text must be encoded in UTF-8 format." | `Mary` → `mary` → `6915771be1c5aa0c886870b6951b03d7eafc121fea0e80a5ea83beb7c449f4ec`; also shows `정` (UTF-8 as-is) → `8fa8cd9c440be61d0151429310034083132b35975c4bea67fdd74158eb51db14`; and `Valéry` → `valéry` (accent preserved, only case changed) → `08e1996b5dd49e62a4b4c010d44e4345592a863bb9f8e3976219bac29417149c` |
| `ln` (Last Name) | string or list\<string\> | **Hashing required.** | Same rule as `fn`: "See First Name (`fn`) for examples." | — |
| `db` (Date of Birth) | string or list\<string\> | **Hashing required.** | "We accept the YYYYMMDD format accommodating a range of month, day and year combinations, with or without punctuation. Year: Use the YYYY format from 1900 to current year. Month: Use the MM format: 01 to 12. Date: Use the DD format: 01 to 31." | `2/16/1997` → `19970216` → `01acdbf6ec7b4f478a225f1a246e5d6767eeab1a7ffa17f025265b5b94f40f0c` |
| `ge` (Gender) | string or list\<string\> | **Hashing required.** | "We accept gender in the form of an initial in lowercase." Examples: "f for female", "m for male" | no worked hash example given |
| `ct` (City) | string or list\<string\> | **Hashing required.** | "Using Roman alphabet a-z characters is recommended. Lowercase only with no punctuation, no special characters, and no spaces. If using special characters, the text must be encoded in UTF-8 format." | examples: `paris`, `london`, `newyork` |
| `st` (State) | string or list\<string\> | **Hashing required.** | "Use the 2-character ANSI abbreviation code in lowercase. Normalize states outside the U.S. in lowercase with no punctuation, no special characters, and no spaces." | examples: `az`, `ca` |
| `zp` (Zip Code) | string or list\<string\> | **Hashing required.** | "Use lowercase with no spaces and no dash. Use only the first 5 digits for U.S. zip codes. Use the area, district, and sector format for the UK." | US `94035`; Australia `1987`; France `75018`; UK `m11ae` |
| `country` | string or list\<string\> | **Hashing required.** | "Use the lowercase, 2-letter country codes in ISO 3166-1 alpha-2. Important Note: Always include your customers' countries even if all of your country codes are from the same country." | `United States` → `us` → `79adb2a2fce5c6ba215fe5f27f532d4e7edbac4b6a5e09e1ef3a08084a904621` |
| `external_id` | string or list\<string\> | **Hashing recommended** (not required). | "Any unique ID from the advertiser, such as loyalty membership IDs, user IDs, and external cookie IDs. You can send one or more external IDs for a given event. If an External ID is being sent via other channels, it should be in the same format as when sent via the Conversions API." | — |
| `client_ip_address` | string | **Do not hash.** | "The IP address of the browser corresponding to the event must be a valid IPV4 or IPV6 address. IPV6 is preferable over IPV4 for IPV6-enabled users. The `client_ip_address` user data parameter must never be hashed. No spaces should be included. Always provide the real IP address to ensure accurate event reporting." | IPv4 `168.212.226.204`; IPv6 `2001:0db8:85a3:0000:0000:8a2e:0370:7334` |
| `client_user_agent` | string | **Do not hash.** | "The user agent for the browser corresponding to the event. The `client_user_agent` is required for website events shared using the Conversions API." | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36` |
| `fbc` (Click ID) | string | **Do not hash.** | Format: `fb.${subdomain_index}.${creation_time}.${fbclid}` — see section 2 below | `fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890` |
| `fbp` (Browser ID) | string | **Do not hash.** | Format: `fb.${subdomain_index}.${creation_time}.${random_number}` — see section 2 below | `fb.1.1596403881668.1116446470` |
| `subscription_id` | string | **Do not hash.** | "The subscription ID for the user in this transaction; it is similar to the order ID for an individual product." | — |
| `fb_login_id` | integer | **Do not hash.** | "The ID issued by Meta when a person first logs into an instance of an app. This is also known as App-Scoped ID." | — |
| `lead_id` | integer | **Do not hash.** | "The ID associated with a lead generated by Meta's Lead Ads." | — |
| `anon_id` | string | **Do not hash.** | "Your install ID. This field represents unique application installation instances." Note: "This parameter is for app events only." | not applicable to this project (web only) |
| `madid` | string | not stated as "do not hash" in the table (row lacks the "Do not hash" label present on neighboring rows) | "Your mobile advertiser ID, the advertising ID from an Android device or the Advertising Identifier (IDFA) from an Apple device." | not applicable to this project (web only, mobile-only field) |
| `page_id` | string | **Do not hash.** | "Your Page ID. Specifies the page ID associated with the event. Use the Facebook page ID of the page associated with the bot." | messaging-specific, not applicable to web |
| `page_scoped_user_id` | string | **Do not hash.** | "Specifies the page-scoped user ID associated with the messenger bot that logs the event." | messaging-specific |
| `ctwa_clid` | string | **Do not hash.** | "Click ID generated by Meta for ads that click to WhatsApp." | messaging-specific |
| `ig_account_id` | string | **Do not hash.** | Instagram Account ID associated with the business. | messaging-specific |
| `ig_sid` | string | **Do not hash.** | "Users who interact with Instagram are identified by Instagram-Scoped User IDs (IGSID)." | messaging-specific |

Source for the whole table: https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters.md (identical text also served at https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters).

The parameter index page repeats the hash/no-hash classification for every key: https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters.md

Hash output format: every worked SHA-256 example in the doc is a 64-character lowercase hexadecimal string (standard SHA-256 hex digest). The doc does not contain a separate sentence stating "output must be lowercase hex" — this is only demonstrable from the examples themselves (source: same customer-information-parameters.md page).

Case sensitivity of hashing: not stated as a general rule in this doc. The doc's own normalization steps force lowercase on `em`, `fn`, `ln`, `ct`, `st`, `country`, `ge` before hashing, which removes case ambiguity for those keys. The only explicit "case sensitive" statement found anywhere in the fetched pages concerns the `fbclid`/`fbc` value, not the hashed PII fields (see section 2). Source: https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc.md

### Does Meta hash contact information server-side if sent unhashed?

Two different behaviors depending on channel, per the Meta Business Tools Terms (https://www.facebook.com/legal/technology_terms, Wayback snapshot 2026-02-10):

> "We will hash Contact Information that you send to us via a Meta JavaScript pixel for matching purposes prior to transmission. When using a Meta image pixel or other Meta Business Tools, you or your service provider must hash Contact Information in a manner specified by us before transmission, unless otherwise expressly directed or specified in product documentation."

This matches the client-side Advanced Matching doc (https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching):

> `fbq('init', '283859598862258', { em: 'email@email.com', ... })` — "Values will be hashed automatically by the pixel using SHA-256" and "We accept both lowercase unhashed and normalized SHA-256 hashed email addresses in your function calls."

The Conversions API "Using the API" page confirms the server side does **not** do this for you unless you use Meta's own SDK:

> "Please check our customer information parameters page to see which parameters should be hashed before they are sent to Facebook. If you are using one of our Business SDKs, the hashing is done for you by the SDK." — https://developers.facebook.com/documentation/ads-commerce/conversions-api/using-the-api.md

Conclusion for this project (web, server-side Conversions API calls, no browser Pixel JS SDK auto-hash path): you must hash `em`, `ph`, `fn`, `ln`, `db`, `ge`, `ct`, `st`, `zp`, `country` yourself (or via the Business SDK/Parameter Builder Library) before every Conversions API call — Meta's servers do not hash unhashed Contact Information sent through the raw Conversions API endpoint.

### Required / recommended parameters for `action_source: website`

Source: https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices and https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters.md

| Parameter | Category | Requirement |
| --- | --- | --- |
| `action_source` | Server event | **Required, all events.** |
| `event_source_url` | Server event | **Required, all website events.** |
| `client_user_agent` | Customer information | **Required, all website events.** |
| `event_name`, `event_time`, `user_data` | Server event | **Required** (from server-event.md, all events) |
| `external_id`, `event_id` | — | Best practices doc: "Also include the `external_id` and `event_id` event parameters for all events." (recommended, not listed as strictly required) |

"By using the Conversions API, you agree that the `action_source` parameter is accurate to the best of your knowledge." — https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event.md

`action_source` allowed values (server-event.md): `email`, `website`, `app`, `phone_call`, `chat`, `physical_store`, `system_generated`, `business_messaging`, `other`.

### Baseline requirements for matching (invalid parameter combinations)

Source: https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices

> "An event is considered invalid if it only includes customer information parameters that consist of one of the following combinations, (or a subset thereof)."
- `ct` + `country` + `st` + `zp` + `ge` + `client_user_agent`
- `db` + `client_user_agent`
- `fn` + `ge`
- `ln` + `ge`

### Event Match Quality (EMQ) — which keys weigh most

Two different Meta sources give two different priority lists; both are quoted verbatim (see Contradictions section).

**Best Practices page** (https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices):
> "Examples of high-quality customer information parameters include: email address (`em`); IP address (`client_ip_address`); name (`fn` and `ln`); phone number (`ph`)."

**Business Help Center "About Event Match Quality"** (https://www.facebook.com/business/help/765081237991954, Wayback snapshot 2025-11-16) — full priority table:

| Parameter | Priority |
| --- | --- |
| Email | High |
| Click ID (`fbc`) | High |
| Facebook Login ID | Medium |
| Birthdate | Medium |
| Country | Medium |
| Phone number | Medium |
| External ID | Medium |
| Browser ID (`fbp`) | Medium |
| Lead | Low |
| First name | Low |
| Last name | Low |
| City | Low |
| Zip or Postal Code | Low |

Other quoted statements from the same page:
> "Event match quality is available for website events sent through the Conversions API with the action source parameter set to Website."
> "To determine event match quality, Meta calculates a score from 0 to 10 based on the quality of customer information you're sending for a specific server event and the percentage of event instances matched to Meta accounts."
> "Event match quality scores are available for all standard and custom web events, such as page view, add to cart, and purchase. The last 48 hours of data are used to calculate scores, so it's important to send events regularly to keep your event match quality scores up to date."
> "Meta Business Tools Terms expressly require you to have lawful rights to collect, use and share data before providing it to us. The Terms also require you to hash contact information as provided in our developer documentation and not share any data that includes sensitive information. Ensure you have obtained the proper lawful permissions and any necessary consents before you share any information with a third party."

### 2. `fbc` and `fbp` formats

Source: https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc.md

`fbc` value format: `version.subdomainIndex.creationTime.<fbclid>`
- `version`: "is always this prefix: **fb**"
- `subdomainIndex`: "which domain the cookie is defined on ('com' = 0, 'example.com' = 1, 'www.example.com' = 2). If you're generating this field on a server, and not saving an `_fbc` cookie, use the value 1."
- `creationTime`: "the UNIX time since epoch in **milliseconds** when the `_fbc` was stored. If you don't save the `_fbc` cookie, use the timestamp when you first observed or received this `fbclid` value."
- `<fbclid>`: "the value for the `fbclid` query parameter in the page URL."
- Example: `fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`

`fbp` value format: `version.subdomainIndex.creationTime.randomnumber`
- `version`: `fb`
- `subdomainIndex`: same semantics as above
- `creationTime`: "the UNIX time since epoch in **milliseconds** when the `_fbp` cookie was saved"
- `Randomnumber`: "generated by the Meta Pixel SDK to ensure every `_fbp` cookie is unique"
- Example: `fb.1.1596403881668.1116446470`

**fbclid case sensitivity**: "ClickID value is case sensitive - do not apply any modifications before using, such as lower or upper case." — https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc.md

**Building `fbc` when the `_fbc` cookie is absent**: "If the `_fbc` cookie is not available because there is no Meta Pixel running on the website, it is still possible to send the `fbc` event parameter with the Conversion API event if an `fbclid` query parameter is in the URL of the current page request." Same doc.

**Storing the cookie**: "It is highly recommended to set `_fbc` as: HTTP cookie in the HTTP response headers, with the 90 days expiration time." Rule for when to (re)write it: "only set the cookie if: `_fbc` cookie doesn't exist and ClickID was retrieved from the `fbclid` URL query parameter; `fbclid` in the URL query parameter isn't equal to the corresponding value in the `_fbc` cookie value." Same doc.

**Is `fbp` required?** Not stated as required anywhere in the fetched docs. Best practices page only says to keep it refreshed: "The `fbp` and `fbc` parameters are cookie values typically set on your site visitors' browsers ... and are subject to change. If you send them as user parameters, you should regularly refresh their values." — https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices. `fbp` is however used as an `external_id` fallback for matching, and matters for dedup (see below).

**`fbclid` validity duration**: not documented anywhere in the fetched pages (customer-information-parameters.md, fbp-and-fbc.md, parameter-builder-library.md, best-practices.md, using-the-api.md all reviewed — none give a fbclid TTL/expiry). Gap — see Contradictions and gaps.

**Newer `fbc` format with a suffix / `_aem_`**: not documented. The only documented suffix mechanism is the Parameter Builder Library's own **appendix**, which is unrelated to `_aem_` (see next section). No fetched Meta page mentions an `_aem_` segment inside `fbclid` or `fbc`. Gap — see Contradictions and gaps.

### Parameter Builder Library (PBL) — normalization and the appendix format

Source: https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library.md

Supported parameters and their PBL-specific formats:
- `fbc`: `fb.${subdomain_index}.${creation_time}.${fbclid}.${appendix}` — example: `fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890.ABcDEFGh`
- `fbp`: `fb.${subdomain_index}.${creation_time}.${random_number}.${appendix}` — example: `fb.1.1596403881668.1116446470.ABcDEFGh`
- `client_ip_address`: IPv4/IPv6 with an appendix appended, e.g. `168.212.226.204.ABcDEFGh`
- Normalized customer info parameters (`em`, `ph`, `fn`, `ln`, `db`, `ge`, `ct`, `st`, `zp`, `country`, `external_id`): "The library adopts the best practice to normalize and hash the customer information parameters. No further action is needed." Example: `John_Smith@gmail.com` → `john_smith@gmail.com` → `62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f.ABcDEFGh`

Appendix format: "For all parameters processed by the parameter builder, Meta will add an appendix field at the end of each parameter to help evaluate the performance of the library. The appendix field has 8 characters containing (1) the SDK version, (2) incrementalability, (3) the SDK language." Note: "If you are seeing the appendix as 2 characters, it is a legacy appendix that only contains the SDK language."

PBL best practices (same page):
- "Capture cookies early: Make sure you save the `_fbp` and `_fbc` cookies as early as possible in the customer journey ... Ideally retrieve `_fbp` and `_fbc` cookies when loading your landing page."
- "Preserve the cookie value format: Do not override or adjust the `_fbc` or `_fbp` cookie. `_fbc` is case sensitive; do not normalize or format the `_fbc` to lowercase."
- "Prioritize IPv6 for `getIpFn`: ... retrieve the IPv6 address first, then fall back to the IPv4 address."
- "Normalize and hash only once: Apply normalization and hashing to customer information parameters only once — either on the client side or the server side — before sending them to Meta through the Conversions API."
- "Parameter value is case-sensitive: All the customer information parameter fields' values returned from the parameter builder are case sensitive. You can send these values as is back to Meta ... without any normalizing (for example, lowercase), as it has been done automatically by the parambuilder SDK."

**PBL and consent** (https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library/get-started.md):
> "Businesses can implement code that creates a banner and requires affirmative consent (for example, an 'I agree' checkbox at the top of the page) to allow cookie saving actions through the parameter builder library. If you already have a system in place that addresses this need, such as a tag manager, you can make this code optional." "With regard to the user's cookie and consent, please refer to the Meta Business Tools Terms for details."

And in the workflow page (https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library/workflow-and-examples.md), for the client-side `.getFbc()`/`.getFbp()`/`.getClientIpAddress()` calls: "Note: this API will save/update cookies. Make sure the website has the user's cookie consent before calling."

### 3. Dedup and `external_id`

Source: https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/external-id.md and https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events.md

- `external_id` object type: "string or array of strings | Hashing is recommended."
- "External IDs can be sent via multiple channels, including browser Pixel, Conversions API, and Offline Conversions API (OCAPI). You must be consistent across channels."
- "The `external_id` to specific user matches expire periodically. We recommend that you refresh it as frequently as possible." (no exact TTL given)
- `fbp`-as-`external_id` fallback table:

| Scenario | How Data Is Handled |
| --- | --- |
| Event includes `fbp`, but not `external_id` | "We use `fbp` as `external_id` and try to find a match. Since `fbp` is a browser cookie, it has an expiration date." |
| Event includes `fbp` and `external_id` | "We save both fields and try to find a match. `external_id` is always favored, since it offers improved performance." |
| Event includes `external_id`, but not `fbp` | "This is processed as a regular event including `external_id`." |

Dedup mechanics (deduplicate-pixel-and-server-events.md):
- Recommended method: matching `event_id` (Conversions API) to Pixel's `eventID`, and matching `event_name` to Pixel's `event`. "If we find a match between events sent within 48 hours of each other, we only consider the first one. If a server and browser/app event arrive at approximately the same time (that is, within 5 minutes of each other), we favor the browser/app event." (server-event.md)
- Alternative method: consistent `event_name` + `fbp` and/or `external_id` across channels. "This deduplication method: Generally, it only works for deduplicating events sent first from the browser and then through the server ... Does not deduplicate events when only using one event source."
- "If we find the same server key combination (`event_id` and `event_name`) and browser key combination (`eventID` and `event`) sent to the same Pixel ID within 48 hours, we discard the subsequent events."

### 4. `data_processing_options`, `data_processing_options_country`, `data_processing_options_state`, `opt_out`

Source: https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/data-processing-options.md (page titled **"Data Processing Options for US Users"**) and https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event.md

- "Limited Data Use is a data processing option that gives you more control over how your data is used in Meta's systems and better supports your compliance efforts with **various US state privacy regulations**."
- US states currently covered (with effective dates), per the table on the page: California, Colorado (June 1, 2023), Connecticut (June 1, 2023), Delaware (Dec 18, 2024), Florida (June 24, 2024), Montana (Sept 23, 2024), Nebraska (Dec 18, 2024), New Hampshire (Dec 18, 2024), New Jersey (Dec 18, 2024), Oregon (June 24, 2024), Texas (June 24, 2024), Minnesota (June 2, 2025), Maryland (Sept 9, 2025), Rhode Island (Nov 17, 2025).
- `data_processing_options` field: "array. Processing options you would like to enable for a specific event or record. Current accepted value is `LDU` for Limited Data Use. ... An empty array can be sent to explicitly specify that this event or record shouldn't be processed with the Limited Data Use restrictions."
- `data_processing_options_country`: "integer. Optional for most APIs. ... Current accepted values are `1` for the United States of America, or `0` to request that Meta perform geolocation."
- `data_processing_options_state`: "integer. Optional for most APIs. ... Current accepted values are `1000` for California, `1001` for Colorado, `1002` for Connecticut, `1003` for Florida, `1004` for Oregon, `1005` for Texas, `1006` for Montana, `1007` for Delaware, `1008` for Nebraska, `1009` for New Hampshire, `1010` for New Jersey, `1011` for Minnesota, `1012` for Maryland, `1013` for Rhode Island or `0` to request that we perform geolocation. Note: If you set a country, you must also set a state. Otherwise, we will perform geolocation."
- Server-event.md gives a narrower value set for `data_processing_options_state`, only documenting `1000` (California) and `0` — a difference from the fuller state list on the data-processing-options page (see Contradictions).
- **No country/state code exists for any EU country or Switzerland** anywhere in this reference — the only non-zero `data_processing_options_country` value defined is `1` (USA).
- What to send for a non-US user: the doc gives two explicitly equivalent options — send an empty array, or omit the field: "To explicitly not enable Limited Data Use (LDU), specify an empty array for each event or simply remove the field in the payload," shown with the example `"data_processing_options": []`.
- `opt_out` (server-event.md): "boolean. Optional. A flag that indicates we should not use this event for ads delivery optimization. If set to `true`, we only use the event for attribution." This is an ad-optimization flag, not documented as a consent/legal-basis signal.

No CAPI field documented for GDPR/EU consent state — see Contradictions and gaps and section 5 below.

### 5. Consent for EU and Switzerland

**No CAPI request field carries a GDPR/EU consent signal.** The Conversions API end-to-end implementation guide states, under a section literally titled "General consent":
> "If you have logic for controlling consent with respect to sharing Pixel data, use the same logic with respect to sharing data via Conversions API." — https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/end-to-end-implementation.md

Meta's own Events Manager does apply some non-documented consent-based filtering on the receiving end: the Conversions API verification guide states that received events are counted "before they are deduplicated, discarded due to consent controls and other policies, or processed" — https://developers.facebook.com/documentation/ads-commerce/conversions-api/verifying-setup.md. No field name, mechanism, or trigger for this filtering is documented on any fetched page.

**Meta Pixel consent API** (`fbq('consent', ...)`) — this is a client-side/browser mechanism, documented at https://developers.facebook.com/docs/meta-pixel/implementation/gdpr:
> "Use the following API to pause sending Pixel fires to Facebook, and once cookie consent is granted, send Pixel fires to Facebook. You need to call revoke on every page."
```
fbq('consent', 'revoke');
fbq('consent', 'grant');
```
Example: `fbq('consent', 'revoke'); fbq('init', '<your pixel ID>'); fbq('track', 'PageView');` then later `fbq('consent', 'grant');`. This API only governs the browser Pixel; it has no direct server-side/CAPI equivalent documented anywhere in the fetched pages. Given the "General consent" guidance above, the implication is that consent gating for CAPI must be implemented at the application layer (i.e., do not call the Conversions API endpoint at all for a given user/event until your own consent state permits it) rather than through any request parameter.

Same GDPR page lists what data the Pixel receives (relevant to what a business must disclose): "Http Headers ... Pixel-specific Data ... Button Click Data ... Optional Values ... Form Field Names."

**GDPR** — Meta's pixel-facing GDPR page (https://developers.facebook.com/docs/meta-pixel/implementation/gdpr):
> "The General Data Protection Regulation (GDPR) creates consistent data protection rules across Europe. It applies to companies (regardless of where they are based) who process personal data about individuals in the EU." "Businesses who advertise with the Facebook companies can continue to use Facebook platforms and solutions in the same way they do today. Each company is responsible for ensuring their own compliance with the GDPR, just as they are responsible for compliance with the laws that apply to them today."

Meta's GDPR microsite (https://www.facebook.com/business/gdpr, Wayback snapshot 2024-06-24) adds the controller/processor framework:
> "A company is a data controller when it has the responsibility of deciding why and how (the 'purposes' and 'means') the personal data is processed." "A company is a data processor when it processes personal data on behalf of a data controller." "While Facebook operates the majority of our services as a data controller, there are some instances in which we operate as a data processor when working with businesses ... Examples where Facebook acts as the data processor include: Data File Custom Audiences ... Measurement and analytics."
> On cross-border transfer: "We operate a global infrastructure and process data both within and outside the EEA (European Economic Area). ... Transfers by our customers where we are processor are made using the Standard Contractual Clauses (SCCs) put in place through our EU Data Transfer Addendum."
> "We no longer rely on Privacy Shield for the purposes of the GDPR Chapter V to transfer data outside of the EEA (European Economic Area) but remain certified and committed to complying with the Privacy Shield framework."

**Meta Business Tools Terms** (https://www.facebook.com/legal/technology_terms, Wayback snapshot 2026-02-10) — the contract governing CAPI use, with a dedicated GDPR clause:
> "GDPR. To the extent the Business Tool Data contain Personal Information which you Process subject to the General Data Protection Regulation (Regulation (EU) 2016/679) (the "GDPR"), the following terms apply: The parties acknowledge and agree that you are the Controller in respect of the Processing of Personal Information in Business Tool Data for purposes of providing matching, measurement and analytics services ... and that you instruct Meta Platforms Ireland Limited ... ("Meta Ireland") to Process such Personal Information for those purposes on your behalf as your Processor ... Regarding Personal Information in Event Data referring to people's actions on your websites and apps which integrate Meta Business Tools for whose Processing you and Meta Ireland jointly determine the means and purposes under the GDPR, you and Meta Ireland acknowledge and agree to be Joint Controllers in accordance with Article 26 GDPR."
> **"Section 5.a.i also applies when you are in Andorra, Azores, Canary Islands, Channel Islands, French Guiana, Guadeloupe, Isle of Man, Madeira, Martinique, Mayotte, Monaco, Réunion, San Marino, Saint Barthélemy, Saint-Martin, Switzerland, United Kingdom sovereign bases in Cyprus (Akrotiri and Dhekelia), and Vatican City."** — this is the only reference to Switzerland found anywhere in the fetched Meta documentation; Meta extends its GDPR joint-controller clause (Section 5.a.i) territorially to cover Switzerland, rather than referencing Swiss law (nFADP/revDSG) directly.
> Cookie consent obligation: "In jurisdictions that require informed consent for storing and accessing cookies or other information on an end user's device (such as but not limited to the European Union), you must ensure, in a verifiable manner, that an end user provides all necessary consents before you use Meta Business Tools to enable the storage of and access to Meta cookies or other information on the end user's device. (For suggestions on implementing consent mechanisms, visit our Cookie Consent Resource.)"
> Hashing obligation (repeated from section 1 above): "We will hash Contact Information that you send to us via a Meta JavaScript pixel for matching purposes prior to transmission. When using a Meta image pixel or other Meta Business Tools, you or your service provider must hash Contact Information in a manner specified by us before transmission."
> Data retention: "Subject to these Business Tools Terms, we may retain the Event Data for a maximum of two years."
> Definitions: "'Contact Information' is information that personally identifies individuals, such as names, email addresses, and phone numbers, that we use for matching purposes only." "'Event Data' is other information that you share about people and the actions that they take on your websites and apps or in your shops."

**Cookie Consent Resource** (Meta's dedicated EU cookie-consent guide, https://developers.facebook.com/docs/privacy — served as markdown):
> "The purpose of this guide is to share general context and resources to help our partners meet cookie consent requirements." "Facebook cannot provide legal guidance on compliance with regulations and policies. We recommend that you conduct your own assessment about consent requirements and talk to your Legal representative."
> Requirements: "You must obtain user consent before setting/reading cookies or other trackers for any purposes that are not strictly-necessary or otherwise exempt; You must provide the user with clear and comprehensive information about the use of cookies."
> Valid consent standard: "For consent to be valid, it must be: Freely given ... Specific and informed ... Unambiguous and affirmative — The consent moment involves a clear and positive action, such as physically clicking on an opt-in box to indicate consent."
> On obtaining consent: "You need to decide what affirmative action a user must take to consent, such as clicking I agree in a banner or splash screen." "It is generally expected that it must be as easy to withdraw consent as to give in the first place."
> Points to Consent Management Platforms: "consider working with a Consent Management Platform (CMP) provider, such as OneTrust or TrustArc," and lists the IAB Europe Transparency and Consent Framework CMP list.
> Region-specific DPA guidance links given: Ireland (IDPC), France (CNIL), Spain (AEPD), UK (ICO), Belgium (APD) — **no Swiss guidance is listed**.

No document among those fetched uses the phrase "Consent Mode" (that term is not used by Meta in any fetched page — see Contradictions and gaps for the web-search context on third-party usage of the term).

### 6. IP address and user agent handling for EU users

Source: https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters.md

- `client_ip_address`: "must be a valid IPV4 or IPV6 address. IPV6 is preferable over IPV4 for IPV6-enabled users. The `client_ip_address` user data parameter must never be hashed. No spaces should be included. Always provide the real IP address to ensure accurate event reporting." Examples: IPv4 `168.212.226.204`; IPv6 `2001:0db8:85a3:0000:0000:8a2e:0370:7334`.
- `client_user_agent`: "Do not hash." "Required for website events shared using the Conversions API." Example format given is a full raw UA string.
- No IP anonymization/truncation mechanism (e.g., last-octet masking) is documented anywhere in the fetched Conversions API pages; the guidance is the opposite — "Always provide the real IP address." No EU/GDPR-specific carve-out or anonymization option for `client_ip_address` was found in any fetched page.
- The Parameter Builder Library best practices reiterate "Prioritize IPv6 for `getIpFn`" (https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library.md) but add no EU-specific rule.

## Contradictions and gaps

- **Assignment's Event Match Quality URL resolves to a different article.** The assignment lists `https://www.facebook.com/business/help/611774685654668` for "event match quality." Fetching it (title-only, since body is not extractable) returns the title "Erweiterter Abgleich für das Web" / "About advanced matching for web" (German and English variants confirmed via WebFetch), **not** Event Match Quality. The actual "About Event Match Quality" article is at a different ID: `https://www.facebook.com/business/help/765081237991954`, confirmed via web search and by its own Wayback Machine snapshot title "About Event Match Quality | Meta Business Help Center." Both URLs are listed separately in the Sources table above.
- **Two different EMQ "which parameters matter most" answers from two official Meta sources, and they disagree on ranking.** The developer Best Practices page (https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices) lists high-quality parameters as: email (`em`), IP address (`client_ip_address`), name (`fn`/`ln`), phone number (`ph`) — with no explicit tier ordering among them. The Business Help Center "About Event Match Quality" article priority table (https://www.facebook.com/business/help/765081237991954) ranks Email and Click ID (`fbc`) as **High**; Facebook Login ID, Birthdate, Country, Phone number, External ID, Browser ID (`fbp`) as **Medium**; and Lead, First name, Last name, City, Zip/Postal Code as **Low** — and this table **does not mention `client_ip_address` or first/last name as high-priority at all**, contradicting the Best Practices page's inclusion of IP address and name in its "high-quality" list. Neither page cross-references the other's ranking.
- **`data_processing_options_state` accepted-values list differs between two official pages.** The Data Processing Options overview page (https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/data-processing-options.md) documents 14 state codes (`1000`–`1013`) plus `0`. The Server Event Parameters reference (https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event.md) documents only `1000` (California) and `0` for the same field, omitting the other 13 states without cross-referencing the fuller list.
- **`fbclid` validity duration is not documented.** None of the fetched pages (fbp-and-fbc.md, customer-information-parameters.md, parameter-builder-library.md, best-practices.md, using-the-api.md) states how long a `fbclid` value remains usable/valid for matching. Only the `_fbc` **cookie's** recommended storage duration (90 days) is documented, which is a different question from `fbclid` freshness/validity itself.
- **The "`_aem_` suffix" / newer `fbc` format asked about in the assignment is not documented anywhere in Meta's fetched pages.** The only documented suffix mechanism for `fbc`/`fbp` is the Parameter Builder Library's unrelated 8-character (or legacy 2-character) "appendix," described at https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library.md. Separately, real-world `fbclid` values observed inside GitHub README links on Meta's own get-started page (https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library/get-started.md) do contain an embedded `_aem_` segment (e.g. `...MoaOnIW9a1IOYwb69CXYdOf0IxQVHqxg_aem_owDtD09TvNummgpGOz8y0w`), but no Meta documentation page fetched explains, names, or defines this segment — it is only ever treated as an opaque part of the `fbclid` string. This is a genuine documentation gap, not resolvable from any fetched source.
- **`madid`'s hash status is inconsistent within the same table.** Every other row in the customer-information-parameters.md table carries an explicit "Do not hash." label; the `madid` row is the only one that omits this label (source: https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters.md). Whether this is intentional (perhaps because `madid` is mobile-only and out of scope for this web-only project) or a documentation omission cannot be determined from the fetched text. Not applicable to this project's scope (web only) either way.
- **No Swiss-law-specific Meta documentation found.** Despite targeted searches (web search and full-text search of every fetched page) for "nFADP," "revDSG," or "Federal Act on Data Protection," no fetched Meta page (developer docs or Business Help Center) mentions Switzerland's data protection law by name. The only Switzerland reference found anywhere is the territorial extension clause in the Meta Business Tools Terms (Section 5.a.i applying "when you are in ... Switzerland ..."), which folds Switzerland into the **GDPR** joint-controller mechanism rather than addressing the nFADP/revDSG as a distinct legal regime. The Cookie Consent Resource page's list of national Data Protection Authority guidance (Ireland, France, Spain, UK, Belgium) also does not include Switzerland's FDPIC.
- **No page uses the term "Consent Mode."** The assignment asks about "Meta's 'Consent Mode' or any equivalent"; no fetched Meta documentation page (developer docs, Business Help Center, GDPR microsite, Business Tools Terms, or Cookie Consent Resource) uses this term. A web search for "Meta Conversions API consent EU EEA Switzerland 2025 2026" surfaced only third-party consent-management-vendor blog content (not Meta's own documentation) discussing what those vendors call "Meta Consent Mode" — this is third-party terminology, not sourced from developers.facebook.com or facebook.com/business, and is therefore excluded from the Findings above per the "nothing from memory, only sourced findings" rule. It is noted here only to record that the search was performed and found no first-party Meta source using this term.
- **Several assignment-listed Business Help Center URLs could not be read at all**, from either curl or WebFetch, and their Wayback Machine snapshots also returned only an empty/SPA-shell page with no extractable body text: `https://www.facebook.com/business/help/823677331451951` (deduplication for Meta Pixel and Conversions API events) and `https://www.facebook.com/business/help/2041148702652965` (About Conversions API). Their content could not be verified or reported; the developer-doc equivalents (`deduplicate-pixel-and-server-events.md` and the Conversions API overview `.md`) were used instead where they overlap.
- **`https://www.facebook.com/business/m/privacy-and-data`** (linked repeatedly from the developer docs as "Meta Privacy and Data Use Guide") also could not be read — it returns a client-rendered "Transparency Center" shell with no extractable text via curl.
- **The GDPR microsite content is dated.** The Wayback Machine snapshot of https://www.facebook.com/business/gdpr (captured 2024-06-24, meaning it was still the live page then) still frames GDPR as having recently "gone into effect May 25, 2018" and discusses the (now-invalidated) Privacy Shield framework's status as of that writing. It does not mention the EU-US Data Privacy Framework (Privacy Shield's successor) by name. Whether Meta has published a more current GDPR resource elsewhere could not be determined — this page was the one explicitly linked from Meta's own developer docs and Business Tools Terms as the canonical GDPR resource.
- **The old-site data-processing-options URL given in the assignment (`https://developers.facebook.com/docs/marketing-api/data-processing-options`) returns HTTP 404.** A plural variant, `https://developers.facebook.com/docs/marketing-apis/data-processing-options`, returned HTTP 200 with content identical to the current ads-commerce page — this looks like either a routing quirk or an unrelated coincidental match rather than a genuine "old" URL for this document, and should not be relied on as a stable link.
