import "server-only";
import { headers } from "next/headers";
import { engine_config } from "./config";
import {
  browser_event_schema,
  type browser_meta_event,
  issue_list,
} from "./event_schema";
import type { meta_send_result } from "./send_meta_events";
import { send_within_visitor_request } from "./visitor_request";

export type visitor_send_options = { event_source_url?: string };

const page_url_of = async (given: string | undefined) => {
  if (given !== undefined) return given;
  const referer = (await headers()).get("referer");
  if (referer) return referer;
  const { site_origin } = engine_config();
  return site_origin === undefined ? undefined : `${site_origin}/`;
};

export const send_visitor_meta_event = async (
  event: browser_meta_event,
  options: visitor_send_options = {},
): Promise<meta_send_result> => {
  const parsed = browser_event_schema.safeParse(event);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid_event",
      issues: issue_list(parsed.error).map((issue) => ({ index: 0, ...issue })),
    };
  }
  const event_source_url = await page_url_of(options.event_source_url);
  if (event_source_url === undefined) {
    return {
      ok: false,
      reason: "invalid_event",
      issues: [
        {
          index: 0,
          path: "event_source_url",
          message:
            "no Referer header on this request: pass event_source_url or set META_CAPI_SITE_ORIGIN",
        },
      ],
    };
  }
  return send_within_visitor_request({ event: parsed.data, event_source_url });
};
