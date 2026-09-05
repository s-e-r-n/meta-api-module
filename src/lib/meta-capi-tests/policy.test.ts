import { describe, expect, it, vi } from "vitest";
import { person_identity_warning } from "../meta-capi/event_catalog";
import { browser_event_schema, issue_list } from "../meta-capi/event_schema";

vi.mock("../meta-capi/policy", () => ({
  policy: { custom_events: ["ShareDiscount"] },
}));

const paths = (input: unknown) => {
  const result = browser_event_schema.safeParse(input);
  return result.success
    ? []
    : issue_list(result.error).map((issue) => issue.path);
};

describe("policy", () => {
  it("declares a custom event by naming it, and refuses an undeclared one", () => {
    expect(
      browser_event_schema.safeParse({
        event_name: "ShareDiscount",
        custom_data: { promotion: "x" },
      }).success,
    ).toBe(true);
    expect(paths({ event_name: "Undeclared" })).toEqual(["event_name"]);
  });

  it("requires nothing about the person", () => {
    expect(browser_event_schema.safeParse({ event_name: "Lead" }).success).toBe(
      true,
    );
    expect(
      browser_event_schema.safeParse({
        event_name: "Lead",
        user_data: { ph: "+41791234567" },
      }).success,
    ).toBe(true);
  });
});

describe("person_identity_warning", () => {
  it("names a conversion event that leaves without em, ph or a site external_id", () => {
    expect(person_identity_warning("Lead", undefined)).toMatch(
      /^Lead left without em, ph or a site external_id/,
    );
    expect(person_identity_warning("Schedule", { fn: "Mary" })).toMatch(
      /^Schedule left without/,
    );
    expect(person_identity_warning("Purchase", { em: [] })).toMatch(
      /^Purchase left without/,
    );
  });

  it("stays silent when any identifier is there, or when the event expects none", () => {
    expect(person_identity_warning("Lead", { em: "a@b.c" })).toBeUndefined();
    expect(
      person_identity_warning("Lead", { ph: "+41791234567" }),
    ).toBeUndefined();
    expect(
      person_identity_warning("Lead", { external_id: "crm-1" }),
    ).toBeUndefined();
    expect(person_identity_warning("Contact", undefined)).toBeUndefined();
    expect(person_identity_warning("PageView", undefined)).toBeUndefined();
  });
});
