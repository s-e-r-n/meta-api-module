import { browser_context } from "./browser_context";
import {
  browser_event_schema,
  type browser_meta_event,
  issue_list,
} from "./event_schema";
import type { meta_send_ok } from "./send_meta_events";
import { submit_browser_meta_event } from "./submit_browser_meta_event";

export class meta_capi_invalid_event_error extends Error {}

export const track_meta_event = async (
  event: browser_meta_event,
): Promise<meta_send_ok> => {
  const parsed = browser_event_schema.safeParse(event);
  if (!parsed.success) {
    const details = issue_list(parsed.error)
      .map(({ path, message }) => `${path}: ${message}`)
      .join("; ");
    throw new meta_capi_invalid_event_error(
      `Meta event refused before sending: ${details}`,
    );
  }
  return submit_browser_meta_event({
    event: parsed.data,
    browser: browser_context(),
  });
};
