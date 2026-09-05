import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { engine_config } from "../meta-capi/config";
import {
  backoff_ms,
  meta_capi_transport_error,
  post_events_to_graph,
} from "../meta-capi/graph_api_client";

const config: ReturnType<typeof engine_config> = {
  dataset_id: "123",
  access_token: "EAAtoken",
  graph_version: "v26.0",
  timeout_ms: 1500,
  test_event_code: undefined,
  site_origin: undefined,
  cookie_domain: undefined,
};

const request = {
  data: [
    {
      event_name: "PageView",
      event_time: 1_700_000_000,
      action_source: "website" as const,
      event_source_url: "https://shop.example/",
      user_data: {},
    },
  ],
  test_event_code: "TEST1",
};

const json_response = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const success_body = { events_received: 1, messages: [], fbtrace_id: "trace" };
const invalid_body = {
  error: {
    message: "Invalid parameter",
    type: "OAuthException",
    code: 100,
    is_transient: false,
    fbtrace_id: "trace",
  },
};
const rate_limited_body = {
  error: {
    message: "User request limit reached",
    type: "OAuthException",
    code: 17,
    is_transient: true,
    fbtrace_id: "trace",
  },
};

const settled = async <t>(promise: Promise<t>) => {
  await vi.runAllTimersAsync();
  return promise;
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("backoff_ms", () => {
  it("doubles from 400 ms and spreads each wait between half and one and a half times", () => {
    expect(backoff_ms(1, 0)).toBe(200);
    expect(backoff_ms(1, 1)).toBe(600);
    expect(backoff_ms(2, 0.5)).toBe(800);
    expect(backoff_ms(3, 0.5)).toBe(1600);
  });
});

describe("post_events_to_graph", () => {
  it("posts the JSON body to the versioned dataset endpoint with the token in the Authorization header", async () => {
    const fetch_mock = vi
      .fn()
      .mockResolvedValue(json_response(200, success_body));
    vi.stubGlobal("fetch", fetch_mock);
    await settled(post_events_to_graph(config, request));
    const [url, init] = fetch_mock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://graph.facebook.com/v26.0/123/events");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("authorization")).toBe(
      "Bearer EAAtoken",
    );
    expect(new Headers(init.headers).get("content-type")).toBe(
      "application/json",
    );
    expect(JSON.parse(String(init.body))).toEqual(request);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns the parsed success body with its status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json_response(200, success_body)),
    );
    await expect(
      settled(post_events_to_graph(config, request)),
    ).resolves.toEqual({ status: 200, body: success_body });
  });

  it("returns a refusal Meta marks as not transient without retrying", async () => {
    const fetch_mock = vi
      .fn()
      .mockResolvedValue(json_response(400, invalid_body));
    vi.stubGlobal("fetch", fetch_mock);
    await expect(
      settled(post_events_to_graph(config, request)),
    ).resolves.toEqual({ status: 400, body: invalid_body });
    expect(fetch_mock).toHaveBeenCalledTimes(1);
  });

  it("retries a refusal Meta marks as transient, waiting between attempts, and returns the answer that follows", async () => {
    const fetch_mock = vi
      .fn()
      .mockResolvedValueOnce(json_response(400, rate_limited_body))
      .mockResolvedValueOnce(json_response(200, success_body));
    vi.stubGlobal("fetch", fetch_mock);
    const outcome = post_events_to_graph(config, request);
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch_mock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(100);
    expect(fetch_mock).toHaveBeenCalledTimes(1);
    await expect(settled(outcome)).resolves.toEqual({
      status: 200,
      body: success_body,
    });
    expect(fetch_mock).toHaveBeenCalledTimes(2);
  });

  it("gives up on a transient refusal after three attempts and returns Meta's last answer", async () => {
    const fetch_mock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(json_response(400, rate_limited_body)),
      );
    vi.stubGlobal("fetch", fetch_mock);
    await expect(
      settled(post_events_to_graph(config, request)),
    ).resolves.toEqual({ status: 400, body: rate_limited_body });
    expect(fetch_mock).toHaveBeenCalledTimes(3);
  });

  it("retries a 5xx up to three attempts and returns the answer that follows", async () => {
    const fetch_mock = vi
      .fn()
      .mockResolvedValueOnce(
        json_response(503, { error: { message: "down", code: 2 } }),
      )
      .mockResolvedValueOnce(
        json_response(500, { error: { message: "down", code: 1 } }),
      )
      .mockResolvedValueOnce(json_response(200, success_body));
    vi.stubGlobal("fetch", fetch_mock);
    await expect(
      settled(post_events_to_graph(config, request)),
    ).resolves.toEqual({ status: 200, body: success_body });
    expect(fetch_mock).toHaveBeenCalledTimes(3);
  });

  it("throws a transport error carrying every failure after three 5xx answers", async () => {
    const fetch_mock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          json_response(500, { error: { message: "down", code: 1 } }),
        ),
      );
    vi.stubGlobal("fetch", fetch_mock);
    const outcome = settled(post_events_to_graph(config, request));
    await expect(outcome).rejects.toBeInstanceOf(meta_capi_transport_error);
    await expect(outcome).rejects.toMatchObject({
      cause: [expect.anything(), expect.anything(), expect.anything()],
    });
    expect(fetch_mock).toHaveBeenCalledTimes(3);
  });

  it("retries a network failure and keeps the causes when it never recovers", async () => {
    const failure = new TypeError("fetch failed");
    const fetch_mock = vi.fn().mockRejectedValue(failure);
    vi.stubGlobal("fetch", fetch_mock);
    const outcome = settled(post_events_to_graph(config, request));
    await expect(outcome).rejects.toBeInstanceOf(meta_capi_transport_error);
    await expect(outcome).rejects.toMatchObject({
      cause: [failure, failure, failure],
    });
    expect(fetch_mock).toHaveBeenCalledTimes(3);
  });

  it("recovers when the network failure does not repeat", async () => {
    const fetch_mock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(json_response(200, success_body));
    vi.stubGlobal("fetch", fetch_mock);
    await expect(
      settled(post_events_to_graph(config, request)),
    ).resolves.toEqual({ status: 200, body: success_body });
  });

  it("treats a 200 with an unreadable body as a transport failure, never as a success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>", { status: 200 })),
    );
    await expect(
      settled(post_events_to_graph(config, request)),
    ).rejects.toBeInstanceOf(meta_capi_transport_error);
  });
});
