import type { browser_context as browser_context_shape } from "./event_schema";

export const browser_context = (): browser_context_shape => ({
  event_source_url: window.location.href,
  referrer_url: document.referrer || undefined,
  event_id: crypto.randomUUID(),
});
