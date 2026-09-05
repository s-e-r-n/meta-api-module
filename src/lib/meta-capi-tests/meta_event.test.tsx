import { act, render } from "@testing-library/react";
import { usePathname, useSearchParams } from "next/navigation";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MetaEvent } from "../meta-capi/meta_event";
import { track_declared_meta_event } from "../meta-capi/track_meta_event";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));
vi.mock("../meta-capi/track_meta_event", () => ({
  track_declared_meta_event: vi.fn(),
}));

const track = vi.mocked(track_declared_meta_event);

const at_url = (pathname: string, search: string) => {
  vi.mocked(usePathname).mockReturnValue(pathname);
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(search) as unknown as ReturnType<
      typeof useSearchParams
    >,
  );
};

const settle = () => act(async () => {});

beforeEach(() => {
  track.mockReset();
  track.mockResolvedValue({
    ok: true,
    events_received: 1,
    fbtrace_id: "trace",
    messages: [],
    warnings: [],
  });
  at_url("/products/42", "ref=home");
});

describe("MetaEvent", () => {
  it("renders nothing", () => {
    const { container } = render(<MetaEvent event_name="ViewContent" />);
    expect(container.innerHTML).toBe("");
  });

  it("fires once when it appears, with exactly the declared event", async () => {
    render(
      <MetaEvent
        event_name="ViewContent"
        custom_data={{ content_ids: ["42"], content_type: "product" }}
      />,
    );
    await settle();
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith({
      event_name: "ViewContent",
      custom_data: { content_ids: ["42"], content_type: "product" },
    });
  });

  it("fires once under StrictMode's double effect cycle", async () => {
    render(
      <StrictMode>
        <MetaEvent event_name="PageView" />
      </StrictMode>,
    );
    await settle();
    expect(track).toHaveBeenCalledTimes(1);
  });

  it("does not fire again on a rerender with the same declaration", async () => {
    const { rerender } = render(
      <MetaEvent
        event_name="ViewContent"
        custom_data={{ content_ids: ["42"] }}
      />,
    );
    await settle();
    rerender(
      <MetaEvent
        event_name="ViewContent"
        custom_data={{ content_ids: ["42"] }}
      />,
    );
    await settle();
    expect(track).toHaveBeenCalledTimes(1);
  });

  it("fires again when the declaration changes", async () => {
    const { rerender } = render(
      <MetaEvent
        event_name="ViewContent"
        custom_data={{ content_ids: ["42"] }}
      />,
    );
    await settle();
    rerender(
      <MetaEvent
        event_name="ViewContent"
        custom_data={{ content_ids: ["43"] }}
      />,
    );
    await settle();
    expect(track).toHaveBeenCalledTimes(2);
    expect(track).toHaveBeenLastCalledWith({
      event_name: "ViewContent",
      custom_data: { content_ids: ["43"] },
    });
  });

  it("fires again when the URL changes while it stays mounted", async () => {
    const { rerender } = render(<MetaEvent event_name="PageView" />);
    await settle();
    at_url("/products/42", "page=2");
    rerender(<MetaEvent event_name="PageView" />);
    await settle();
    expect(track).toHaveBeenCalledTimes(2);
  });

  it("does not fire when it disappears before its turn", async () => {
    const { unmount } = render(<MetaEvent event_name="PageView" />);
    unmount();
    await settle();
    expect(track).not.toHaveBeenCalled();
  });

  it("fires from the browser only, never during server rendering", async () => {
    const { renderToString } = await import("react-dom/server");
    renderToString(<MetaEvent event_name="PageView" />);
    await settle();
    expect(track).not.toHaveBeenCalled();
  });
});
