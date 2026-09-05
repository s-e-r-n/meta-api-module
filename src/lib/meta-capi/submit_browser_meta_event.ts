"use server";

import { cookies, headers } from "next/headers";
import { engine_config } from "./config";
import {
  type browser_submission,
  browser_submission_schema,
  issue_list,
  type meta_event_input,
} from "./event_schema";
import {
  meta_capi_rejected_error,
  type meta_send_ok,
  send_meta_events,
} from "./send_meta_events";
import { visitor_identity } from "./visitor_identity";

const refused = (path: string, message: string) =>
  new meta_capi_rejected_error({
    ok: false,
    reason: "invalid_event",
    issues: [{ index: 0, path, message }],
  });

export const submit_browser_meta_event = async (
  submission: browser_submission,
): Promise<meta_send_ok> => {
  const parsed = browser_submission_schema.safeParse(submission);
  if (!parsed.success) {
    throw new meta_capi_rejected_error({
      ok: false,
      reason: "invalid_event",
      issues: issue_list(parsed.error).map((issue) => ({ index: 0, ...issue })),
    });
  }
  const config = engine_config();
  const { event, browser } = parsed.data;
  if (
    config.site_origin !== undefined &&
    new URL(browser.event_source_url).origin !== config.site_origin
  ) {
    throw refused(
      "browser.event_source_url",
      `the page origin does not match ${config.site_origin}`,
    );
  }
  const [request_headers, cookie_store] = await Promise.all([
    headers(),
    cookies(),
  ]);
  const now_ms = Date.now();
  const identity = visitor_identity({
    headers: request_headers,
    cookie: (name) => cookie_store.get(name)?.value,
    event_source_url: browser.event_source_url,
    now_ms,
  });
  const server_event: meta_event_input = {
    ...event,
    event_id: event.event_id ?? browser.event_id,
    event_time: Math.floor(now_ms / 1000),
    action_source: "website",
    event_source_url: browser.event_source_url,
    referrer_url: browser.referrer_url,
    user_data: { ...event.user_data, ...identity },
  };
  const result = await send_meta_events([server_event]);
  if (!result.ok) throw new meta_capi_rejected_error(result);
  return result;
};
