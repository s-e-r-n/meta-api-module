import { cookies, headers } from "next/headers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { send_parsed_meta_events } from "../meta-capi/send_meta_events";
import { send_visitor_meta_event } from "../meta-capi/send_visitor_meta_event";

vi.mock("next/headers", () => ({ headers: vi.fn(), cookies: vi.fn() }));
vi.mock("../meta-capi/send_meta_events", async (import_actual) => ({
  ...(await import_actual<typeof import("../meta-capi/send_meta_events")>()),
  send_parsed_meta_events: vi.fn(),
}));

const send = vi.mocked(send_parsed_meta_events);
const set_cookie = vi.fn();
const now = 1_700_000_000;

const request_with = (options: {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}) => {
  vi.mocked(headers).mockResolvedValue(
    new Headers(options.headers ?? {}) as Awaited<ReturnType<typeof headers>>,
  );
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) =>
      options.cookies?.[name] === undefined
        ? undefined
        : { name, value: options.cookies[name] },
    set: set_cookie,
  } as unknown as Awaited<ReturnType<typeof cookies>>);
};

beforeEach(() => {
  vi.useFakeTimers({ now: now * 1000 });
  vi.stubEnv("META_CAPI_DATASET_ID", "123");
  vi.stubEnv("META_CAPI_ACCESS_TOKEN", "EAAtoken");
  vi.stubEnv("META_CAPI_SITE_ORIGIN", "");
  send.mockReset();
  set_cookie.mockReset();
  send.mockResolvedValue({
    ok: true,
    events_received: 1,
    fbtrace_id: "trace",
    messages: [],
    warnings: [],
  });
  request_with({
    headers: {
      referer: "https://shop.example/contact?fbclid=FormClick",
      "x-forwarded-for": "203.0.113.7",
      "user-agent": "Mozilla/5.0",
    },
    cookies: { _fbp: "fb.1.1.123", external_id: "visitor-1" },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("send_visitor_meta_event", () => {
  it("completes a form's event from the request: page from Referer, identity from headers and cookies, minted ids", async () => {
    const result = await send_visitor_meta_event({
      event_name: "Lead",
      user_data: { em: "a@b.c" },
    });
    expect(result).toMatchObject({ ok: true, warnings: [] });
    const sent = send.mock.calls[0]?.[0][0];
    expect(sent).toMatchObject({
      event_name: "Lead",
      event_time: now,
      action_source: "website",
      event_source_url: "https://shop.example/contact?fbclid=FormClick",
      user_data: {
        em: "a@b.c",
        client_ip_address: "203.0.113.7",
        client_user_agent: "Mozilla/5.0",
        fbp: "fb.1.1.123",
        fbc: `fb.1.${now * 1000}.FormClick`,
        external_id: ["visitor-1"],
      },
    });
    expect(sent?.event_id).toBeUndefined();
    expect(set_cookie).toHaveBeenCalledWith(
      "_fbc",
      `fb.1.${now * 1000}.FormClick`,
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("warns, and still sends, when a conversion leaves without any person identifier", async () => {
    const result = await send_visitor_meta_event({ event_name: "Lead" });
    expect(result).toMatchObject({
      ok: true,
      warnings: [expect.stringMatching(/^Lead left without/)],
    });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("takes an explicit page URL, then the Referer, then the site origin, and refuses when none exists", async () => {
    await send_visitor_meta_event(
      { event_name: "Lead" },
      { event_source_url: "https://shop.example/thank-you" },
    );
    expect(send.mock.calls[0]?.[0][0]?.event_source_url).toBe(
      "https://shop.example/thank-you",
    );
    request_with({
      headers: {},
      cookies: { _fbp: "fb.1.1.123", external_id: "visitor-1" },
    });
    vi.stubEnv("META_CAPI_SITE_ORIGIN", "https://shop.example");
    await send_visitor_meta_event({ event_name: "Lead" });
    expect(send.mock.calls[1]?.[0][0]?.event_source_url).toBe(
      "https://shop.example/",
    );
    vi.stubEnv("META_CAPI_SITE_ORIGIN", "");
    await expect(
      send_visitor_meta_event({ event_name: "Lead" }),
    ).resolves.toMatchObject({
      ok: false,
      reason: "invalid_event",
      issues: [{ path: "event_source_url" }],
    });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("returns a refusal for a declaration it cannot parse, without sending", async () => {
    await expect(
      send_visitor_meta_event(JSON.parse('{"event_name":"Purchase"}')),
    ).resolves.toMatchObject({
      ok: false,
      reason: "invalid_event",
    });
    expect(send).not.toHaveBeenCalled();
  });
});
