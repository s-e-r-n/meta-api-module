import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { meta_capi_config_error } from "./config";
import type { meta_event_input } from "./event_schema";
import { post_events_to_graph } from "./graph_api_client";
import { send_meta_events } from "./send_meta_events";

vi.mock("./graph_api_client", async (import_actual) => ({
  ...(await import_actual<typeof import("./graph_api_client")>()),
  post_events_to_graph: vi.fn(),
}));

const post = vi.mocked(post_events_to_graph);
const now = 1_700_000_000;
const john_smith_hash =
  "62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f";

const purchase: meta_event_input = {
  event_name: "Purchase",
  event_source_url: "https://shop.example/thank-you?order=1",
  user_data: { em: "John_Smith@gmail.com", client_user_agent: "Mozilla/5.0" },
  custom_data: { value: 42, currency: "chf", content_ids: ["sku-1"] },
};

beforeEach(() => {
  vi.useFakeTimers({ now: now * 1000 });
  vi.stubEnv("META_CAPI_DATASET_ID", "123");
  vi.stubEnv("META_CAPI_ACCESS_TOKEN", "EAAtoken");
  vi.stubEnv("META_CAPI_TEST_EVENT_CODE", "");
  post.mockReset();
  post.mockResolvedValue({
    status: 200,
    body: { events_received: 1, messages: [], fbtrace_id: "trace" },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("send_meta_events", () => {
  it("returns the refusal of an invalid event without touching the network", async () => {
    const result = await send_meta_events([
      { ...purchase, custom_data: { value: 42 } },
    ]);
    expect(result).toEqual({
      ok: false,
      reason: "invalid_event",
      issues: [
        { index: 0, path: "custom_data.currency", message: expect.any(String) },
      ],
    });
    expect(post).not.toHaveBeenCalled();
  });

  it("hashes the identity, stamps the defaults, uppercases the currency and posts one batch", async () => {
    const result = await send_meta_events([purchase]);
    expect(result).toEqual({
      ok: true,
      events_received: 1,
      fbtrace_id: "trace",
      messages: [],
      warnings: [],
    });
    const [config, request] = post.mock.calls[0] ?? [];
    expect(config?.dataset_id).toBe("123");
    expect(request).toEqual({
      data: [
        {
          event_name: "Purchase",
          event_time: now,
          action_source: "website",
          event_source_url: "https://shop.example/thank-you?order=1",
          user_data: {
            em: [john_smith_hash],
            client_user_agent: "Mozilla/5.0",
          },
          custom_data: { value: 42, currency: "CHF", content_ids: ["sku-1"] },
        },
      ],
      test_event_code: undefined,
    });
  });

  it("keeps the event_time and event_id a caller provides", async () => {
    await send_meta_events([
      { ...purchase, event_time: now - 60, event_id: "order-1" },
    ]);
    const request = post.mock.calls[0]?.[1];
    expect(request?.data[0]).toMatchObject({
      event_time: now - 60,
      event_id: "order-1",
    });
  });

  it("takes the test event code from the options, then from the environment", async () => {
    vi.stubEnv("META_CAPI_TEST_EVENT_CODE", "ENV1");
    await send_meta_events([purchase]);
    expect(post.mock.calls[0]?.[1].test_event_code).toBe("ENV1");
    await send_meta_events([purchase], { test_event_code: "OPT1" });
    expect(post.mock.calls[1]?.[1].test_event_code).toBe("OPT1");
  });

  it("returns Meta's refusal with its status", async () => {
    const error = {
      message: "Invalid parameter",
      type: "OAuthException",
      code: 100,
      fbtrace_id: "trace",
    };
    post.mockResolvedValue({ status: 400, body: { error } });
    await expect(send_meta_events([purchase])).resolves.toEqual({
      ok: false,
      reason: "graph_rejected",
      status: 400,
      error,
    });
  });

  it("refuses an empty batch and a batch above Meta's limit of 1000", async () => {
    await expect(send_meta_events([])).resolves.toMatchObject({
      ok: false,
      reason: "invalid_event",
    });
    const too_many = Array.from({ length: 1001 }, () => purchase);
    await expect(send_meta_events(too_many)).resolves.toMatchObject({
      ok: false,
      reason: "invalid_event",
    });
    expect(post).not.toHaveBeenCalled();
  });

  it("reports the identifiers it had to drop", async () => {
    const result = await send_meta_events([
      { ...purchase, user_data: { ...purchase.user_data, ge: "unknown" } },
    ]);
    expect(result).toMatchObject({
      ok: true,
      warnings: [expect.stringContaining("ge")],
    });
  });

  it("points at the failing event in a batch", async () => {
    const result = await send_meta_events([
      purchase,
      { ...purchase, event_name: "" },
    ]);
    expect(result).toMatchObject({
      ok: false,
      reason: "invalid_event",
      issues: [{ index: 1, path: "event_name" }],
    });
  });

  it("throws when the environment is not configured", async () => {
    vi.stubEnv("META_CAPI_ACCESS_TOKEN", "");
    await expect(send_meta_events([purchase])).rejects.toBeInstanceOf(
      meta_capi_config_error,
    );
  });
});
