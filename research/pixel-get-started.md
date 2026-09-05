# Get Started



The Meta Pixel is a snippet of JavaScript code that loads a small library of functions you can use to track Facebook ad-driven visitor activity on your website. It relies on [Facebook cookies](https://www.facebook.com/policies/cookies/), which enable us to match your website visitors to their respective Facebook User accounts. Once matched, we can tally their actions in the Facebook Ads Manager so you can use the data to analyze your website&#039;s conversion flows and optimize your ad campaigns.

By default, the Pixel will track URLs visited, domains visited, and the devices your visitors use. In addition, you can use the Pixel&#039;s library of functions to:

* [track conversions](https://developers.facebook.com/documentation/meta-pixel/implementation/conversion-tracking), so you can measure ad effectiveness
* define [custom audiences](https://developers.facebook.com/documentation/meta-pixel/implementation/custom-audiences), so you can target visitors who are more likely to convert
* set up [Advantage+ catalog ads](https://developers.facebook.com/docs/facebook-pixel/implementation/dynamic-ads) campaigns

### Requirements

In order to implement the Pixel, you will need:

- access to your website&#039;s code base
- your Pixel&#039;s [base code](https://developers.facebook.com/documentation/meta-pixel/get-started) or its ID
- access to the [Facebook Ads Manager](https://www.facebook.com/adsmanager)

In addition, depending on where you conduct business, you may have to comply with [General Data Protection Regulation](https://developers.facebook.com/documentation/meta-pixel/implementation/gdpr).

Ready? [Let&#039;s get started](https://developers.facebook.com/documentation/meta-pixel/get-started).

## Base Code

Before you can install the Pixel, you will need your Pixel&#039;s base code, which you can find in the [Ads Manager &gt; Events Manager](https://business.facebook.com/events_manager). If you have not created a Pixel, [follow these instructions](https://www.facebook.com/business/help/952192354843755) to create one — all you will need is the Pixel&#039;s base code (step 1).

The base Pixel code contains your Pixel&#039;s ID in two places and looks like this:

```
&lt;!-- Facebook Pixel Code --&gt;
&lt;script&gt;
  !function(f,b,e,v,n,t,s)
  &#123;if(f.fbq)return;n=f.fbq=function()&#123;n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)&#125;;
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version=&#039;2.0&#039;;
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)&#125;(window, document,&#039;script&#039;,
  &#039;https://connect.facebook.net/en_US/fbevents.js&#039;);
  fbq(&#039;init&#039;, &#039;&#123;your-pixel-id-goes-here&#125;&#039;);
  fbq(&#039;track&#039;, &#039;PageView&#039;);
&lt;/script&gt;
&lt;noscript&gt;
  &lt;img height=&quot;1&quot; width=&quot;1&quot; style=&quot;display:none&quot;
       src=&quot;https://www.facebook.com/tr?id=&#123;your-pixel-id-goes-here&#125;&amp;ev=PageView&amp;noscript=1&quot;/&gt;
&lt;/noscript&gt;
&lt;!-- End Facebook Pixel Code --&gt;
```

When run, this code will download a library of functions which you can then use for [conversion tracking](https://developers.facebook.com/documentation/meta-pixel/implementation/conversion-tracking). It also automatically tracks a single `PageView` conversion by calling the `fbq()` function each time it loads. _We recommend that you leave this function call intact_.

## Installing The Pixel &#123;#installing-the-pixel&#125;

To install the Pixel, we highly recommend that you add its base code between the opening and closing `&lt;head&gt;` tags on every page where you will be tracking website visitor actions. Most developers add it to their website&#039;s persistent header, so it can be used on all pages.

Placing the code within your `&lt;head&gt;` tags reduces the chances of browsers or third-party code blocking the Pixel&#039;s execution. It also executes the code sooner, increasing the chance that your visitors are tracked before they leave your page.

Once you have added it to your website, load a page that has the Pixel. This should call `fbq(&#039;track&#039;, &#039;PageView&#039;)`, which will be tracked as a `PageView` event in the Events Manager.

Verify that this event was tracked by going to your Events Manager. Locate your Pixel and click its details — if you see a new `PageView` event, you have successfully installed the Pixel. If you do not see it, wait a few minutes and refresh the page. If your Pixel is still not working, use the [Pixel Helper](#pixel-helper) to track down the problem.

### Installing Using a Tag Manager &#123;#tag-manager&#125;

Although we recommend adding the Pixel directly to your website&#039;s `&lt;head&gt;` tags, the Pixel will work in most tag management and tag container solutions. For specific advice on implementing the Pixel using your tag manager, please refer to your tag manager&#039;s documentation.

### Installing Using an IMG Tag &#123;#img-tag&#125;

Although not recommended, you can alternately [install the Pixel using an `&lt;img&gt;` tag](https://developers.facebook.com/documentation/meta-pixel/advanced#installing-the-pixel-using-an-img-tag).

### Mobile Websites

If your mobile website is separate from your desktop website, we recommend that you add the Pixel to both. This will allow you to easily remarket to your mobile visitors, exclude them, or create lookalikes audiences.

## Pixel Helper

We highly recommend that you install our [Pixel Helper](https://developers.facebook.com/documentation/meta-pixel/support/pixel-helper) Chrome extension. The Pixel Helper provides extremely valuable feedback that can help you verify that your Pixel is working correctly, especially when you start tracking conversions, where you can easily encounter formatting errors.

## Next Steps

Once you have verified that the Pixel is installed and tracking the `PageView` event correctly, you can use the Pixel to:

* [track conversions](https://developers.facebook.com/documentation/meta-pixel/implementation/conversion-tracking)
* create [custom audiences](https://developers.facebook.com/documentation/meta-pixel/implementation/custom-audiences)
* set up [Advantage+ catalog ads](https://developers.facebook.com/docs/facebook-pixel/implementation/dynamic-ads)

Learn more about implementing the Pixel with [Blueprint](https://www.facebookblueprint.com/student/collection/240330/path/210139?content_id=yyTGMzFI48JBDxv).

## Resources

* Meta Blueprint: [Learn more about implementing the pixel](https://www.facebookblueprint.com/student/path/219710-technical-implementation-meta-pixel?content_id=en4RqCL2PfBZrUU)
