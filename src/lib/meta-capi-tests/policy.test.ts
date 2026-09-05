import { describe, expect, it, vi } from "vitest";
import {
  browser_event_schema,
  event_schema,
  issue_list,
  recommendation_warnings,
} from "../meta-capi/event_schema";

vi.mock("../meta-capi/policy", () => ({
  policy: {
    custom_events: ["ShareDiscount"],
    every_event: { requires: { custom_data: ["value", "currency"] } },
    events: {
      Lead: {
        requires: { user_data: ["em"] },
        recommends: { user_data: ["ph"] },
      },
      ShareDiscount: { requires: { custom_data: ["promotion"] } },
    },
  },
}));

const paths = (input: unknown) => {
  const result = browser_event_schema.safeParse(input);
  return result.success
    ? []
    : issue_list(result.error).map((issue) => issue.path);
};

describe("policy", () => {
  it("makes a field required for every event", () => {
    expect(paths({ event_name: "ViewContent" })).toEqual([
      "custom_data.value",
      "custom_data.currency",
    ]);
    expect(
      browser_event_schema.safeParse({
        event_name: "ViewContent",
        custom_data: { value: 0, currency: "CHF" },
      }).success,
    ).toBe(true);
  });

  it("makes a field required for one event", () => {
    expect(
      paths({ event_name: "Lead", custom_data: { value: 0, currency: "CHF" } }),
    ).toEqual(["user_data.em"]);
    expect(
      browser_event_schema.safeParse({
        event_name: "Lead",
        custom_data: { value: 0, currency: "CHF" },
        user_data: { em: "a@b.c" },
      }).success,
    ).toBe(true);
  });

  it("declares a custom event by naming it", () => {
    expect(
      browser_event_schema.safeParse({
        event_name: "ShareDiscount",
        custom_data: { value: 0, currency: "CHF", promotion: "x" },
      }).success,
    ).toBe(true);
    expect(
      paths({
        event_name: "ShareDiscount",
        custom_data: { value: 0, currency: "CHF" },
      }),
    ).toEqual(["custom_data.promotion"]);
    expect(
      paths({
        event_name: "Undeclared",
        custom_data: { value: 0, currency: "CHF" },
      }),
    ).toEqual(["event_name"]);
  });

  it("turns a recommendation into a warning at send time, never a refusal", () => {
    const parsed = event_schema.safeParse({
      event_name: "Lead",
      event_source_url: "https://shop.example/",
      custom_data: { value: 0, currency: "CHF" },
      user_data: { em: "a@b.c", client_user_agent: "ua" },
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(recommendation_warnings(parsed.data)).toEqual([
      "Lead: user_data.ph is recommended by Meta and missing",
    ]);
  });
});
