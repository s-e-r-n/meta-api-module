# Conversion Tracking



You can use the Meta Pixel to track your website visitors&#039; actions also known as conversion tracking. Tracked conversions appear in the [Facebook Ads Manager](https://www.facebook.com/adsmanager) and the [Facebook Events Manager](https://www.facebook.com/events_manager2), where they can be used to analyze the effectiveness of your conversion funnel and to calculate your return on ad investment. You can also use tracked conversions to define [custom audiences](https://developers.facebook.com/documentation/meta-pixel/implementation/custom-audiences) for ad optimization and [Advantage+ catalog ads](https://developers.facebook.com/docs/facebook-pixel/implementation/dynamic-ads) campaigns. Once you have defined custom audiences, we can use them to identify other Facebook users who are likely to convert and target them with your ads.

There are three ways to track conversions with the Pixel:

- [standard events](#standard-events), which are visitor actions that we have defined and that you report by calling a Pixel function
- [custom events](#custom-events), which are visitor actions that you have defined and that you report by calling a Pixel function
- [custom conversions](#custom-conversions), which are visitor actions that are tracked automatically by parsing your website&#039;s referrer URLs

**Warning:** Beginning September 2, 2025, we will start to roll out more proactive restrictions on custom conversions that may suggest information not permitted under [our terms](https://www.facebook.com/legal/terms/businesstools?_rdr). For example, any custom conversion suggesting specific health conditions (e.g., &quot;arthritis&quot;, &quot;diabetes&quot;) or financial status (e.g., &quot;credit score&quot;, &quot;high income&quot;) will be flagged and prevented from being used to run ad campaigns.

**What these restrictions mean for your campaigns:**

* You won’t be able to use flagged custom conversions when creating new campaigns.
* If you have an active campaign using flagged custom conversions, you should either create a new campaign or duplicate your campaign and use a non-impacted custom conversion to avoid performance and optimization issues.

**For API developers:**

* Beginning September 2, 2025, the field `is_unavailable` will return `true` to signal if your custom conversions have been flagged.

More information on this update and how to resolve flagged custom conversions can be found [here](https://www.facebook.com/business/help/2455915321411996).

### Requirements

The Pixel&#039;s [base code](https://developers.facebook.com/documentation/meta-pixel/get-started#base-code) must already be installed on every page where you want to track conversions.

## Standard Events &#123;#standard-events&#125;

[Standard events](https://developers.facebook.com/documentation/meta-pixel/reference#standard-events) are predefined visitor actions that correspond to common, conversion-related activities, such as searching for a product, viewing a product, or purchasing a product. Standard events support [parameters](#parameters), which allow you to include an object containing additional information about an event, such as product IDs, categories, and the number of products purchased.

For a full list of [Standard events](https://developers.facebook.com/documentation/meta-pixel/reference#standard-events) visit the [Pixel Standard Events Reference](https://developers.facebook.com/documentation/meta-pixel/reference#standard-events). Learn more about conversion tracking and standard events with [Blueprint](https://www.facebookblueprint.com/student/path/219710-technical-implementation-meta-pixel?content_id=en4RqCL2PfBZrUU).  

### Tracking Standard Events

All standard events are tracked by calling the Pixel&#039;s `fbq(&#039;track&#039;)` function, with the event name, and (optionally) a JSON object as its parameters. For example, here&#039;s a function call to track when a visitor has completed a purchase event, with currency and value included as a parameter:

```js
fbq(&#039;track&#039;, &#039;Purchase&#039;, &#123;currency: &quot;USD&quot;, value: 30.00&#125;);
```

If you called that function, it would be tracked as a purchase event in the Events Manager:

You can call the `fbq(&#039;track&#039;)` function anywhere between your web page&#039;s opening and closing `&lt;body&gt;` tags, either when the page loads, or when a visitor completes an action, such as clicking a button.

For example, if you wanted to track a standard purchase event _after a visitor has completed the purchase_, you could call the `fbq(&#039;track&#039;)` function on your _purchase confirmation page_, like this:

```js
&lt;body&gt;
  ...
  &lt;script&gt;
    fbq(&#039;track&#039;, &#039;Purchase&#039;, &#123;currency: &quot;USD&quot;, value: 30.00&#125;);
  &lt;/script&gt;
  ...
&lt;/body&gt;
```

If instead you wanted to track a standard purchase event _when the visitor clicks a purchase button_, you could tie the `fbq(&#039;track&#039;)` function call to the purchase button _on your checkout page_, like this:

```js
&lt;button id=&quot;addToCartButton&quot;&gt;Purchase&lt;/button&gt;
&lt;script type=&quot;text/javascript&quot;&gt;
  $(&#039;#addToCartButton&#039;).click(function() &#123;
    fbq(&#039;track&#039;, &#039;Purchase&#039;, &#123;currency: &quot;USD&quot;, value: 30.00&#125;);
  &#125;);
&lt;/script&gt;
```

Note that the example above uses jQuery to trigger the function call, but you could trigger the function call using any method you wish.

## Custom Events &#123;#custom-events&#125;

If our predefined standard events aren&#039;t suitable for your needs, you can track your own custom events, which also can be used to define [custom audiences](https://developers.facebook.com/documentation/meta-pixel/implementation/custom-audiences) for ad optimization. Custom events also support [parameters](#parameters), which you can include to provide additional information about each custom event.

Learn more about conversion tracking and custom events with [Blueprint](https://www.facebookblueprint.com/student/path/219710-technical-implementation-meta-pixel?content_id=en4RqCL2PfBZrUU).

### Tracking Custom Events

You can track custom events by calling the Pixel&#039;s `fbq(&#039;trackCustom&#039;)` function, with your custom event name and (optionally) a JSON object as its parameters. Just like standard events, you can call the `fbq(&#039;trackCustom&#039;)` function anywhere between your webpage&#039;s opening and closing `&lt;body&gt;` tags, either when your page loads, or when a visitor performs an action like clicking a button.

For example, let&#039;s say you wanted to track visitors who share a promotion in order to get a discount. You could track them using a custom event like this:

```js
fbq(&#039;trackCustom&#039;, &#039;ShareDiscount&#039;, &#123;promotion: &#039;share_discount_10%&#039;&#125;);
```

Custom event names must be strings, and cannot exceed 50 characters in length.

## Custom Conversions &#123;#custom-conversions&#125;

Each time the Pixel loads, it automatically calls `fbq(&#039;track&#039;, &#039;PageView&#039;)` to track a PageView standard event. PageView standard events record the referrer URL of the page that triggered the function call. You can use these recorded URLs in the Events Manager to define visitor actions that should be tracked.

For example, let&#039;s say that you send visitors who subscribe to your mailing list to a thank you page. You could set up a custom conversion that tracks website visitors who have viewed any page that has `/thank-you` in its URL. Assuming your thank you page is the only page with `/thank-you` in its URL, and you&#039;ve installed the Pixel on that page, anyone who views it will be tracked using that custom conversion.

Once tracked, custom conversions can be used to optimize your ad campaigns, to define [custom audiences](https://developers.facebook.com/documentation/meta-pixel/implementation/custom-audiences), and to further refine custom audiences that rely on standard or custom events. Learn more about custom conversions with [Blueprint](https://www.facebookblueprint.com/student/path/219710-technical-implementation-meta-pixel?content_id=en4RqCL2PfBZrUU).

Since custom conversions rely on complete or partial URLs, you should make sure that you can define visitor actions exclusively based on unique strings in your website URLs.

### Creating Custom Conversions

Custom conversions are created entirely within the Events Manager. Refer to our [Advertiser Help document](https://www.facebook.com/business/help/434245993430255) to learn how.

### Rule-Based Custom Conversions

Optimize for actions and track them without adding anything to your Meta Pixel base code. You can do this beyond the 17 standard events.

1. Create a custom conversion at `/&#123;AD_ACCOUNT_ID&#125;/customconversions`.
2. Specify a URL, or partial URL, representing an event in `pixel_rule`. For example, `thankyou.html` is a page appearing after purchase.

This records a `PURCHASE` conversion when `&#039;thankyou.html&#039;` displays:

You can then create your campaign using the `CONVERSIONS` objective.

At the ad set level, specify the same custom conversion (`pixel_id`, `pixel_rule`, `custom_event_type`) in `promoted_object`.

### Custom Conversions Insights
[Ads Insights](https://developers.facebook.com/docs/marketing-api/insights-api) returns information about Custom Conversions:

```
curl -i -G \
-d &#039;fields=actions,action_values&#039; \
-d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
https://graph.facebook.com/v2.7/&lt;AD_ID&gt;/insights
```

Returns both standard and custom conversions:

```
&#123;
  &quot;data&quot;: [
    &#123;
      &quot;actions&quot;: [
        &#123;
          &quot;action_type&quot;: &quot;offsite_conversion.custom.17067367629523&quot;,
          &quot;value&quot;: 1225
        &#125;,
        &#123;
          &quot;action_type&quot;: &quot;offsite_conversion.fb_pixel_purchase&quot;,
          &quot;value&quot;: 205
        &#125;
      ],
      &quot;action_values&quot;: [
        &#123;
          &quot;action_type&quot;: &quot;offsite_conversion.custom.1706736762929507&quot;,
          &quot;value&quot;: 29390.89
        &#125;,
        &#123;
          &quot;action_type&quot;: &quot;offsite_conversion.fb_pixel_purchase&quot;,
          &quot;value&quot;: 29390.89
        &#125;
      ],
      &quot;date_start&quot;: &quot;2016-07-28&quot;,
      &quot;date_stop&quot;: &quot;2016-08-26&quot;
    &#125;
  ],
  &quot;paging&quot;: &#123;
    &quot;cursors&quot;: &#123;
      &quot;before&quot;: &quot;MAZDZD&quot;,
      &quot;after&quot;: &quot;MjQZD&quot;
    &#125;,
    &quot;next&quot;: &quot;https://graph.facebook.com/v2.7/&lt;AD_ID&gt;/insights?access_token=&lt;ACCESS_TOKEN&gt;&amp;pretty=0&amp;fields=actions%2Caction_values&amp;date_preset=last_30_days&amp;level=adset&amp;limit=25&amp;after=MjQZD&quot;
  &#125;
&#125;
```

Custom conversions have unique IDs; query it for a specific conversion, such as a rule-based one:

```
curl -i -G \
-d &#039;fields=name,pixel,pixel_aggregation_rule&#039; \
-d &#039;access_token=ACCESS-TOKEN&#039; \
https://graph.facebook.com/v2.7/&lt;CUSTOM_CONVERSION_ID&gt;
```

### Custom Conversions Limitations

The maximum number of custom conversions per ad account is 100. If you use Ads Insights API to get metrics on custom conversions:

- Getting product ID breakdowns are not supported.
- Getting unique action counts are not supported.

### Flagged custom conversions

If a custom conversion is flagged, the `is_unavailable` field will be set to `true`.

```html
&#123;
  &quot;is_unavailable&quot;: true,
  &quot;id&quot;: &quot;30141209892193360&quot;
&#125;
```

#### To resolve flagged custom conversions

If any of your custom conversions are flagged for suggesting information that is not allowed under our terms, you may want to consider the following options:

To resolve a flagged custom conversion in a new campaign creation:

* **Create new custom conversion**: Use a new custom conversion and make sure that it does not include information that is not allowed under our terms.
* **Choose a different custom conversion**: Select a different existing custom conversion and make sure it does not include information that is not allowed under our terms.

To resolve a flagged custom conversion in an existing campaign:

* **Duplicate your campaign and select an existing custom conversion**: If you have a running campaign that is flagged due to a flagged custom conversion, consider duplicating the campaign and selecting a different custom conversion that is not flagged before publishing the new duplicated campaign. **Note:** Once the campaign is published, you cannot remove or select a different custom conversion.

#### Request a review

If you believe your custom conversion has been flagged in error and doesn&#039;t include non-permitted information, you can request a review via Ads Manager under the campaigns table, or in Events Manager under the custom conversions page.

## Track Offsite Conversions

Track offsite conversions with your Pixels by adding the `fb_pixel` field to the `tracking_spec` parameter of your ad. [Learn more.](https://developers.facebook.com/documentation/ads-commerce/marketing-api/tracking-specs)

## Parameters

Parameters are optional, JSON-formatted objects that you can include when tracking standard and custom events. They allow you to provide additional information about your website visitors&#039; actions. Once tracked, parameters can be used to further define any custom audiences you create. Learn more about parameters with [Blueprint](https://www.facebookblueprint.com/student/path/219710-technical-implementation-meta-pixel?content_id=en4RqCL2PfBZrUU).

To include a parameter object with a standard or custom event, format your parameter data as an object using JSON, then include it as the third function parameter when calling the `fbq(&#039;track&#039;)` or `fbq(&#039;trackCustom&#039;)` functions.

For example, let&#039;s say you wanted to track a visitor who purchased multiple products as a result of your promotion. You could do this:

```js
fbq(&#039;track&#039;, &#039;Purchase&#039;,
  // begin parameter object data
  &#123;
    value: 115.00,
    currency: &#039;USD&#039;,
    contents: [
      &#123;
        id: &#039;301&#039;,
        quantity: 1
      &#125;,
      &#123;
        id: &#039;401&#039;,
        quantity: 2
      &#125;],
    content_type: &#039;product&#039;
  &#125;
  // end parameter object data
);
```

Note that if you want to use data included in event parameters when defining custom audiences, **key values must not contain any spaces**.

### Object Properties &#123;#object-properites&#125;

You can include the following predefined object properties with any custom events and any [standard events that support them](#standard-events). Format your parameter object data using JSON.

| Property Key | Value Type | Parameter Description |
| --- | --- | --- |
| `content_category` | string | Category of the page or product. |
| `content_ids` | array of integers or strings | Product IDs associated with the event, such as SKUs. Example: `[&#039;ABC123&#039;, &#039;XYZ789&#039;]`. |
| `content_name` | string | Name of the page/product. |
| `content_type` | string | Can be `product` or `product_group` based on the `content_ids` or `contents` being passed. If the IDs being passed in the `content_ids` or `contents` parameter are IDs of products, then the value should be `product`. If product group IDs are being passed, then the value should be `product_group`. |
| `contents` | array of objects | Array of JSON objects that contains the International Article Number (EAN) when applicable or other product or content identifier(s) associated with the event, and quantities and prices of the products. **Required**: `id` and `quantity`.&lt;br&gt;&lt;br&gt;Example: `[&#123;&#039;id&#039;: &#039;ABC123&#039;, &#039;quantity&#039;: 2&#125;, &#123;&#039;id&#039;: &#039;XYZ789&#039;, &#039;quantity&#039;: 2&#125;]` |
| `currency` | string | Currency for the `value` specified. |
| `delivery_category` | string | Category of the delivery. Supported values:&lt;br&gt;&lt;br&gt;* `in_store` — Purchase requires customer to enter to the store.&lt;br&gt;* `curbside` — Purchase requires curbside pickup&lt;br&gt;* `home_delivery` — Purchase is delivered to the customer. |
| `num_items` | integer | Number of items when checkout was initiated. Used with the `InitiateCheckout` event. |
| `predicted_ltv` | integer, float | Predicted lifetime value of a subscriber as defined by the advertiser and expressed as an exact value. |
| `search_string` | string | String entered by the user for the search. Used with the `Search` event. |
| `status` | Boolean | Used with the `CompleteRegistration` event, to show the status of the registration. |
| `value` | integer or float | Required for purchase events or any events that utilize value optimization. A numeric value associated with the event. This must represent a monetary amount. |

### Custom Properties &#123;#custom-properties&#125;

If our predefined object properties don&#039;t suit your needs, you can include your own, custom properties. Custom properties can be used with both standard and custom events, and can help you further define custom audiences.

For example, let&#039;s say you wanted to track a visitor who purchased multiple products after having first compared them to other products. You could do this:

```js
fbq(&#039;track&#039;, &#039;Purchase&#039;,
  // begin parameter object data
  &#123;
    value: 115.00,
    currency: &#039;USD&#039;,
    contents: [
      &#123;
        id: &#039;301&#039;,
        quantity: 1
      &#125;,
      &#123;
        id: &#039;401&#039;,
        quantity: 2
      &#125;],
    content_type: &#039;product&#039;,
    compared_product: &#039;recommended-banner-shoes&#039;,  // custom property
    delivery_category: &#039;in_store&#039;
  &#125;
  // end parameter object data
);
```

## Next Steps

Now that you&#039;re tracking conversions, we recommend that you use them to define [custom audiences](https://developers.facebook.com/documentation/meta-pixel/implementation/custom-audiences), so you can optimize your ads for website conversions.

## Learn More

* Learn more about conversion tracking with [Blueprint](https://www.facebookblueprint.com/student/path/219710-technical-implementation-meta-pixel?content_id=en4RqCL2PfBZrUU).
