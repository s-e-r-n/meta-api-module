import { describe, expect, it } from "vitest";
import {
  browser_context,
  browser_context_schema,
} from "../meta-capi/browser_context";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("browser_context", () => {
  it("captures the full page URL, query string included", () => {
    window.history.pushState(
      {},
      "",
      "/products?page=2&fbclid=Ab_C&utm_source=meta",
    );
    expect(browser_context().event_source_url).toBe(
      "http://localhost:3000/products?page=2&fbclid=Ab_C&utm_source=meta",
    );
  });

  it("leaves the referrer out when the document has none", () => {
    expect(browser_context().referrer_url).toBeUndefined();
  });

  it("generates a fresh UUID for every fire", () => {
    const first = browser_context().event_id;
    const second = browser_context().event_id;
    expect(first).toMatch(uuid);
    expect(second).toMatch(uuid);
    expect(first).not.toBe(second);
  });

  it("contracts an absolute page URL and a non-empty event id", () => {
    expect(
      browser_context_schema.safeParse({
        event_source_url: "https://shop.example/?a=1",
        event_id: "id-1",
      }).success,
    ).toBe(true);
    expect(
      browser_context_schema.safeParse({
        event_source_url: "/relative",
        event_id: "id-1",
      }).success,
    ).toBe(false);
    expect(
      browser_context_schema.safeParse({
        event_source_url: "https://shop.example",
        event_id: "",
      }).success,
    ).toBe(false);
  });
});
