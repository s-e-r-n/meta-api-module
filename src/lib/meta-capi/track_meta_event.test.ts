import { beforeEach, describe, expect, it, vi } from "vitest";
import { browser_context } from "./browser_context";
import { submit_browser_meta_event } from "./submit_browser_meta_event";
import {
  meta_capi_invalid_event_error,
  track_meta_event,
} from "./track_meta_event";

vi.mock("./browser_context", () => ({ browser_context: vi.fn() }));
vi.mock("./submit_browser_meta_event", () => ({
  submit_browser_meta_event: vi.fn(),
}));

const submit = vi.mocked(submit_browser_meta_event);
const context = {
  event_source_url: "https://shop.example/p/1?x=1",
  event_id: "uuid-1",
};
const sent = {
  ok: true as const,
  events_received: 1,
  fbtrace_id: "trace",
  messages: [],
  warnings: [],
};

beforeEach(() => {
  submit.mockReset();
  submit.mockResolvedValue(sent);
  vi.mocked(browser_context).mockReturnValue(context);
});

describe("track_meta_event", () => {
  it("hands the declaration and the browser context to the server action", async () => {
    await expect(
      track_meta_event({
        event_name: "Lead",
        custom_data: { value: 1, currency: "chf" },
      }),
    ).resolves.toEqual(sent);
    expect(submit).toHaveBeenCalledWith({
      event: { event_name: "Lead", custom_data: { value: 1, currency: "chf" } },
      browser: context,
    });
  });

  it("refuses an invalid declaration before any network call", async () => {
    await expect(
      track_meta_event({ event_name: "Purchase", custom_data: { value: 1 } }),
    ).rejects.toBeInstanceOf(meta_capi_invalid_event_error);
    await expect(
      track_meta_event({ event_name: "Purchase", custom_data: { value: 1 } }),
    ).rejects.toThrow(/custom_data\.currency/);
    expect(submit).not.toHaveBeenCalled();
  });
});
