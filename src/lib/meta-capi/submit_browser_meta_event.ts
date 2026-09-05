"use server";

import * as z from "zod/mini";
import {
  type browser_context,
  browser_context_schema,
} from "./browser_context";
import {
  type browser_event,
  browser_event_schema,
  issue_list,
} from "./event_schema";
import {
  meta_capi_rejected_error,
  type meta_send_ok,
} from "./send_meta_events";
import { send_within_visitor_request } from "./visitor_request";

const browser_submission_schema = z.strictObject({
  event: browser_event_schema,
  browser: browser_context_schema,
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
  const { event, browser } = parsed.data;
  const result = await send_within_visitor_request({
    event,
    event_source_url: browser.event_source_url,
    referrer_url: browser.referrer_url,
    event_id: browser.event_id,
  });
  if (!result.ok) throw new meta_capi_rejected_error(result);
  return result;
};
