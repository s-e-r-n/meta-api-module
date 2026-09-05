import { browser_context } from "./browser_context";
import {
  type browser_event,
  browser_event_schema,
  type browser_meta_event,
  issue_list,
  meta_capi_invalid_event_error,
} from "./event_schema";
import type { meta_send_ok } from "./send_meta_events";
import { submit_browser_meta_event } from "./submit_browser_meta_event";

export const track_declared_meta_event = (
  declaration: browser_event,
): Promise<meta_send_ok> =>
  submit_browser_meta_event({ event: declaration, browser: browser_context() });

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
  return track_declared_meta_event(parsed.data);
};
