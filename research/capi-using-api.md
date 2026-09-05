# Using the API



Once you have completed the prerequisites on the [Get Started](https://developers.facebook.com/documentation/ads-commerce/conversions-api/get-started) page, use this page to learn how to send events and use the Test Events tool. Once you&#039;ve sent an event, [verify your setup](https://developers.facebook.com/documentation/ads-commerce/conversions-api/verifying-setup).

The Conversions API is based on Facebook&#039;s [Marketing API](https://developers.facebook.com/documentation/ads-commerce/marketing-api), which was built on top of our [Graph API](https://developers.facebook.com/docs/graph-api). Marketing and Graph APIs have different version deprecation schedules. Our release cycle is aligned with the [Graph API](https://developers.facebook.com/docs/graph-api/changelog), so every version is supported for at least two years. This exception is only valid for the Conversions API.

[Conversions API: Overview](https://developers.facebook.com/documentation/ads-commerce/conversions-api)

[Parameters](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters)

**Note:** Web, app, and physical store events shared using the Conversions API require specific parameters. By using the Conversions API, you agree that the [`action_source`](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event#action-source) parameter is accurate to the best of your knowledge. The list of [required parameters is available here](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters).

## Send Requests &#123;#send&#125;

To send new events, make a `POST` request to this API&#039;s `/events` edge from this path: `https://graph.facebook.com/&#123;API_VERSION&#125;/&#123;PIXEL_ID&#125;/events?access_token=&#123;TOKEN&#125;`. When you post to this edge, Facebook creates new server events.

```html
curl -X POST \
  -F &#039;data=[
       &#123;
         &quot;event_name&quot;: &quot;Purchase&quot;,
         &quot;event_time&quot;: 1762902353,
         &quot;user_data&quot;: &#123;
           &quot;em&quot;: [
             &quot;309a0a5c3e211326ae75ca18196d301a9bdbd1a882a4d2569511033da23f0abd&quot;
           ],
           &quot;ph&quot;: [
             &quot;254aa248acb47dd654ca3ea53f48c2c26d641d23d7e2e93a1ec56258df7674c4&quot;,
             &quot;6f4fcb9deaeadc8f9746ae76d97ce1239e98b404efe5da3ee0b7149740f89ad6&quot;
           ],
           &quot;client_ip_address&quot;: &quot;123.123.123.123&quot;,
           &quot;client_user_agent&quot;: &quot;$CLIENT_USER_AGENT&quot;,
           &quot;fbc&quot;: &quot;fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890&quot;,
           &quot;fbp&quot;: &quot;fb.1.1558571054389.1098115397&quot;
         &#125;,
         &quot;custom_data&quot;: &#123;
           &quot;currency&quot;: &quot;usd&quot;,
           &quot;value&quot;: 123.45,
           &quot;contents&quot;: [
             &#123;
               &quot;id&quot;: &quot;product123&quot;,
               &quot;quantity&quot;: 1,
               &quot;delivery_category&quot;: &quot;home_delivery&quot;
             &#125;
           ]
         &#125;,
         &quot;event_source_url&quot;: &quot;http://jaspers-market.com/product/123&quot;,
         &quot;action_source&quot;: &quot;website&quot;
       &#125;
     ]&#039; \
  -F &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
https://graph.facebook.com/v25.0/&lt;PIXEL_ID&gt;/events
```

Attach your generated secure access token using the `access_token` query parameter to the request. You can also use [Graph API Explorer](https://developers.facebook.com/tools/explorer/?method=POST&amp;path=%7BPIXEL_ID%7D%2Fevents%2F&amp;version=v3.2) to `POST` to the `/&lt;pixel_id&gt;/events` endpoint.

An example request body looks like this:

```
&#123;
   &quot;data&quot;: [
      &#123;
         &quot;event_name&quot;: &quot;Purchase&quot;,
         &quot;event_time&quot;: 1633552688,
         &quot;event_id&quot;: &quot;event.id.123&quot;,
         &quot;event_source_url&quot;: &quot;http:\/\/jaspers-market.com\/product\/123&quot;,
         &quot;action_source&quot;: &quot;website&quot;,
         &quot;user_data&quot;: &#123;
            &quot;client_ip_address&quot;: &quot;192.19.9.9&quot;,
            &quot;client_user_agent&quot;: &quot;test ua&quot;,
            &quot;em&quot;: [
               &quot;309a0a5c3e211326ae75ca18196d301a9bdbd1a882a4d2569511033da23f0abd&quot;
            ],
            &quot;ph&quot;: [
               &quot;254aa248acb47dd654ca3ea53f48c2c26d641d23d7e2e93a1ec56258df7674c4&quot;,
               &quot;6f4fcb9deaeadc8f9746ae76d97ce1239e98b404efe5da3ee0b7149740f89ad6&quot;
            ],
            &quot;fbc&quot;: &quot;fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890&quot;,
            &quot;fbp&quot;: &quot;fb.1.1558571054389.1098115397&quot;
         &#125;,
         &quot;custom_data&quot;: &#123;
            &quot;value&quot;: 100.2,
            &quot;currency&quot;: &quot;USD&quot;,
            &quot;content_ids&quot;: [
               &quot;product.id.123&quot;
            ],
            &quot;content_type&quot;: &quot;product&quot;
         &#125;,
         &quot;opt_out&quot;: false
      &#125;,
      &#123;
         &quot;event_name&quot;: &quot;Purchase&quot;,
         &quot;event_time&quot;: 1633552688,
         &quot;user_data&quot;: &#123;
            &quot;client_ip_address&quot;: &quot;192.88.9.9&quot;,
            &quot;client_user_agent&quot;: &quot;test ua2&quot;
         &#125;,
         &quot;custom_data&quot;: &#123;
            &quot;value&quot;: 50.5,
            &quot;currency&quot;: &quot;USD&quot;
         &#125;,
         &quot;opt_out&quot;: false
      &#125;
   ]
&#125;
```

### Upload Time versus Event Transaction Time &#123;#event-transaction-time&#125;

[`event_time`](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event#event-time) is the event transaction time. It should be sent as a Unix timestamp in seconds indicating when the actual event occurred. The specified time **may be earlier than the time you send the event to Facebook**. This is to enable batch processing and server performance optimization.

The [`event_time`](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event#event-time) can be up to 7 days before you send an event to Meta. If any `event_time` in `data` is greater than 7 days in the past, we return an error for the entire request and process no events. For offline and physical store events with `physical_store` as `action_source`, you should upload transactions within 62 days of the conversion.

**Warning:** By using the Conversions API, you agree that the [`action_source`](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event#action-source) parameter is accurate to the best of your knowledge.

### Batch Requests &#123;#batch-requests&#125;
You can send up to 1,000 events in `data`. However, for optimal performance, we recommend you send events as soon as they occur and ideally within an hour of the event occurring. **If any event you send in a batch is invalid, we reject the entire batch.**

### Hashing
Please check our [customer information parameters](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters) page to see which parameters should be hashed before they are sent to Facebook. If you are using one of our [Business SDKs](https://developers.facebook.com/docs/business-sdk), the hashing is done for you by the SDK.

### [Business SDK Features for Conversions API](https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/business-sdk-features)

Learn more about three specific Business SDK features designed especially for Conversions API users: [Asynchronous Requests](https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/business-sdk-features#asynchronous-requests), [Concurrent Batching](https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/business-sdk-features#concurrent-batching), and [HTTP Service Interface](https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/business-sdk-features#http-service-interface). Minimum language version required to use these features:

- PHP &gt;= 7.2
- Node.js &gt;= 7.6.0
- Java &gt;= 8
- Python &gt;= 2.7
- Ruby &gt;= 2

**Note:** Business SDK support for PHP 5 has been deprecated since January 2019. Please upgrade to PHP 7 to use the Business SDK.

[Conversions API Parameters](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters)

## Verify Events &#123;#verify&#125;

After you send your events, confirm that we have received them in [Events Manager](https://www.facebook.com/events_manager2/list):

- On the **Data Sources** page, click on the Pixel corresponding to the `PIXEL_ID` in your `POST` request. For more information see [Business Help Center: Navigate Events Manager](https://www.facebook.com/business/help/898185560232180).
- Then, click **Overview**. You see the number of raw, matched and attributed events we received. Under **Connection Method**, you see the channel in which that event was sent.

- You can click on each event to get more specific information.

- After you start sending events, you should be able to verify them within 20 minutes. Now you can start sending events from your server.

## Test Events Tool &#123;#testEvents&#125;  
You can verify that your server events are received correctly by Facebook by using the Test Events feature in Events Manager. To find the tool, go to `Events Manager &gt; Data Sources &gt; Your Pixel &gt; Test Events`.

The Test Events tool generates a test ID. Send the test ID as a `test_event_code` parameter to start seeing event activity appear in the Test Events window.

**Note:** **Note**: The `test_event_code` field should be used only for testing. You need to remove it when sending your production payload.

Events sent with `test_event_code` are not dropped. They flow into Events Manager and are used for targeting and ads measurement purposes.

Here&#039;s an example of how the request should be structured:

```json
&#123;
   &quot;data&quot;: [
      &#123;
         &quot;event_name&quot;: &quot;ViewContent&quot;,
         &quot;event_time&quot;: 1764975551,
         &quot;event_id&quot;: &quot;event.id.123&quot;,
         &quot;event_source_url&quot;: &quot;http:\/\/jaspers-market.com&quot;,
         &quot;user_data&quot;: &#123;
            &quot;client_ip_address&quot;: &quot;1.2.3.4&quot;,
            &quot;client_user_agent&quot;: &quot;test user agent&quot;
         &#125;
      &#125;
   ],
   &quot;test_event_code&quot;: &quot;TEST123&quot;
&#125;
```

Here&#039;s an example of how the request appears in Graph API Explorer:

**Warning:** You can generate this test payload using the [**Payload Helper tool**](https://developers.facebook.com/documentation/ads-commerce/conversions-api/payload-helper). Please note that the test event code is only for testing payload.

Your server events appear in the Test Events window once the request is sent.

## [Data Processing Options](https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/data-processing-options) for US Users

For these two APIs, implement data processing options by adding `data_processing_options`, `data_processing_options_country`, and `data_processing_options_state` inside each event within the [data parameter](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/main-body#data) of your events.

**Note:** The App Events and Offline Conversions APIs are no longer recommended for new integrations. Instead, it is recommended that you use the Conversions API as it now supports web, app, and offline events. See [Conversions API for App Events](https://developers.facebook.com/documentation/ads-commerce/conversions-api/app-events) and [Conversions API for Offline Events](https://developers.facebook.com/documentation/ads-commerce/conversions-api/offline-events) for more information.

To explicitly not enable Limited Data Use (LDU), specify an empty array for each event or simply remove the field in the payload:

```
&#123;
    &quot;data&quot;: [
        &#123;
            &quot;event_name&quot;: &quot;Purchase&quot;,
            &quot;event_time&quot;: &lt;EVENT_TIME&gt;,
            &quot;user_data&quot;: &#123;
                &quot;em&quot;: &quot;&lt;EMAIL&gt;&quot;
            &#125;,
            &quot;custom_data&quot;: &#123;
                &quot;currency&quot;: &quot;&lt;CURRENCY&gt;&quot;,
                &quot;value&quot;: &quot;&lt;VALUE&gt;&quot;
            &#125;,
            &quot;data_processing_options&quot;: []
        &#125;
    ]
&#125;
```

To enable LDU and have Meta perform geolocation:

```
&#123;
    &quot;data&quot;: [
        &#123;
            &quot;event_name&quot;: &quot;Purchase&quot;,
            &quot;event_time&quot;: &lt;EVENT_TIME&gt;,
            &quot;user_data&quot;: &#123;
                &quot;em&quot;: &quot;&lt;EMAIL&gt;&quot;,
                &quot;client_ip_address&quot;: &quot;256.256.256.256&quot;
            &#125;,
            &quot;custom_data&quot;: &#123;
                &quot;currency&quot;: &quot;&lt;CURRENCY&gt;&quot;,
                &quot;value&quot;: &quot;&lt;VALUE&gt;&quot;
            &#125;,
            &quot;data_processing_options&quot;: [&quot;LDU&quot;],
            &quot;data_processing_options_country&quot;: 0,
            &quot;data_processing_options_state&quot;: 0
        &#125;
    ]
&#125;
```

To enable LDU and manually specify the location, e.g., for California:

```
&#123;
    &quot;data&quot;: [
        &#123;
            &quot;event_name&quot;: &quot;Purchase&quot;,
            &quot;event_time&quot;: &lt;EVENT_TIME&gt;,
            &quot;user_data&quot;: &#123;
                &quot;em&quot;: &quot;&lt;EMAIL&gt;&quot;
            &#125;,
            &quot;custom_data&quot;: &#123;
                &quot;currency&quot;: &quot;&lt;CURRENCY&gt;&quot;,
                &quot;value&quot;: &quot;&lt;VALUE&gt;&quot;
            &#125;,
            &quot;data_processing_options&quot;: [&quot;LDU&quot;],
            &quot;data_processing_options_country&quot;: 1,
            &quot;data_processing_options_state&quot;: 1000
        &#125;
    ]
&#125;
```

#### Manual Upload UI

The Offline Conversions API offers the option to manually upload your events from a `.csv` file. In this case, add Data Processing Options, Data Processing Country, and Data Processing State as columns inside your file. More information about this can be found in the upload user interface.

Learn more about [Data Processing Options](https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/data-processing-options).

## API Limits &#123;#api-limits&#125;

The Marketing API has its own rate-limiting logic and is excluded from all the [Graph API rate limitations](https://developers.facebook.com/docs/graph-api/overview/rate-limiting). So if you make a Marketing API call, it won&#039;t be calculated into the Graph API throttling.

There is no specific rate limit for the Conversions API. Conversions API calls are counted as Marketing API calls. The only limitation is that you can send us up to 1,000 events at a time. See [Send Requests](https://developers.facebook.com/documentation/ads-commerce/conversions-api/using-the-api#send) for more information.

[Marketing API Rate Limiting](https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/rate-limiting)

## Business SDK API Usage in the Conversions API Gateway &#123;#business-sdk&#125;

This guide helps you navigate Meta Business SDK advanced features designed especially for Conversions API Gateway users. For basic Conversions API Gateway usage, refer to the [Conversions API Gateway documentation](https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/gateway).

### Send Events to Your Conversions API Gateway Instance

#### Requirements

Before using any of the features listed below, you need to have the Meta Business SDK installed. See [Get Started with the Meta Business SDK](https://developers.facebook.com/docs/business-sdk/getting-started) or follow the README instructions listed here:

* PHP: [facebook-php-business-sdk](https://github.com/facebook/facebook-php-business-sdk?fbclid=IwAR2vJ-EiBUbw1JPu_5euYtEhYs623NXvB1zAJXmG1hLZ-rWJgsgXYfX9Ifc)
* Node.js: [facebook-nodejs-business-sdk](https://github.com/facebook/facebook-nodejs-business-sdk?fbclid=IwAR0exwvrLWId4V0vgFk0hy7I1BYVM3848uSu9Zy_yAoM1Gps1wEALEiFwiw)
* Java: [facebook-java-business-sdk](https://github.com/facebook/facebook-java-business-sdk?fbclid=IwAR1nvNRCWXQxX4SaVTImz3ymEYKDM6Zppdc_Y5Szp34q_HbkOukhhWHxlSQ)
* Python: [facebook-python-business-sdk](https://github.com/facebook/facebook-python-business-sdk?fbclid=IwAR3atWm9H8LVmHlMH-mGyfmwLf6WxkUmeG5Yh-h9l144lgNfGW3sRX2wDEg)
* Ruby: [facebook-ruby-business-sdk](https://github.com/facebook/facebook-ruby-business-sdk?fbclid=IwAR2SZqM8MOMHQQDaO9Urnn3TAqSH9SQOM3u6r3wHcWO_p81cFNVP-KHElsY)

**Warning:** Currently, these features are only available on the PHP and Java business SDK. The other languages will be implemented by the end of 2023.

The minimum language version required to use these features are:

PHP &gt;= 7.2

Java &gt;= 8

**Note**: To dedupe events to the Conversions API endpoint, please pass the `eventId` in your request. This will help prevent duplicate events from showing up if Conversions API publishing is enabled.

### Formatting the `CAPIGatewayIngressRequest` Parameters

| Parameter | Description |
| --- | --- |
| `endpointUrl`&lt;br&gt;&lt;br&gt;string | The Conversions API Gateway endpoint that events get sent to. No prevalidation will be done on the parameter other than checking if it is a valid url.&lt;br&gt;&lt;br&gt;Example: https://test.example.com |
| `accessKey`&lt;br&gt;&lt;br&gt;string | Conversions API Gateway access key that is needed to send events to the Conversions API Gateway events endpoint. These are [the instructions](https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/gateway/non-web-server-events) for generating it. |

### The `CAPIGatewayIngressRequest` Setters

| Parameter | Description |
| --- | --- |
| `setSendToDestinationOnly`&lt;br&gt;&lt;br&gt;Boolean | Boolean flag on whether the events get sent to the selected endpoint only.&lt;br&gt;&lt;br&gt;Default: `False` |
| `setFilter`&lt;br&gt;&lt;br&gt;CustomEndpointRequest.Filter() function | Filter function that processes each event. If the filtering logic returns true, the event gets passed through. Otherwise, the event gets dropped. You have to implement the shouldSendEvent function in the interface that has the parameter Event.&lt;br&gt;&lt;br&gt;Default: `Null` |

#### Migration Example: PHP

For systems that already use the Business SDK, you just need to reference the new CAPIGatewayIngressRequest and attach it to the eventRequest&#039;s customEndpoint object.

```
// this is the standard event request that we attach events to
$event_request = new EventRequest($this-&gt;pixel_id);
$capiIngressRequest = new CAPIGatewayIngressRequest($this-&gt;cb_url, $this-&gt;access_key);
$event_request-&gt;setCustomEndpoint($capiIngressRequest);
// pass the events to this event Request object
$event_request-&gt;setEvents($events);
$event_request-&gt;execute()
```

#### Migration Example: Java

For systems that already use the Business SDK, you just need to reference the new CAPIGatewayIngressRequest and attach it to the eventRequest&#039;s customEndpoint object.

```
// this is the standard event request that we attach events to

EventRequest eventRequest = new EventRequest(PIXEL_ID, context);

CAPIGatewayIngressRequest capiSyncRequest = new CAPIGatewayIngressRequest(CB_URL, CAPIG_ACCESS_KEY);
eventRequest.setCustomEndpoint(capiSyncRequest);
eventRequest.addDataItem(testEvent);
eventRequest.execute();
```

### Synchronous option

#### PHP Code Example

```
$api = Api::init(null, null, $this-&gt;access_token);
$api-&gt;setLogger(new CurlLogger());
$event_request = new EventRequest($this-&gt;pixel_id);
$capiIngressRequest = new CAPIGatewayIngressRequest($this-&gt;cb_url, $this-&gt;access_key);
$event_request-&gt;setCustomEndpoint($capiIngressRequest);
$user_data = (new UserData())
   -&gt;setEmails(array(&#039;joe&#064;eg.com&#039;))
   -&gt;setPhones(array(&#039;12345678901&#039;, &#039;14251234567&#039;))
   -&gt;setFbc(&#039;fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890&#039;)
   -&gt;setFbp(&#039;fb.1.1558571054389.1098115397&#039;);
$event1 = (new Event())
   -&gt;setEventName(&#039;Purchase&#039;)
   -&gt;setEventId(&#039;125&#039;)
   -&gt;setEventTime(time())
   -&gt;setEventSourceUrl(&#039;http://jaspers-market.com/product/123&#039;)
   -&gt;setUserData($user_data);
$events = array($event1, $event2);
$event_request-&gt;setEvents($events);
$response = $event_request-&gt;execute();
print($response-&gt;__toString());
```

#### Java Code Example

```
EventRequest eventRequest = new EventRequest(PIXEL_ID, context);
UserData userData = new UserData()
       .email(&quot;abc&#064;eg.com&quot;);
CAPIGatewayIngressRequest capiSyncRequest = new CAPIGatewayIngressRequest(CB_URL, CAPIG_ACCESS_KEY);
eventRequest.setCustomEndpoint(capiSyncRequest);
Event testEvent = new Event();
testEvent.eventId(&quot;125&quot;).eventName(&quot;Purchase&quot;)
       .eventTime(System.currentTimeMillis() / 1000L)
       .userData(userData)
       .dataProcessingOptions(new String[]&#123;&#125;).setEventId(&quot;134423232&quot;);
eventRequest.namespaceId(&quot;11&quot;)
       .uploadId(&quot;22222&quot;)
       .uploadTag(&quot;upload-tag-4&quot;)
       .uploadSource(&quot;upload-source-4&quot;)
       .testEventCode(&quot;test-event-code-5&quot;)
       .partnerAgent(&quot;partner-agent-6&quot;);
eventRequest.addDataItem(testEvent);
eventRequest.execute();
```

### Asynchronous option

#### PHP Code Example

```
$api = Api::init(null, null, $this-&gt;access_token);
$api-&gt;setLogger(new CurlLogger());
$event_request = new EventRequestAsync($this-&gt;pixel_id);
$capiIngressRequest = new CAPIGatewayIngressRequest($this-&gt;cb_url, $this-&gt;access_key);
$capiIngressRequest-&gt;setSendToDestinationOnly(true);
$event_request-&gt;setCustomEndpoint($capiIngressRequest);
$event1 = (new Event())
   -&gt;setEventName(&#039;test Async Event&#039;)
   -&gt;setEventId(&#039;134423232&#039;)
   -&gt;setEventTime(time())
   -&gt;setEventSourceUrl(&#039;http://jaspers-market.com/product/123&#039;);
$events = array($event1, $event2);
$event_request-&gt;setEvents($events);
$response = $event_request-&gt;execute()-&gt;wait();
```

#### Java Code Example

```
EventRequest eventRequest = new EventRequest(PIXEL_ID, context);
UserData userData = new UserData()
       .email(&quot;abc&#064;eg.com&quot;);
CAPIGatewayIngressRequest capiSyncRequest = new CAPIGatewayIngressRequest(CB_URL, CAPIG_ACCESS_KEY);
capiSyncRequest.setSendToDestinationOnly(true);
eventRequest.setCustomEndpoint(capiSyncRequest);
Event testEvent = new Event();
testEvent.eventName(&quot;test Async Event&quot;)
       .eventTime(System.currentTimeMillis() / 1000L)
       .userData(userData)
       .dataProcessingOptions(new String[]&#123;&#125;).setEventId(&quot;134423232&quot;);
eventRequest.namespaceId(&quot;11222&quot;)
       .uploadId(&quot;22222&quot;)
       .uploadTag(&quot;upload-tag-4&quot;)
       .uploadSource(&quot;upload-source-4&quot;)
       .testEventCode(&quot;test-event-code-5&quot;)
       .partnerAgent(&quot;partner-agent-6&quot;);
eventRequest.addDataItem(testEvent);
eventRequest.executeAsync();
```

### Filter Functionality

#### PHP Code Example

```
lass APIFilter implements Filter &#123;
   public function shouldSendEvent(Event $event): bool
   &#123;
       if ($event-&gt;getEventId() === &#039;125&#039;) &#123;
           return false;
       &#125;
       return true;
   &#125;
&#125;
$capiIngressRequest = new CAPIGatewayIngressRequest($this-&gt;cb_url, $this-&gt;access_key);
$event_request-&gt;setCustomEndpoint($capiIngressRequest);
$capiIngressRequest-&gt;setFilter(new APIFilter());
```

#### Java Code Example

```
CAPIGatewayIngressRequest capiSyncRequest = new CAPIGatewayIngressRequest(CB_URL, CAPIG_ACCESS_KEY);
eventRequest.setCustomEndpoint(capiSyncRequest);

capiSyncRequest.setFilter(new CustomEndpointRequest.Filter() &#123;
   &#064;Override
   public boolean shouldSendEvent(Event event) &#123;
   if (event.getEventId().equals(&quot;125&quot;)) &#123;
       return true;
   &#125;
   return false;
&#125;
&#125;);
```

## Learn More

- [Conversions API Gateway](https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/gateway)
- [Conversions API Gateway for Multiple Accounts](https://developers.facebook.com/documentation/ads-commerce/conversions-api/guides/gateway-multiple-accounts)
- [Conversions API Parameters](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters)
- [Best Practices](https://developers.facebook.com/documentation/ads-commerce/conversions-api/best-practices)
