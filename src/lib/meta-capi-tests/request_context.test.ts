import { describe, expect, it } from "vitest";
import { request_context } from "../meta-capi/request_context";

const now_ms = 1_700_000_000_000;
const fbp_pattern = /^fb\.1\.1700000000000\.\d{10}$/;

const context_for = (options: {
  headers?: Record<string, string>;
  cookies?: Partial<Record<"_fbc" | "_fbp" | "external_id", string>>;
  event_source_url?: string;
}) =>
  request_context({
    headers: new Headers(options.headers ?? {}),
    cookie: (name) => options.cookies?.[name],
    event_source_url: options.event_source_url ?? "https://shop.example/",
    now_ms,
  });

describe("request_context", () => {
  it("prefers Vercel's forwarded header, then x-real-ip, then the first x-forwarded-for entry", () => {
    expect(
      context_for({
        headers: {
          "x-vercel-forwarded-for": "1.1.1.1",
          "x-real-ip": "2.2.2.2",
          "x-forwarded-for": "3.3.3.3, 4.4.4.4",
        },
      }).client_ip_address,
    ).toBe("1.1.1.1");
    expect(
      context_for({
        headers: {
          "x-real-ip": "2.2.2.2",
          "x-forwarded-for": "3.3.3.3, 4.4.4.4",
        },
      }).client_ip_address,
    ).toBe("2.2.2.2");
    expect(
      context_for({ headers: { "x-forwarded-for": " 3.3.3.3 , 4.4.4.4" } })
        .client_ip_address,
    ).toBe("3.3.3.3");
    expect(context_for({}).client_ip_address).toBeUndefined();
  });

  it("reads the user agent", () => {
    expect(
      context_for({ headers: { "user-agent": "Mozilla/5.0 test" } })
        .client_user_agent,
    ).toBe("Mozilla/5.0 test");
    expect(context_for({}).client_user_agent).toBeUndefined();
  });

  it("keeps an existing _fbp and sets nothing for it", () => {
    const context = context_for({
      cookies: { _fbp: "fb.1.1690000000000.1234567890" },
    });
    expect(context.fbp).toBe("fb.1.1690000000000.1234567890");
    expect(context.cookies_to_set._fbp).toBeUndefined();
  });

  it("creates a _fbp in Meta's format when the browser has none, and asks to store it", () => {
    const context = context_for({});
    expect(context.fbp).toMatch(fbp_pattern);
    expect(context.cookies_to_set._fbp).toBe(context.fbp);
    expect(context_for({}).fbp).not.toBe(context.fbp);
  });

  it("keeps the _fbc cookie when the URL carries no click id, and sets nothing for it", () => {
    const context = context_for({
      cookies: {
        _fbc: "fb.1.1690000000000.OldClick",
        _fbp: "fb.1.1.1",
        external_id: "visitor-1",
      },
    });
    expect(context.fbc).toBe("fb.1.1690000000000.OldClick");
    expect(context.cookies_to_set).toEqual({});
  });

  it("builds fbc from fbclid when there is no cookie, preserving case, and asks to store it", () => {
    const context = context_for({
      cookies: { _fbp: "fb.1.1.1", external_id: "visitor-1" },
      event_source_url: "https://shop.example/?utm_source=x&fbclid=AbC_dEf",
    });
    expect(context.fbc).toBe("fb.1.1700000000000.AbC_dEf");
    expect(context.cookies_to_set).toEqual({
      _fbc: "fb.1.1700000000000.AbC_dEf",
    });
  });

  it("prefers a fresh click id in the URL over an older cookie, and keeps the cookie when they match", () => {
    const fresh = context_for({
      cookies: {
        _fbc: "fb.1.1690000000000.OldClick",
        _fbp: "fb.1.1.1",
        external_id: "visitor-1",
      },
      event_source_url: "https://shop.example/?fbclid=NewClick",
    });
    expect(fresh.fbc).toBe("fb.1.1700000000000.NewClick");
    expect(fresh.cookies_to_set).toEqual({
      _fbc: "fb.1.1700000000000.NewClick",
    });
    const same = context_for({
      cookies: {
        _fbc: "fb.1.1690000000000.SameClick",
        _fbp: "fb.1.1.1",
        external_id: "visitor-1",
      },
      event_source_url: "https://shop.example/?fbclid=SameClick",
    });
    expect(same.fbc).toBe("fb.1.1690000000000.SameClick");
    expect(same.cookies_to_set).toEqual({});
  });

  it("yields no fbc for a URL it cannot read", () => {
    expect(
      context_for({
        event_source_url: "not a url",
        cookies: { _fbp: "fb.1.1.1" },
      }).fbc,
    ).toBeUndefined();
  });

  it("keeps the visitor's external_id and sets nothing for it", () => {
    const context = context_for({
      cookies: { _fbp: "fb.1.1.1", external_id: "visitor-1" },
    });
    expect(context.external_id).toBe("visitor-1");
    expect(context.cookies_to_set.external_id).toBeUndefined();
  });

  it("mints a UUID as external_id on a browser without one, and asks to store it", () => {
    const context = context_for({ cookies: { _fbp: "fb.1.1.1" } });
    expect(context.external_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(context.cookies_to_set).toEqual({
      external_id: context.external_id,
    });
    expect(context_for({ cookies: { _fbp: "fb.1.1.1" } }).external_id).not.toBe(
      context.external_id,
    );
  });
});
