import * as z from "zod/mini";

export const browser_context_schema = z.strictObject({
  event_source_url: z.url(),
  referrer_url: z.optional(z.string()),
  event_id: z.string().check(z.minLength(1)),
});

export type browser_context = z.infer<typeof browser_context_schema>;

export const browser_context = (): browser_context => ({
  event_source_url: window.location.href,
  referrer_url: document.referrer || undefined,
  event_id: crypto.randomUUID(),
});
