import "server-only";
import * as z from "zod/mini";
import type { engine_config } from "./config";
import type { action_source, meta_event } from "./event_schema";
import type { hashed_user_data } from "./user_data_hashing";

export const graph_success_schema = z.object({
  events_received: z.int(),
  messages: z.array(z.string()),
  fbtrace_id: z.string(),
});

export const graph_error_schema = z.object({
  error: z.object({
    message: z.string(),
    type: z.optional(z.string()),
    code: z.int(),
    error_subcode: z.optional(z.int()),
    fbtrace_id: z.optional(z.string()),
    is_transient: z.optional(z.boolean()),
    error_user_title: z.optional(z.string()),
    error_user_msg: z.optional(z.string()),
  }),
});

export type graph_success = z.infer<typeof graph_success_schema>;
export type graph_error = z.infer<typeof graph_error_schema>["error"];

export type wire_event = Omit<
  meta_event,
  "event_time" | "action_source" | "user_data"
> & {
  event_time: number;
  action_source: action_source;
  user_data: hashed_user_data;
};

export type graph_events_request = {
  data: wire_event[];
  test_event_code?: string;
};

export type graph_outcome =
  | { status: number; body: graph_success }
  | { status: number; body: { error: graph_error } };

export class meta_capi_transport_error extends Error {}

const graph_origin = "https://graph.facebook.com";

export const retry_attempts = 3;
const first_backoff_ms = 400;

export const backoff_ms = (failed_attempts: number, random: number) =>
  Math.round(first_backoff_ms * 2 ** (failed_attempts - 1) * (0.5 + random));

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const parsed_json = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const attempt = async (
  config: engine_config,
  request: graph_events_request,
): Promise<graph_outcome> => {
  const response = await fetch(
    `${graph_origin}/${config.graph_version}/${config.dataset_id}/events`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(config.timeout_ms),
    },
  );
  const text = await response.text();
  const body = parsed_json(text);
  if (response.status >= 500) {
    throw new meta_capi_transport_error(
      `Graph API answered ${response.status}`,
      { cause: text },
    );
  }
  const success = graph_success_schema.safeParse(body);
  if (success.success) return { status: response.status, body: success.data };
  const failure = graph_error_schema.safeParse(body);
  if (failure.success) return { status: response.status, body: failure.data };
  throw new meta_capi_transport_error(
    `Graph API answered ${response.status} with an unreadable body`,
    { cause: text },
  );
};

const transient = (outcome: graph_outcome) =>
  "error" in outcome.body && outcome.body.error.is_transient === true;

export const post_events_to_graph = async (
  config: engine_config,
  request: graph_events_request,
): Promise<graph_outcome> => {
  const failures: unknown[] = [];
  for (let attempts = 1; attempts <= retry_attempts; attempts++) {
    if (attempts > 1) await sleep(backoff_ms(attempts - 1, Math.random()));
    try {
      const outcome = await attempt(config, request);
      if (!transient(outcome) || attempts === retry_attempts) return outcome;
      failures.push(outcome.body);
    } catch (failure) {
      failures.push(failure);
      if (attempts === retry_attempts) {
        throw new meta_capi_transport_error(
          `Graph API unreachable after ${retry_attempts} attempts`,
          { cause: failures },
        );
      }
    }
  }
  throw new meta_capi_transport_error(
    `Graph API unreachable after ${retry_attempts} attempts`,
    { cause: failures },
  );
};
