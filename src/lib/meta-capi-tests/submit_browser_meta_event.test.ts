import { cookies, headers } from "next/headers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  meta_capi_rejected_error,
  send_parsed_meta_events,
} from "../meta-capi/send_meta_events";
import { submit_browser_meta_event } from "../meta-capi/submit_browser_meta_event";

vi.mock("next/headers", () => ({ headers: vi.fn(), cookies: vi.fn() }));
vi.mock("../meta-capi/send_meta_events", async (import_actual) => ({
  ...(await import_actual<typeof import("../meta-capi/send_meta_events")>()),
  send_parsed_meta_events: vi.fn(),
}));

const send = vi.mocked(send_parsed_meta_events);
const now = 1_700_000_000;

const submission = {
  event: {
    event_name: "AddToCart",
    event_id: "browser-id",
    user_data: { em: "a@b.c" },
    custom_data: { content_ids: ["42"], value: 5, currency: "CHF" },
  },
  browser: {
    event_source_url: "https://shop.example/p/42?fbclid=Click1",
    referrer_url: "https://google.com/",
    event_id: "uuid-1",
  },
};

const set_cookie = vi.fn();

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
    headers: { "x-forwarded-for": "203.0.113.7", "user-agent": "Mozilla/5.0" },
    cookies: { _fbp: "fb.1.1.123", external_id: "visitor-1" },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("submit_browser_meta_event", () => {
  it("sends the visitor's external_id next to the one the site declares", async () => {
    await submit_browser_meta_event({
      ...submission,
      event: {
        ...submission.event,
        user_data: { em: "a@b.c", external_id: "crm-1" },
      },
    });
    expect(send.mock.calls[0]?.[0][0]?.user_data?.external_id).toEqual([
      "crm-1",
      "visitor-1",
    ]);
  });

  it("mints and stores external_id when the browser has none, and sends it", async () => {
    request_with({ headers: {}, cookies: { _fbp: "fb.1.1.123" } });
    await submit_browser_meta_event(submission);
    const [, external_id] =
      set_cookie.mock.calls.find((call) => call[0] === "external_id") ?? [];
    expect(external_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(send.mock.calls[0]?.[0][0]?.user_data?.external_id).toEqual([
      external_id,
    ]);
  });

  it("stores a fresh click id as _fbc for ninety days, readable by scripts, and leaves an existing _fbp alone", async () => {
    await submit_browser_meta_event(submission);
    expect(set_cookie).toHaveBeenCalledTimes(1);
    expect(set_cookie).toHaveBeenCalledWith(
      "_fbc",
      `fb.1.${now * 1000}.Click1`,
      {
        path: "/",
        maxAge: 7_776_000,
        sameSite: "lax",
        secure: true,
        httpOnly: false,
        domain: undefined,
      },
    );
  });

  it("creates and stores _fbp when the browser has none, sends it in the event, and marks the cookie secure only on https", async () => {
    request_with({ headers: {}, cookies: {} });
    await submit_browser_meta_event({
      ...submission,
      browser: {
        ...submission.browser,
        event_source_url: "http://localhost:3000/",
      },
    });
    const names = set_cookie.mock.calls.map((call) => call[0]).sort();
    expect(names).toEqual(["_fbp", "external_id"]);
    const [, fbp, options] =
      set_cookie.mock.calls.find((call) => call[0] === "_fbp") ?? [];
    expect(fbp).toMatch(/^fb\.1\.\d+\.\d{10}$/);
    expect(options).toMatchObject({ secure: false, domain: undefined });
    expect(send.mock.calls[0]?.[0][0]?.user_data?.fbp).toBe(fbp);
  });

  it("scopes the cookies to the configured domain", async () => {
    vi.stubEnv("META_CAPI_COOKIE_DOMAIN", ".shop.example");
    await submit_browser_meta_event(submission);
    expect(set_cookie.mock.calls[0]?.[2]).toMatchObject({
      domain: ".shop.example",
    });
  });

  it("sets nothing when the browser already carries both cookies and the URL brings no new click", async () => {
    request_with({
      headers: {},
      cookies: {
        _fbp: "fb.1.1.123",
        _fbc: "fb.1.1.Click1",
        external_id: "visitor-1",
      },
    });
    await submit_browser_meta_event(submission);
    expect(set_cookie).not.toHaveBeenCalled();
  });

  it("assembles the server event from the browser's declaration and the request's identity", async () => {
    await expect(submit_browser_meta_event(submission)).resolves.toEqual({
      ok: true,
      events_received: 1,
      fbtrace_id: "trace",
      messages: [],
      warnings: [],
    });
    expect(send).toHaveBeenCalledWith([
      {
        event_name: "AddToCart",
        event_id: "browser-id",
        event_time: now,
        action_source: "website",
        event_source_url: "https://shop.example/p/42?fbclid=Click1",
        referrer_url: "https://google.com/",
        user_data: {
          em: "a@b.c",
          client_ip_address: "203.0.113.7",
          client_user_agent: "Mozilla/5.0",
          fbp: "fb.1.1.123",
          fbc: `fb.1.${now * 1000}.Click1`,

          external_id: ["visitor-1"],
        },
        custom_data: { content_ids: ["42"], value: 5, currency: "CHF" },
      },
    ]);
  });

  it("uses the browser's fire id when the declaration carries no event_id", async () => {
    const { event_id: _dropped, ...event } = submission.event;
    await submit_browser_meta_event({ ...submission, event });
    expect(send.mock.calls[0]?.[0][0]?.event_id).toBe("uuid-1");
  });

  it("refuses a submission it cannot parse before any send", async () => {
    await expect(
      submit_browser_meta_event({
        ...submission,
        event: { ...submission.event, event_time: now },
      } as unknown as typeof submission),
    ).rejects.toBeInstanceOf(meta_capi_rejected_error);
    expect(send).not.toHaveBeenCalled();
  });

  it("refuses a page URL from another origin when a site origin is configured", async () => {
    vi.stubEnv("META_CAPI_SITE_ORIGIN", "https://shop.example");
    await expect(submit_browser_meta_event(submission)).resolves.toMatchObject({
      ok: true,
    });
    await expect(
      submit_browser_meta_event({
        ...submission,
        browser: {
          ...submission.browser,
          event_source_url: "https://evil.example/",
        },
      }),
    ).rejects.toBeInstanceOf(meta_capi_rejected_error);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("throws the engine's refusal so it reaches instrumentation", async () => {
    const refusal = {
      ok: false as const,
      reason: "graph_rejected" as const,
      status: 400,
      error: { message: "Invalid parameter", code: 100 },
    };
    send.mockResolvedValue(refusal);
    const outcome = submit_browser_meta_event(submission);
    await expect(outcome).rejects.toBeInstanceOf(meta_capi_rejected_error);
    await expect(outcome).rejects.toMatchObject({ result: refusal });
  });
});
