# Reading Meta's developer documentation as markdown

## Rules

- Identify with a structured User-Agent on every request, constant across a session: `AgentName/Version (ModelName) HTTPClient`, for example `MetaCapiHarness/0.1 (claude-sonnet-5) curl/8`. Meta asks for it in `https://developers.facebook.com/llms.txt`.
- Append `.md` to any page under `https://developers.facebook.com/documentation/...` to get its markdown twin. Old `https://developers.facebook.com/docs/...` URLs redirect to the new path and serve the same markdown; appending `.md` to an old URL returns 404.
- Business Help Center and legal pages (`facebook.com/business/help/...`, `facebook.com/legal/...`) are JavaScript shells; use a Wayback Machine snapshot when their text is needed.
- Nothing from memory: quote the page and keep its URL next to the finding.

```sh
curl -sL -A "MetaCapiHarness/0.1 (claude-sonnet-5) curl/8" https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event.md
```

## Indexes

| Index                                                                                       | Covers                                                                        |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| https://developers.facebook.com/llms.txt                                                    | root, agent identification rules                                              |
| https://developers.facebook.com/documentation/ads-commerce/llms.txt                         | every Ads and Commerce page, Conversions API and Dataset Quality API included |
| https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/llms.txt | Marketing API nodes, including the Ads Pixel node and its edges               |

## Pages that settle questions

| Question                                             | Page                                                                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Endpoint, batches, `test_event_code`, version policy | `.../conversions-api/using-the-api.md`                                                                         |
| Every event-level key                                | `.../conversions-api/parameters/server-event.md`                                                               |
| Every `user_data` key with hashing and normalization | `.../conversions-api/parameters/customer-information-parameters.md`                                            |
| `fbc` and `fbp` formats, `fbclid` handling           | `.../conversions-api/parameters/fbp-and-fbc.md`                                                                |
| Every `custom_data` key                              | `.../conversions-api/parameters/custom-data.md`                                                                |
| Standard events and their parameters                 | `https://developers.facebook.com/documentation/meta-pixel/reference.md`                                        |
| Custom events, custom conversions                    | `https://developers.facebook.com/documentation/meta-pixel/implementation/conversion-tracking.md`               |
| Deduplication with the pixel                         | `.../conversions-api/deduplicate-pixel-and-server-events.md`                                                   |
| Required and recommended keys, matching baseline     | `https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices`                            |
| Limited Data Use                                     | `.../marketing-api/overview/data-processing-options.md`                                                        |
| Dataset Quality API                                  | `.../conversions-api/dataset-quality-api.md`                                                                   |
| `POST /{pixel_id}/events` reference and error codes  | `.../marketing-api/reference/ads-pixel/events.md`                                                              |
| Meta's own normalizer                                | `https://raw.githubusercontent.com/facebook/facebook-nodejs-business-sdk/main/src/objects/serverside/utils.js` |

`...` stands for `https://developers.facebook.com/documentation/ads-commerce`.

## Pages that were broken on 2026-09-05

- `.../conversions-api/guides/predicted-lifetime-value.md` answered HTTP 500.
- `.../conversions-api/dataset-quality-api/crm-events.md` answered a "page not found" shell although the index lists it.
- `https://developers.facebook.com/docs/graph-api/guides/error-handling` and `.../overview/rate-limiting` never answered markdown.
