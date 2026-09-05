# &quot;Integration Guidance: Value Optimization&quot;



## Overview
Value optimization works for all standard and custom events on the Sales objective.

## Requirements

Value and currency should be added to existing events you want to use value optimization for. If you use the Meta Pixel and the Conversions API, ensure that the parameters are added to both sources and are consistent across both sources.

### Definitions

**Value**: A numerical figure associated with an event. The value should be correlated to your true business goal. Monetary value is often considered a high-quality form of value representation, since most advertisers prioritize revenue-based outcomes. However, this value can also be represented as estimated monetary value, or other metrics that advertisers identify as key performance indicators of business objectives. Our system values conversions proportional to the value that is passed back. Conversions with higher values result in proportionally better business outcomes relative to conversions with lower values.

**Currency**: The unit or standard used to express the value specified. Currency must be a valid [ISO 4217 three-digit currency code](https://en.wikipedia.org/wiki/ISO_4217?fbclid=IwZXh0bgNhZW0CMTEAYnJpZBExeHhJMTRGYjFUUmE3aVViSXNydGMGYXBwX2lkATAAAR4ELaZs81nuJYQYO9QJQYBwxvP1N8sEiUrdDuYFB_3Yqmtppqz-LnJBDbp5fg_aem___3fT6InHtjRw8gMI1gSrA).

## Meta Pixel  

Modify your existing event to include the value and currency parameters.

```
fbq(&quot;track&quot;, &quot;&lt;EVENT_NAME&gt;&quot;, &#123;
value: 10.00,
currency: &quot;USD&quot;
&#125;);
```

## Conversions API

Include the value and currency in the `custom_data` parameter in your Conversions API payload. [Refer to the Payload Helper](https://developers.facebook.com/documentation/ads-commerce/conversions-api/payload-helper) if you need to generate an example payload.

```
&#123;
    &quot;data&quot;: [
        &#123;
            &quot;event_name&quot;: &quot;&lt;EVENT_NAME&gt;&quot;,
            ... // Example does not include all required CAPI parameters
            &quot;custom_data&quot;: &#123;
                &quot;currency&quot;: &quot;USD&quot;,
                &quot;value&quot;: &quot;142.52&quot;
            &#125;
        &#125;
    ]
&#125;
```

For app integrations, please refer to these SDK integration guides:

* [Get Started with App Events (Android)](https://developers.facebook.com/docs/app-events/getting-started-app-events-android)
* [Get Started with App Events (iOS)](https://developers.facebook.com/docs/app-events/getting-started-app-events-ios)

Conversions API integration guide:

* [Conversions API for App Events](https://developers.facebook.com/documentation/ads-commerce/conversions-api/app-events)

If you want to use catalog features with value optimization, please refer to this guide:

* [Meta Pixel for Advantage+ Catalog Ads](https://developers.facebook.com/docs/meta-pixel/get-started/advantage-catalog-ads)

