# Reference



## Standard Events

You can use the Meta Pixel&#039;s `fbq(&#039;track&#039;)` function to track the following [standard events](https://developers.facebook.com/documentation/meta-pixel/implementation/conversion-tracking#standard-events). Standard events also support [parameter](#object-properties) objects with specific object properties, which allow you to include detailed information about an event.

If you’re implementing the Meta Pixel alongside the [Conversions API](https://developers.facebook.com/documentation/ads-commerce/conversions-api), we recommend you include the `eventID` parameter as a fourth parameter to the `fbq(‘track’)` function. See the [Deduplicate Pixel and Server Events](https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events) documentation for more information.

| Event Name | Event Description | Object Properties | Promoted Object custom_event_type value |
| --- | --- | --- | --- |
| `AddPaymentInfo` | When payment information is added in the checkout flow. *A person clicks on a save billing information button.* | `content_ids`, `contents`, `currency`, `value`&lt;br&gt;&lt;br&gt;*Optional.* | ADD_PAYMENT_INFO |
| `AddToCart` | When a product is added to the shopping cart.&lt;br&gt;*A person clicks on an add to cart button.* | `content_ids`, `content_type`, `contents`, `currency`, `value`&lt;br&gt;&lt;br&gt;*Optional.*&lt;br&gt;*Required for Advantage+ catalog ads:&lt;br&gt;&lt;br&gt;`contents`&lt;br&gt;&lt;br&gt;*&lt;br&gt; | ADD_TO_CART |
| `AddToWishlist` | When a product is added to a wishlist.&lt;br&gt;*A person clicks on an add to wishlist button.* | `content_ids`, `contents`, `currency`, `value`&lt;br&gt;&lt;br&gt;*Optional.* | ADD_TO_WISHLIST |
| `CompleteRegistration` | When a registration form is completed.&lt;br&gt;*A person submits a completed subscription or signup form.* | `currency`, `value`&lt;br&gt;&lt;br&gt;*Optional.* | COMPLETE_REGISTRATION |
| `Contact` | When a person initiates contact with your business via telephone, SMS, email, chat, etc.&lt;br&gt;*A person submits a question about a product.* | *Optional.* | CONTACT |
| `CustomizeProduct` | When a person customizes a product.&lt;br&gt;*A person selects the color of a t-shirt.* | *Optional.* | CUSTOMIZE_PRODUCT |
| `Donate` | When a person donates funds to your organization or cause.  &lt;br&gt;*A person adds a donation to the Humane Society to their cart.* | *Optional.* |  |
| `FindLocation` | When a person searches for a location of your store via a website or app, with an intention to visit the physical location.&lt;br&gt;*A person wants to find a specific product in a local store.* | *Optional.* | FIND_LOCATION |
| `InitiateCheckout` | When a person enters the checkout flow prior to completing the checkout flow.&lt;br&gt;*A person clicks on a checkout button.* | `content_ids`, `contents`, `currency`,    `num_items`, `value`&lt;br&gt;&lt;br&gt;*Optional.* | INITIATE_CHECKOUT |
| `Lead` | When a sign up is completed.&lt;br&gt;*A person clicks on pricing.* | `currency`, `value`&lt;br&gt;&lt;br&gt;*Optional.* | LEAD |
| `Purchase` | When a purchase is made or checkout flow is completed.&lt;br&gt;*A person has finished the purchase or checkout flow and lands on thank you or confirmation page.* | `content_ids`, `content_type`, `contents`, `currency`, `num_items`, `value`&lt;br&gt;&lt;br&gt;***Required: ** `currency` and `value`*&lt;br&gt;&lt;br&gt;*Required for Advantage+ catalog ads:&lt;br&gt;&lt;br&gt;`contents` or `content_ids`*&lt;br&gt; | PURCHASE |
| `Schedule` | When a person books an appointment to visit one of your locations.&lt;br&gt;*A person selects a date and time for a tennis lesson.* | *Optional.* | SCHEDULE |
| `Search` | When a search is made.&lt;br&gt;*A person searches for a product on your website.* | `content_ids`, `content_type`, `contents`, `currency`, `search_string`, `value`&lt;br&gt;&lt;br&gt;*Optional.*&lt;br&gt;*Required for Advantage+ catalog ads:&lt;br&gt;&lt;br&gt;`contents` or `content_ids`*&lt;br&gt; | SEARCH |
| `StartTrial` | When a person starts a free trial of a product or service you offer.&lt;br&gt;*A person selects a free week of your game.* | `currency`, `predicted_ltv`, `value`&lt;br&gt;&lt;br&gt;*Optional.* | START_TRIAL |
| `SubmitApplication` | When a person applies for a product, service, or program you offer.&lt;br&gt;*A person applies for a credit card, educational program, or job. * | *Optional.* | SUBMIT_APPLICATION |
| `Subscribe` | When a person applies to a start a paid subscription for a product or service you offer.&lt;br&gt;*A person subscribes to your streaming service.* | `currency`, `predicted_ltv`, `value`&lt;br&gt;&lt;br&gt;*Optional.* | SUBSCRIBE |
| `ViewContent` | A visit to a web page you care about (for example, a product page or landing page). `ViewContent` tells you if someone visits a web page&#039;s URL, but not what they see or do on that page.&lt;br&gt;*A person lands on a product details page.* | `content_ids`, `content_type`, `contents`, `currency`, `value`&lt;br&gt;&lt;br&gt;*Optional.*&lt;br&gt;*Required for Advantage+ catalog ads:&lt;br&gt;&lt;br&gt;`contents` or `content_ids`*&lt;br&gt; | VIEW_CONTENT |

## Object Properties &#123;#object-properties&#125;

You can include the following predefined object properties with any custom events, and any standard events that support them. Format your parameter object data using JSON. Learn more about event parameters with [Blueprint](https://www.facebookblueprint.com/student/collection/240330/path/210140?content_id=9yCDpJgXbYOg8OK).

| Property Key | Value Type | Parameter Description |
| --- | --- | --- |
| `content_category` | String | Category of the page/product.&lt;br&gt;*Optional.* |
| `content_ids` | Array of integers or strings | Product IDs associated with the event, such as SKUs (e.g. `[&#039;ABC123&#039;, &#039;XYZ789&#039;]`). |
| `content_name` | String | Name of the page/product.&lt;br&gt;*Optional.* |
| `content_type` | String | Either `product` or `product_group` based on the `content_ids` or `contents` being passed. If the IDs being passed in `content_ids` or `contents` parameter are IDs of products, then the value should be `product`. If product group IDs are being passed, then the value should be `product_group`.&lt;br&gt;&lt;br&gt;If no `content_type` is provided, Meta will match the event to every item that has the same ID, independent of its type. |
| `contents` | Array of objects | An array of JSON objects that contains the quantity and the International Article Number (EAN) when applicable, or other product or content identifier(s). `id` and `quantity` are the required fields. e.g. `[&#123;&#039;id&#039;: &#039;ABC123&#039;, &#039;quantity&#039;: 2&#125;, &#123;&#039;id&#039;: &#039;XYZ789&#039;, &#039;quantity&#039;: 2&#125;]`. |
| `currency` | String | The currency for the `value` specified. |
| `num_items` | Integer | Used with `InitiateCheckout` event. The number of items when checkout was initiated. |
| `predicted_ltv` | Integer, float | Predicted lifetime value of a subscriber as defined by the advertiser and expressed as an exact value. |
| `search_string` | String | Used with the `Search` event. The string entered by the user for the search. |
| `status` | Boolean | Used with the `CompleteRegistration` event, to show the status of the registration.&lt;br&gt;&lt;br&gt;*Optional.* |
| `value` | Integer or float | The value of a user performing this event to the business. |

