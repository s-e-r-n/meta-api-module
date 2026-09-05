import "server-only";
import { cookies, headers } from "next/headers";
import { engine_config } from "./config";
import { person_identity_warning } from "./event_catalog";
import type { browser_event, meta_event } from "./event_schema";
import { identity_cookie_options, request_context } from "./request_context";
import {
  type meta_send_result,
  send_parsed_meta_events,
} from "./send_meta_events";
import { as_list } from "./user_data";

type visitor_send = {
  event: browser_event;
  event_source_url: string;
  referrer_url?: string;
  event_id?: string;
};

const refused = (path: string, message: string): meta_send_result => ({
  ok: false,
  reason: "invalid_event",
  issues: [{ index: 0, path, message }],
});

export const send_within_visitor_request = async ({
  event,
  event_source_url,
  referrer_url,
  event_id,
}: visitor_send): Promise<meta_send_result> => {
  const config = engine_config();
  const page_url = new URL(event_source_url);
  if (
    config.site_origin !== undefined &&
    page_url.origin !== config.site_origin
  ) {
    return refused(
      "event_source_url",
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
    event_source_url,
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
    event_id: event.event_id ?? event_id,
    event_time: Math.floor(now_ms / 1000),
    action_source: "website",
    event_source_url,
    referrer_url,
    user_data: {
      ...event.user_data,
      ...identity,
      external_id: [...as_list(event.user_data?.external_id), external_id],
    },
  };
  const result = await send_parsed_meta_events([server_event]);
  const warning = person_identity_warning(event.event_name, event.user_data);
  return result.ok && warning !== undefined
    ? { ...result, warnings: [...result.warnings, warning] }
    : result;
};
