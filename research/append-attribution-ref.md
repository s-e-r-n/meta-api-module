# AppendAttribution event parameters


**Warning:** This API is in Beta with limited access. If you do not have access, contact your Meta representative.

This page documents the event parameters for the `AppendAttribution` Conversions API event. For end-to-end setup instructions, prerequisites, and best practices, see the [AppendAttribution integration guide](https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/append-attribution).

You can use the [Conversions API Payload Helper](https://developers.facebook.com/documentation/ads-commerce/conversions-api/payload-helper) to test that you are sending events correctly to Meta following this specification.

**Note**: AppendAttribution events must be received less than 48 hours from the original event, such as `Purchase`.

## Event parameters (web events)

| Top-Level Parameter | Nested Parameter | Description |
| --- | --- | --- |
| `event_name`&lt;br&gt;&lt;br&gt;string |  | **Required.**&lt;br&gt;A unique name indicating that this is a post-attribution event.&lt;br&gt;&lt;br&gt;Expected value: `AppendAttribution`&lt;br&gt;&lt;br&gt;**Note**: This name is standardized. Do not change it. |
| `event_time`&lt;br&gt;&lt;br&gt;integer |  | **Required.**&lt;br&gt;The time in seconds when the passback event was generated, as per the advertiser&#039;s in-house attribution model/pipeline. This timestamp may be earlier than when the AppendAttribution event is sent to Meta.&lt;br&gt;&lt;br&gt;Example expected value: `1736900999` |
| `action_source`&lt;br&gt;&lt;br&gt;string |  | **Required.**&lt;br&gt;This field allows you to specify where your conversions occurred. Knowing where your events took place helps ensure your ads go to the right people. By using the Conversions API, you agree that the `action_source` parameter is accurate to the best of your knowledge.&lt;br&gt;&lt;br&gt;The values you can send in the `action_source` field are as follows:&lt;br&gt;&lt;br&gt;* `email` — Conversion happened over email.&lt;br&gt;* `website` — Conversion was made on your website.&lt;br&gt;* `app` — Conversion was made on your mobile app.&lt;br&gt;* `phone_call` — Conversion was made over the phone.&lt;br&gt;* `chat` — Conversion was made via a messaging app, SMS, or online messaging feature.&lt;br&gt;* `physical_store` — Conversion was made in person at your physical store.&lt;br&gt;* `system_generated` — Conversion happened automatically, for example, a subscription renewal that&#039;s set to auto-pay each month.&lt;br&gt;* `business_messaging` — Conversion was made from ads that click to Messenger, Instagram, or WhatsApp.&lt;br&gt;* `other` — Conversion happened in a way that is not listed.&lt;br&gt;&lt;br&gt;**Note**: All action source values enable ad measurement and custom audience creation capabilities. All action sources except `physical_store` enable ad optimization capabilities. |
| `event_source_url`&lt;br&gt;&lt;br&gt;string |  | **Required.**&lt;br&gt;The browser URL where the event happened. The URL should match the verified domain.&lt;br&gt;&lt;br&gt;**Note:** The `event_source_url` is required for website events shared using the Conversions API. |
| `event_id`&lt;br&gt;&lt;br&gt;string |  | **Optional, but Highly Recommended.**&lt;br&gt;Distinguish the post-attribution event for deduplication purposes. This should uniquely identify the post-attribution event, not the original Purchase/Install event.&lt;br&gt;&lt;br&gt;Example: `607c1d9b-2ed1-4911-a360-948090cb0dd5` |
| `attribution_data`&lt;br&gt;&lt;br&gt;string | `ad_id`&lt;br&gt;&lt;br&gt;---&lt;br&gt;`touchpoint_ts`&lt;br&gt;&lt;br&gt;---&lt;br&gt;`attribution_share`&lt;br&gt;&lt;br&gt;---&lt;br&gt;`attribution_value` | **Required.**&lt;br&gt;The ID from the ad click context received from Meta.&lt;br&gt;&lt;br&gt;Example: `6283824241739`&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Required.**&lt;br&gt;The time the ad was clicked (seconds).&lt;br&gt;&lt;br&gt;Example: `1714849203`&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Required.**&lt;br&gt;The credit that the advertiser is applying to the click for the conversion, between 0 and 1.&lt;br&gt;&lt;br&gt;0 if no credit. Value between 0 and 1, for example, 0.3 if fractional credit, and 1 if full credit.&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Required.**&lt;br&gt;ROAS value attributed to Meta.&lt;br&gt;&lt;br&gt;It&#039;s calculated as: `attribution_share`*value&lt;br&gt;&lt;br&gt;Example: `101.99` |
| `custom_data` | `currency` | **Required.**&lt;br&gt;The currency for the `value` specified, if applicable. Currency must be a valid [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217?fbclid=IwAR2qARpy3ufnmcEY-sVHvTzUA1AsFOsLYdNsrZP6UYAMRt6NVM5SAhfzfJg) three-digit currency code.&lt;br&gt;&lt;br&gt;Example: `USD` |
| `original_event_data`&lt;br&gt;&lt;br&gt;object | `event_name`&lt;br&gt;&lt;br&gt;string&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`event_time`&lt;br&gt;&lt;br&gt;integer&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`order_id`&lt;br&gt;&lt;br&gt;string | **Required.**&lt;br&gt;A [standard event](https://developers.facebook.com/docs/facebook-pixel/implementation/conversion-tracking#standard-events) or [custom event](https://developers.facebook.com/docs/facebook-pixel/implementation/conversion-tracking#custom-events) name. This field is used to deduplicate events sent by both web (via Meta Pixel) or app (via SDK or App Events API) and the Conversions API. The `event_id` parameter is also used in deduplication.&lt;br&gt;&lt;br&gt;For the same customer action, `event` from the browser or app event matches `event_name` from the server event. If we find a match between events sent within 48 hours of each other, we only consider the first one. If a server and browser/app event arrive at approximately the same time (that is, within 5 minutes of each other), we favor the browser/app event. Learn more about [Deduplicate Pixel and Server Events](https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events).&lt;br&gt;&lt;br&gt;Example: `Purchase`&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Required.**&lt;br&gt;A Unix timestamp in seconds indicating when the actual event occurred. The specified time may be earlier than the time you send the event to Facebook. This is to enable batch processing and server performance optimization. You must send this date in GMT time zone.&lt;br&gt;&lt;br&gt;The `event_time` can be up to 7 days before you send an event to Facebook. If any `event_time` in `data` is greater than 7 days in the past, we return an error for the entire request and process no events.&lt;br&gt;&lt;br&gt;Example:  `1717503323`&lt;br&gt;&lt;br&gt;**Note**: This should occur after the attributed click time, that is, `attribution_data.touchpoint_ts`&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Optional.**&lt;br&gt;&lt;br&gt;The order ID for the transaction, as a string.&lt;br&gt;&lt;br&gt;Example: `&quot;ORD-2024-0001234&quot;` |
| `user_data`&lt;br&gt;&lt;br&gt;object | `fbc`&lt;br&gt;&lt;br&gt;string&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`client_user_agent`&lt;br&gt;&lt;br&gt;string&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`em`&lt;br&gt;&lt;br&gt;string or list&lt;string&gt;&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`ph`&lt;br&gt;&lt;br&gt;string or list&lt;string&gt;&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`client_ip_address`&lt;br&gt;&lt;br&gt;string&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`external_id`&lt;br&gt;&lt;br&gt;string or list&lt;string&gt; | **Required  if available.**&lt;br&gt;**Note:** **Note**: Do not hash.&lt;br&gt;&lt;br&gt;The Facebook click ID value is stored in the `_fbc` browser cookie under your domain. See [Managing `fbc` and `fbp` Parameters](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc) for how to get this value or generate this value from a `fbclid` query parameter.&lt;br&gt;&lt;br&gt;The format is: fb.$&#123;subdomain_index&#125;.$&#123;creation_time&#125;.$&#123;fbclid&#125;&lt;br&gt;&lt;br&gt;Example:&lt;br&gt;`fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;**Required.**&lt;br&gt;The browser user agent for the conversion event.&lt;br&gt;&lt;br&gt;Example: `Mozilla/5.0 (Windows NT 10.0; Win64; x64)`&lt;br&gt;&lt;br&gt;**Note:** **Note**: Do not hash.&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Optional.**&lt;br&gt;Trim any leading and trailing spaces. Convert all characters to lowercase.&lt;br&gt;&lt;br&gt;**Example:**&lt;br&gt;&lt;br&gt;*Input:* John_Smith&#064;gmail.com&lt;br&gt;*Normalized format:* john_smith&#064;gmail.com&lt;br&gt;*Expected SHA256 output:* 62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f&lt;br&gt;&lt;br&gt;**Note:** **Note**: Hashing required.&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Optional.**&lt;br&gt;Remove symbols, letters, and any leading zeros. Phone numbers must include a country code to be used for matching (for example, the number 1 must precede a phone number in the United States). Always include the country code as part of your customers&#039; phone numbers, even if all of your data is from the same country.&lt;br&gt;&lt;br&gt;Example:&lt;br&gt;&lt;br&gt;Input: US phone number (650)555-1212&lt;br&gt;Normalized format: 16505551212&lt;br&gt;Expected SHA256 output:&lt;br&gt;&lt;br&gt;e323ec626319ca94ee8bff2e4c87cf613be6ea19919ed1364124e16807ab3176&lt;br&gt;&lt;br&gt;**Note:** **Note**: Hashing required.&lt;br&gt;&lt;br&gt;---&lt;br&gt;**No, but recommended.**&lt;br&gt;**Note:** **Note**: Do not hash.&lt;br&gt;&lt;br&gt;The IP address of the browser corresponding to the event must be a valid IPV4 or IPV6 address. IPV6 is preferable over IPV4 for IPV6-enabled users. The `client_ip_address` user data parameter must never be hashed.&lt;br&gt;No spaces should be included. Always provide the real IP address to ensure accurate event reporting.&lt;br&gt;&lt;br&gt;**Note:** This information is automatically added to events sent through the browser, but it must be manually configured for events sent through the server.&lt;br&gt;&lt;br&gt;Example:&lt;br&gt;*IPV4:* 168.212.226.204&lt;br&gt;*IPV6:* 2001:0db8:85a3:0000:0000:8a2e:0370:7334&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Optional, but recommended if available.**&lt;br&gt;**Note:** **Note**: Hashing recommended.&lt;br&gt;&lt;br&gt;Any unique ID from the advertiser, such as loyalty membership IDs, user IDs, and external cookie IDs. You can send one or more external IDs for a given event.&lt;br&gt;&lt;br&gt;If an external ID is being sent using other channels, it should be in the same format as when sent using the [Conversions API](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/external-id).&lt;br&gt;&lt;br&gt;Example: 114351fd7c547295ed4c7cf61c79e3e1e648930ccbda923e394a7914864682db114351fd7c547295ed4c7cf61c79e3e1e648930ccbda923e394a7914864682db |

### AppendAttribution web event example

```
&#123;
  &quot;event_name&quot;: &quot;AppendAttribution&quot;,
  &quot;event_time&quot;: 1633552688,
  &quot;event_id&quot;: &quot;event.id.123&quot;,
  &quot;action_source&quot;: &quot;website&quot;,
  &quot;event_source_url&quot;: &quot;http://jaspers-market.com/product/123&quot;,
  &quot;attribution_data&quot;: &#123;
    &quot;ad_id&quot;: 12345,
    &quot;touchpoint_ts&quot;: 1714849203,
    &quot;attribution_share&quot;: 0.3,
    &quot;attribution_value&quot;: 100.2
  &#125;,
  &quot;original_event_data&quot;: &#123;
    &quot;event_name&quot;: &quot;Purchase&quot;,
    &quot;event_time&quot;: 1717503323,
    &quot;order_id&quot;: &quot;ORD-2024-0001234&quot;
  &#125;,
  &quot;custom_data&quot;: &#123;
    &quot;currency&quot;: &quot;USD&quot;
  &#125;,
  &quot;user_data&quot;: &#123;
    &quot;client_user_agent&quot;: &quot;Mozilla/5.0 (Linux; Android 10; SM-J600FN Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/123.0.6312.77 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/457.0.0.54.84;]&quot;,
    &quot;fbc&quot;: &quot;fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890&quot;,
    &quot;client_ip_address&quot;: &quot;168.212.226.204&quot;,
    &quot;em&quot;: &quot;62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f&quot;,
    &quot;ph&quot;: &quot;e323ec626319ca94ee8bff2e4c87cf613be6ea19919ed1364124e16807ab3176&quot;,
    &quot;external_id&quot;: &quot;114351fd7c547295ed4c7cf61c79e3e1e648930ccbda923e394a7914864682db114351fd7c547295ed4c7cf61c79e3e1e648930ccbda923e394a7914864682db&quot;
  &#125;
&#125;
```

## Event parameters (app events)

**Warning:** **Important**: To prevent API errors, ensure the Pixel is correctly associated with an app before sending app events.

| Top-Level Parameter | Nested Parameter | Description |
| --- | --- | --- |
| `event_name`&lt;br&gt;&lt;br&gt;string |  | **Required.**&lt;br&gt;A unique name indicating that this is a passback event.&lt;br&gt;&lt;br&gt;Expected value: `AppendAttribution`&lt;br&gt;&lt;br&gt;**Note**: This name is standardized. Do not change it. |
| `event_time`&lt;br&gt;&lt;br&gt;integer |  | **Required.**&lt;br&gt;The time in seconds that the passback event was generated (not the Purchase/Install time).&lt;br&gt;&lt;br&gt;Example expected value: `1736900999` |
| `action_source`&lt;br&gt;&lt;br&gt;string |  | **Required.**&lt;br&gt;This field allows you to specify where your conversions occurred. Knowing where your events took place helps ensure your ads go to the right people. By using the Conversions API, you agree that the `action_source` parameter is accurate to the best of your knowledge.&lt;br&gt;&lt;br&gt;The values you can send in the `action_source` field are as follows:&lt;br&gt;&lt;br&gt;* `email` — Conversion happened over email.&lt;br&gt;* `website` — Conversion was made on your website.&lt;br&gt;* `app` — Conversion was made on your mobile app.&lt;br&gt;* `phone_call` — Conversion was made over the phone.&lt;br&gt;* `chat` — Conversion was made via a messaging app, SMS, or online messaging feature.&lt;br&gt;* `physical_store` — Conversion was made in person at your physical store.&lt;br&gt;* `system_generated` — Conversion happened automatically, for example, a subscription renewal that&#039;s set to auto-pay each month.&lt;br&gt;* `business_messaging` — Conversion was made from ads that click to Messenger, Instagram, or WhatsApp.&lt;br&gt;* `other` — Conversion happened in a way that is not listed.&lt;br&gt;&lt;br&gt;**Note**: All action source values enable ad measurement and custom audience creation capabilities. All action sources except `physical_store` enable ad optimization capabilities. |
| `event_id`&lt;br&gt;&lt;br&gt;string |  | **Optional, but Highly Recommended.**&lt;br&gt;Uniquely identify the passback event, to support deduplication. This should uniquely identify the passback event, not the Purchase/Install event.&lt;br&gt;&lt;br&gt;Example: `607c1d9b-2ed1-4911-a360-948090cb0dd5` |
| `attribution_data` | `ad_id`&lt;br&gt;&lt;br&gt;---&lt;br&gt;`touchpoint_ts`&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`attribution_share`&lt;br&gt;&lt;br&gt;---&lt;br&gt;`attribution_value` | **Required.**&lt;br&gt;The ID provided in the ad click context received from Meta.&lt;br&gt;&lt;br&gt;Example: `6283824241739`&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Required.**&lt;br&gt;The time the ad was clicked (seconds).&lt;br&gt;&lt;br&gt;Example: `1714849203`&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Required.**&lt;br&gt;The credit that the advertiser is applying to the click for the conversion, between 0 and 1.&lt;br&gt;&lt;br&gt;0 if no credit.&lt;br&gt;Value between 0 and 1, for example, 0.3 if fractional credit, and 1 if full credit&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Required.**&lt;br&gt;ROAS value attributed to Meta.&lt;br&gt;&lt;br&gt;It&#039;s calculated as: `attribution_share`*value&lt;br&gt;&lt;br&gt;Example: `101.99` |
| `custom_data`&lt;br&gt;&lt;br&gt;string | `currency` | **Required.**&lt;br&gt;The currency for the `value` specified, if applicable. Currency must be a valid [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217?fbclid=IwAR2qARpy3ufnmcEY-sVHvTzUA1AsFOsLYdNsrZP6UYAMRt6NVM5SAhfzfJg) three-digit currency code.&lt;br&gt;&lt;br&gt;Example: `USD` |
| `original_event_data`&lt;br&gt;&lt;br&gt;string | `event_name`&lt;br&gt;&lt;br&gt;string&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`event_time`&lt;br&gt;&lt;br&gt;integer&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`order_id`&lt;br&gt;&lt;br&gt;string | **Required.**&lt;br&gt;A [standard event](https://developers.facebook.com/docs/facebook-pixel/implementation/conversion-tracking#standard-events) or [custom event](https://developers.facebook.com/docs/facebook-pixel/implementation/conversion-tracking#custom-events) name. This field is used to deduplicate events sent by both web (via Meta Pixel) or app (via SDK or App Events API) and the Conversions API. The `event_id` parameter is also used in deduplication.&lt;br&gt;&lt;br&gt;For the same customer action, `event` from the browser or app event matches `event_name` from the server event. If we find a match between events sent within 48 hours of each other, we only consider the first one. If a server and browser/app event arrive at approximately the same time (that is, within 5 minutes of each other), we favor the browser/app event. Learn more about [Deduplicate Pixel and Server Events](https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events).&lt;br&gt;&lt;br&gt;Example: `Purchase`, `fb_mobile_purchase`, `MOBILE_APP_INSTALL`&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Required.**&lt;br&gt;A Unix timestamp in seconds indicating when the actual event occurred. The specified time may be earlier than the time you send the event to Facebook. This is to enable batch processing and server performance optimization. You must send this date in GMT time zone.&lt;br&gt;&lt;br&gt;The `event_time` can be up to 7 days before you send an event to Facebook. If any `event_time` in `data` is greater than 7 days in the past, we return an error for the entire request and process no events.&lt;br&gt;&lt;br&gt;Example:  `1717503323`&lt;br&gt;&lt;br&gt;**Note**: This should occur after the attributed click time, that is, `attribution_data.touchpoint_ts`&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Optional.**&lt;br&gt;The order ID for the transaction, as a string.&lt;br&gt;&lt;br&gt;Example: `&quot;ORD-2024-0001234&quot;` |
| `app_data` | `advertiser_tracking_enabled`&lt;br&gt;&lt;br&gt;boolean&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`application_tracking_enabled`&lt;br&gt;&lt;br&gt;boolean&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`extinfo`&lt;br&gt;&lt;br&gt;object&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`campaign_ids`&lt;br&gt;&lt;br&gt;string | **Required.**&lt;br&gt;Use this field to specify ATT permission on an iOS 14.5+ device. Set to `0` for disabled or `1` for enabled.&lt;br&gt;&lt;br&gt;Expected value: `0` or `1`&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Required.**&lt;br&gt;A person can choose to enable ad tracking on an app level. Your SDK should allow an app developer to put an opt-out setting into their app. Use this field to specify the person&#039;s choice. Use `0` for disabled, `1` for enabled.&lt;br&gt;&lt;br&gt;Expected value: `0` or `1`&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Required.**&lt;br&gt;Extended device information, such as screen width and height.  This parameter is an array and values are separated by commas. When using `extinfo`, **all values are required and must be in the order indexed below**. If a value is missing, fill with an empty string as a placeholder.&lt;br&gt;&lt;br&gt;Please see the [App Data Parameters documentation](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/app-data#extinfo) for the detailed format of the `extinfo` parameter.&lt;br&gt;&lt;br&gt;Example:&lt;br&gt;&lt;br&gt;```
[
                    &quot;a2&quot;,
                    &quot;com.some.app&quot;,
                    &quot;771&quot;,
                    &quot;Version 7.7.1&quot;,
                    &quot;10.1.1&quot;,
                    &quot;OnePlus6&quot;,
                    &quot;en_US&quot;,
                    &quot;GMT-1&quot;,
                    &quot;TMobile&quot;,
                    &quot;1920&quot;,
                    &quot;1080&quot;,
                    &quot;2.00&quot;,
                    &quot;2&quot;,
                    &quot;128&quot;,
                    &quot;8&quot;,
                    &quot;USA/New York&quot;
]
```&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Android: Required if available. iOS: Required**&lt;br&gt;&lt;br&gt;An encrypted string and non-user metadata appended to the outbound URL (for example, `ad_destination_url`) or deep link (for App Aggregated Event Manager) when a user clicked on a link from Facebook.&lt;br&gt;&lt;br&gt;Graph API definition: Parameter passed via the deep link for Mobile App Engagement campaigns.&lt;br&gt;&lt;br&gt;Example: `AUBTPkAuPZYrefWv3HxQlsVj22m-0Um2S0SSz5YGtsS1kfL69tCYV3ZW6AcnDbOTfosAGdlS75pIjJwvZuQcG6U_agg_&#123;\&quot;credential\&quot;:\&quot;NjZkOTNiNzg1OGMxMTM1YTFlNzJmNzJkMWY3ZTg3NThjYmEzMmVkZmJjOTBhMTBkMWM3MzMwZjE5NDU2YTVjNA\&quot;,\&quot;shared_secret\&quot;:\&quot;lhi2YQputCEV9wXQ2VzB-2Nq2lbDwn20VSrAOqOfmSkJPFPwLL8OI0XvdSuTfehygVorj_RQBRKr8pMnix_HKw\&quot;,\&quot;key_version\&quot;:97&#125;` |
| `user_data`&lt;br&gt;&lt;br&gt;object | `fbc`&lt;br&gt;&lt;br&gt;string&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`em`&lt;br&gt;&lt;br&gt;string or list&lt;string&gt;&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`ph`&lt;br&gt;&lt;br&gt;string or list&lt;string&gt;&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`client_ip_address`&lt;br&gt;&lt;br&gt;string&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`external_id`&lt;br&gt;&lt;br&gt;string or list&lt;string&gt;&lt;br&gt;&lt;br&gt;---&lt;br&gt;&lt;br&gt;`madid`&lt;br&gt;&lt;br&gt;string | **Required  if available.**&lt;br&gt;**Note:** **Note**: Do not hash.&lt;br&gt;&lt;br&gt;The Facebook click ID value is stored in the `_fbc` browser cookie under your domain. See [Managing `fbc` and `fbp` Parameters](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc) for how to get this value or generate this value from a `fbclid` query parameter.&lt;br&gt;&lt;br&gt;The format is: fb.$&#123;subdomain_index&#125;.$&#123;creation_time&#125;.$&#123;fbclid&#125;&lt;br&gt;&lt;br&gt;Example:&lt;br&gt;`fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`&lt;br&gt;&lt;br&gt;---&lt;br&gt;**No, but recommended if madid/campaign_ids not available.**&lt;br&gt;Hashed email address.&lt;br&gt;&lt;br&gt;Trim any leading and trailing spaces. Convert all characters to lowercase.&lt;br&gt;&lt;br&gt;Example:&lt;br&gt;&lt;br&gt;*Input:* John_Smith&#064;gmail.com&lt;br&gt;*Normalized format:* john_smith&#064;gmail.com&lt;br&gt;*Expected SHA256 output:* 62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f&lt;br&gt;&lt;br&gt;---&lt;br&gt;**No, but recommended if madid/campaign_ids not available.**&lt;br&gt;Hashed phone number.&lt;br&gt;&lt;br&gt;Remove symbols, letters, and any leading zeros. Phone numbers must include a country code to be used for matching (for example, the number 1 must precede a phone number in the United States).  Always include the country code as part of your customers&#039; phone numbers, even if all of your data is from the same country.&lt;br&gt;&lt;br&gt;Example:&lt;br&gt;&lt;br&gt;*Input:* US phone number (650)555-1212&lt;br&gt;*Normalized format:* 16505551212&lt;br&gt;*Expected SHA256 output:*&lt;br&gt;e323ec626319ca94ee8bff2e4c87cf613be6ea19919ed1364124e16807ab3176&lt;br&gt;&lt;br&gt;---&lt;br&gt;**No, but recommended.**&lt;br&gt;**Note:** **Note**: Do not hash.&lt;br&gt;&lt;br&gt;The IP address of the browser corresponding to the event must be a valid IPV4 or IPV6 address. IPV6 is preferable over IPV4 for IPV6-enabled users. The `client_ip_address` user data parameter must never be hashed.&lt;br&gt;No spaces should be included. Always provide the real IP address to ensure accurate event reporting.&lt;br&gt;&lt;br&gt;**Note:** This information is automatically added to events sent through the browser, but it must be manually configured for events sent through the server.&lt;br&gt;&lt;br&gt;Example:&lt;br&gt;*IPV4:* 168.212.226.204&lt;br&gt;*IPV6:* 2001:0db8:85a3:0000:0000:8a2e:0370:7334&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Optional, but recommended if available.**&lt;br&gt;**Note:** **Note**: Hashing recommended.&lt;br&gt;&lt;br&gt;Any unique ID from the advertiser, such as loyalty membership IDs, user IDs, and external cookie IDs. You can send one or more external IDs for a given event.&lt;br&gt;&lt;br&gt;If an external ID is being sent via other channels, it should be in the same format as when sent via the [Conversions API](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/external-id).&lt;br&gt;&lt;br&gt;Example: 114351fd7c547295ed4c7cf61c79e3e1e648930ccbda923e394a7914864682db114351fd7c547295ed4c7cf61c79e3e1e648930ccbda923e394a7914864682db&lt;br&gt;&lt;br&gt;---&lt;br&gt;**Android: Required. iOS: Required if available.**&lt;br&gt;Your mobile advertiser ID, the advertising ID from an Android device or the Advertising Identifier (IDFA) from an Apple device.&lt;br&gt;&lt;br&gt;**Example:**&lt;br&gt;AECE52E7-03EE-455A-B3C4-E57283966239 |

### AppendAttribution app event example

```
&#123;
&quot;event_name&quot;: &quot;AppendAttribution&quot;,
&quot;event_time&quot;: 1633552688,
&quot;event_id&quot;: &quot;event.id.123&quot;,
&quot;action_source&quot;: &quot;app&quot;,
&quot;attribution_data&quot;: &#123;
   &quot;ad_id&quot;: 12345,
   &quot;touchpoint_ts&quot;: 1714849203,
   &quot;attribution_share&quot;: 0.3,
   &quot;attribution_value&quot;: 100.2
&#125;,
&quot;original_event_data&quot;: &#123;
   &quot;event_name&quot;: &quot;fb_mobile_purchase&quot;,
   &quot;event_time&quot;: 1717503323,
   &quot;order_id&quot;: &quot;ORD-2024-0001234&quot;
&#125;,
&quot;custom_data&quot;: &#123;
   &quot;currency&quot;: &quot;USD&quot;
&#125;,
&quot;app_data&quot;: &#123;
   &quot;advertiser_tracking_enabled&quot;: 1,
   &quot;application_tracking_enabled&quot;: 1,
   &quot;extinfo&quot;: [
      &quot;a2&quot;,
      &quot;com.some.app&quot;,
      &quot;771&quot;,
      &quot;Version 7.7.1&quot;,
      &quot;10.1.1&quot;,
      &quot;OnePlus6&quot;,
      &quot;en_US&quot;,
      &quot;GMT-1&quot;,
      &quot;TMobile&quot;,
      &quot;1920&quot;,
      &quot;1080&quot;,
      &quot;2.00&quot;,
      &quot;2&quot;,
      &quot;128&quot;,
      &quot;8&quot;,
      &quot;USA/New York&quot;
   ],
     &quot;campaign_ids&quot;: &quot;AUBTPkAuPZYrefWv3HxQlsVj22m-0Um2S0SSz5YGtsS1kfL69tCYV3ZW6AcnDbOTfosAGdlS75pIjJwvZuQcG6U_agg_&#123;\&quot;credential\&quot;:\&quot;NjZkOTNiNzg1OGMxMTM1YTFlNzJmNzJkMWY3ZTg3NThjYmEzMmVkZmJjOTBhMTBkMWM3MzMwZjE5NDU2YTVjNA\&quot;,\&quot;shared_secret\&quot;:\&quot;lhi2YQputCEV9wXQ2VzB-2Nq2lbDwn20VSrAOqOfmSkJPFPwLL8OI0XvdSuTfehygVorj_RQBRKr8pMnix_HKw\&quot;,\&quot;key_version\&quot;:97&#125;&quot;
&#125;,
&quot;user_data&quot;: &#123;
   &quot;fbc&quot;: &quot;fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890&quot;,
   &quot;madid&quot;: &quot;AECE52E7-03EE-455A-B3C4-E57283966239&quot;,
   &quot;client_ip_address&quot;: &quot;168.212.226.204&quot;,
   &quot;em&quot;: &quot;62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f&quot;,
   &quot;ph&quot;: &quot;e323ec626319ca94ee8bff2e4c87cf613be6ea19919ed1364124e16807ab3176&quot;,
   &quot;external_id&quot;: &quot;114351fd7c547295ed4c7cf61c79e3e1e648930ccbda923e394a7914864682db114351fd7c547295ed4c7cf61c79e3e1e648930ccbda923e394a7914864682db&quot;
  &#125;
&#125;
```

## See also

* [AppendAttribution integration guide](https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/append-attribution)
* [Conversions API Payload Helper](https://developers.facebook.com/documentation/ads-commerce/conversions-api/payload-helper)
* [Conversions API Server Event Parameters](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event)
* [Conversions API Customer Information Parameters](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters)
* [Conversions API App Data Parameters](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/app-data)
