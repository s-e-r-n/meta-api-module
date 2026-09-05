import { describe, expect, it } from "vitest";
import { standard_event_names } from "../meta-capi/event_catalog";
import {
  browser_event_schema,
  event_schema,
  issue_list,
} from "../meta-capi/event_schema";

const now = Math.floor(Date.now() / 1000);

const website_event = {
  event_name: "ViewContent",
  event_time: now,
  action_source: "website",
  event_source_url: "https://shop.example/p/1?ref=a",
  user_data: { em: "a@b.c" },
};

const issue_paths = (input: unknown) => {
  const result = event_schema.safeParse(input);
  return result.success
    ? []
    : issue_list(result.error).map((issue) => issue.path);
};

describe("standard_event_names", () => {
  it("lists every Meta standard event including PageView and AppendAttribution", () => {
    expect(standard_event_names).toHaveLength(19);
    expect(standard_event_names).toContain("Purchase");
    expect(standard_event_names).toContain("PageView");
    expect(standard_event_names).toContain("AppendAttribution");
  });
});

describe("event_schema", () => {
  it("accepts a standard website event", () => {
    expect(event_schema.safeParse(website_event).success).toBe(true);
  });

  it("refuses a name that is neither standard nor declared in the policy, and refuses an empty one", () => {
    expect(
      issue_paths({ ...website_event, event_name: "ShareDiscount" }),
    ).toContain("event_name");
    expect(issue_paths({ ...website_event, event_name: "" })).toContain(
      "event_name",
    );
  });

  it("refuses an unknown action_source", () => {
    expect(issue_paths({ ...website_event, action_source: "kiosk" })).toContain(
      "action_source",
    );
  });

  it("requires event_source_url for website events only", () => {
    const { event_source_url: _dropped, ...without_url } = website_event;
    expect(issue_paths(without_url)).toContain("event_source_url");
    expect(
      event_schema.safeParse({ ...without_url, action_source: "email" })
        .success,
    ).toBe(true);
  });

  it("requires value and currency on a Purchase", () => {
    const purchase = { ...website_event, event_name: "Purchase" };
    expect(issue_paths(purchase)).toEqual(
      expect.arrayContaining(["custom_data.value", "custom_data.currency"]),
    );
    expect(issue_paths({ ...purchase, custom_data: { value: 10 } })).toEqual([
      "custom_data.currency",
    ]);
    expect(
      event_schema.safeParse({
        ...purchase,
        custom_data: { value: 10, currency: "chf" },
      }).success,
    ).toBe(true);
  });

  it("keeps event_time inside Meta's window: seven days back, ten minutes ahead", () => {
    expect(
      issue_paths({ ...website_event, event_time: now - 8 * 86_400 }),
    ).toContain("event_time");
    expect(
      issue_paths({ ...website_event, event_time: now + 3_600 }),
    ).toContain("event_time");
    expect(
      event_schema.safeParse({ ...website_event, event_time: now - 6 * 86_400 })
        .success,
    ).toBe(true);
    expect(
      event_schema.safeParse({ ...website_event, event_time: now + 300 })
        .success,
    ).toBe(true);
    const { event_time: _dropped, ...without_time } = website_event;
    expect(event_schema.safeParse(without_time).success).toBe(true);
  });

  it("types the commerce keys of custom_data and accepts custom properties without whitespace in the key", () => {
    const with_custom = {
      ...website_event,
      custom_data: {
        value: 19.9,
        currency: "CHF",
        content_ids: ["42"],
        content_type: "product",
        contents: [
          {
            id: "42",
            quantity: 2,
            item_price: 9.95,
            delivery_category: "home_delivery",
          },
        ],
        num_items: 2,
        status: true,
        compared_product: "banner-shoes",
        tags: ["a", "b"],
        rank: 3,
      },
    };
    expect(event_schema.safeParse(with_custom).success).toBe(true);
    expect(
      issue_paths({ ...website_event, custom_data: { "has space": "x" } }),
    ).toContain("custom_data.has space");
    expect(
      issue_paths({
        ...website_event,
        custom_data: { contents: [{ id: "42" }] },
      }),
    ).toContain("custom_data.contents.0.quantity");
    expect(
      issue_paths({ ...website_event, custom_data: { content_ids: [42] } }),
    ).toContain("custom_data.content_ids.0");
    expect(
      issue_paths({ ...website_event, custom_data: { value: -1 } }),
    ).toContain("custom_data.value");
    expect(
      issue_paths({ ...website_event, custom_data: { currency: "CHF1" } }),
    ).toContain("custom_data.currency");
    expect(
      issue_paths({ ...website_event, custom_data: { content_type: "sku" } }),
    ).toContain("custom_data.content_type");
  });

  it("only knows Meta's user_data keys and takes lists for the hashed ones", () => {
    expect(
      issue_paths({ ...website_event, user_data: { email: "a@b.c" } }),
    ).toContain("user_data.email");
    expect(
      event_schema.safeParse({
        ...website_event,
        user_data: { em: ["a@b.c", "c@d.e"], ph: "+41791234567" },
      }).success,
    ).toBe(true);
    expect(
      issue_paths({ ...website_event, user_data: { fb_login_id: "12" } }),
    ).toContain("user_data.fb_login_id");
    expect(
      issue_paths({
        ...website_event,
        user_data: { client_ip_address: ["1.1.1.1"] },
      }),
    ).toContain("user_data.client_ip_address");
  });

  it("ties Limited Data Use to a country and refuses any other processing option", () => {
    expect(
      issue_paths({ ...website_event, data_processing_options: ["LDU"] }),
    ).toContain("data_processing_options_country");
    expect(
      event_schema.safeParse({
        ...website_event,
        data_processing_options: ["LDU"],
        data_processing_options_country: 1,
        data_processing_options_state: 1000,
      }).success,
    ).toBe(true);
    expect(
      event_schema.safeParse({ ...website_event, data_processing_options: [] })
        .success,
    ).toBe(true);
    expect(
      issue_paths({ ...website_event, data_processing_options: ["GDPR"] }),
    ).toContain("data_processing_options.0");
    expect(
      issue_paths({ ...website_event, data_processing_options_state: 1014 }),
    ).toContain("data_processing_options_state");
  });

  it("carries attribution_data and original_event_data for AppendAttribution", () => {
    const append = {
      ...website_event,
      event_name: "AppendAttribution",
      custom_data: { currency: "USD" },
      attribution_data: {
        ad_id: "123",
        touchpoint_ts: now - 100,
        attribution_share: 0.5,
        attribution_value: 5,
      },
      original_event_data: {
        event_name: "Purchase",
        event_time: now - 200,
        order_id: "o-1",
        event_id: "e-1",
      },
    };
    expect(event_schema.safeParse(append).success).toBe(true);
    expect(issue_paths({ ...append, attribution_data: undefined })).toContain(
      "attribution_data",
    );
    expect(issue_paths({ ...append, custom_data: {} })).toContain(
      "custom_data.currency",
    );
    expect(
      issue_paths({
        ...append,
        attribution_data: { ...append.attribution_data, attribution_share: 2 },
      }),
    ).toContain("attribution_data.attribution_share");
  });
});

describe("browser_event_schema", () => {
  it("refuses everything the server stamps itself", () => {
    const refused = browser_event_schema.safeParse({
      event_name: "Lead",
      event_time: now,
      action_source: "website",
      event_source_url: "https://shop.example",
      user_data: { em: "a@b.c", client_ip_address: "1.1.1.1", fbc: "fb.1.1.x" },
    });
    expect(refused.success).toBe(false);
    if (refused.success) return;
    const paths = issue_list(refused.error).map((issue) => issue.path);
    expect(paths).toEqual(
      expect.arrayContaining([
        "event_time",
        "action_source",
        "event_source_url",
        "user_data.client_ip_address",
        "user_data.fbc",
      ]),
    );
  });

  it("accepts what a component may declare", () => {
    expect(
      browser_event_schema.safeParse({
        event_name: "Lead",
        event_id: "abc",
        user_data: { em: "a@b.c", external_id: ["u1"], fb_login_id: 12 },
        custom_data: { value: 1, currency: "chf" },
        opt_out: false,
      }).success,
    ).toBe(true);
  });
});
