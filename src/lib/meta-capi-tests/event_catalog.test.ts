import { describe, expect, it } from "vitest";
import {
  missing_fields,
  standard_event_names,
  standard_event_rules,
} from "../meta-capi/event_catalog";

describe("standard_event_names", () => {
  it("lists every Meta standard event including PageView and AppendAttribution", () => {
    expect(standard_event_names).toHaveLength(19);
    expect(standard_event_names).toContain("Purchase");
    expect(standard_event_names).toContain("PageView");
    expect(standard_event_names).toContain("AppendAttribution");
  });
});

describe("missing_fields", () => {
  it("names each required path that is absent or empty", () => {
    expect(
      missing_fields(
        { custom_data: { value: 0 } },
        standard_event_rules.Purchase.requires,
      ),
    ).toEqual([["custom_data", "currency"]]);
    expect(
      missing_fields({ user_data: { em: [] } }, { user_data: ["em", "ph"] }),
    ).toEqual([
      ["user_data", "em"],
      ["user_data", "ph"],
    ]);
    expect(
      missing_fields({}, { attribution_data: true, event_source_url: true }),
    ).toEqual([["attribution_data"], ["event_source_url"]]);
  });

  it("returns nothing without requirements or when everything is present", () => {
    expect(missing_fields({}, undefined)).toEqual([]);
    expect(
      missing_fields(
        { custom_data: { value: 0, currency: "CHF" } },
        standard_event_rules.Purchase.requires,
      ),
    ).toEqual([]);
  });
});
