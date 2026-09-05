import { describe, expect, it } from "vitest";
import { fbc_from_click_id, visitor_identity } from "./visitor_identity";

const now_ms = 1_700_000_000_000;

const identity_for = (options: {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  event_source_url?: string;
}) =>
  visitor_identity({
    headers: new Headers(options.headers ?? {}),
    cookie: (name) => options.cookies?.[name],
    event_source_url: options.event_source_url ?? "https://shop.example/",
    now_ms,
  });

describe("fbc_from_click_id", () => {
  it("builds the server-side format with subdomain index 1 and a millisecond timestamp", () => {
    expect(fbc_from_click_id("AbC_dEf", 5)).toBe("fb.1.5.AbC_dEf");
  });
});

describe("visitor_identity", () => {
  it("prefers Vercel's forwarded header, then x-real-ip, then the first x-forwarded-for entry", () => {
    expect(
      identity_for({
        headers: {
          "x-vercel-forwarded-for": "1.1.1.1",
          "x-real-ip": "2.2.2.2",
          "x-forwarded-for": "3.3.3.3, 4.4.4.4",
        },
      }).client_ip_address,
    ).toBe("1.1.1.1");
    expect(
      identity_for({
        headers: {
          "x-real-ip": "2.2.2.2",
          "x-forwarded-for": "3.3.3.3, 4.4.4.4",
        },
      }).client_ip_address,
    ).toBe("2.2.2.2");
    expect(
      identity_for({ headers: { "x-forwarded-for": " 3.3.3.3 , 4.4.4.4" } })
        .client_ip_address,
    ).toBe("3.3.3.3");
    expect(identity_for({}).client_ip_address).toBeUndefined();
  });

  it("reads the user agent", () => {
    expect(
      identity_for({ headers: { "user-agent": "Mozilla/5.0 test" } })
        .client_user_agent,
    ).toBe("Mozilla/5.0 test");
    expect(identity_for({}).client_user_agent).toBeUndefined();
  });

  it("takes fbp from its cookie", () => {
    expect(
      identity_for({ cookies: { _fbp: "fb.1.1700000000000.123" } }).fbp,
    ).toBe("fb.1.1700000000000.123");
    expect(identity_for({}).fbp).toBeUndefined();
  });

  it("keeps the _fbc cookie when the URL carries no click id", () => {
    expect(
      identity_for({ cookies: { _fbc: "fb.1.1690000000000.OldClick" } }).fbc,
    ).toBe("fb.1.1690000000000.OldClick");
  });

  it("builds fbc from fbclid when there is no cookie, preserving case", () => {
    expect(
      identity_for({
        event_source_url: "https://shop.example/?utm_source=x&fbclid=AbC_dEf",
      }).fbc,
    ).toBe("fb.1.1700000000000.AbC_dEf");
  });

  it("prefers a fresh click id in the URL over an older cookie, and keeps the cookie when they match", () => {
    expect(
      identity_for({
        cookies: { _fbc: "fb.1.1690000000000.OldClick" },
        event_source_url: "https://shop.example/?fbclid=NewClick",
      }).fbc,
    ).toBe("fb.1.1700000000000.NewClick");
    expect(
      identity_for({
        cookies: { _fbc: "fb.1.1690000000000.SameClick" },
        event_source_url: "https://shop.example/?fbclid=SameClick",
      }).fbc,
    ).toBe("fb.1.1690000000000.SameClick");
  });

  it("yields no fbc for a URL it cannot read", () => {
    expect(identity_for({ event_source_url: "not a url" }).fbc).toBeUndefined();
  });
});
