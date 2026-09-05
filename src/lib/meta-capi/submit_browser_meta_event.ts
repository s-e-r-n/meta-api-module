"use server";

import { cookies, headers } from "next/headers";
import * as z from "zod/mini";
import {
  type browser_context,
  browser_context_schema,
} from "./browser_context";
import { engine_config } from "./config";
import {
  type browser_event,
  browser_event_schema,
  issue_list,
  type meta_event,
} from "./event_schema";
import { identity_cookie_options, request_context } from "./request_context";
import {
  meta_capi_rejected_error,
  type meta_send_ok,
  send_parsed_meta_events,
} from "./send_meta_events";
import { as_list } from "./user_data";

const browser_submission_schema = z.strictObject({
  event: browser_event_schema,
  browser: browser_context_schema,
});

const refused = (path: string, message: string) =>
  new meta_capi_rejected_error({
    ok: false,
    reason: "invalid_event",
    issues: [{ index: 0, path, message }],
  });

export const submit_browser_meta_event = async (submission: {
  event: browser_event;
  browser: browser_context;
}): Promise<meta_send_ok> => {
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
  const page_url = new URL(browser.event_source_url);
  if (
    config.site_origin !== undefined &&
    page_url.origin !== config.site_origin
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
  const { cookies_to_set, external_id, ...identity } = request_context({
    headers: request_headers,
    cookie: (name) => cookie_store.get(name)?.value,
    event_source_url: browser.event_source_url,
    now_ms,
  });
  const cookie_options = identity_cookie_options({
    https: page_url.protocol === "https:",
    domain: config.cookie_domain,
  });
  for (const [name, value] of Object.entries(cookies_to_set)) {
    cookie_store.set(name, value, cookie_options);
  }
  const server_event: meta_event = {
    ...event,
    event_id: event.event_id ?? browser.event_id,
    event_time: Math.floor(now_ms / 1000),
    action_source: "website",
    event_source_url: browser.event_source_url,
    referrer_url: browser.referrer_url,
    user_data: {
      ...event.user_data,
      ...identity,
      external_id: [...as_list(event.user_data?.external_id), external_id],
    },
  };
  const result = await send_parsed_meta_events([server_event]);
  if (!result.ok) throw new meta_capi_rejected_error(result);
  return result;
};
