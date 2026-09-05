import "server-only";
import * as z from "zod/mini";
import { engine_config } from "./config";
import { wire_custom_data } from "./custom_data";
import {
  event_schema,
  issue_list,
  type meta_event,
  type meta_event_input,
  recommendation_warnings,
} from "./event_schema";
import {
  type graph_error,
  post_events_to_graph,
  type wire_event,
} from "./graph_api_client";
import { hashed_user_data } from "./user_data_hashing";

export type event_issue = { index: number; path: string; message: string };

export type meta_send_ok = {
  ok: true;
  events_received: number;
  fbtrace_id: string;
  messages: string[];
  warnings: string[];
};

export type meta_send_refusal =
  | { ok: false; reason: "invalid_event"; issues: event_issue[] }
  | { ok: false; reason: "graph_rejected"; status: number; error: graph_error };

export type meta_send_result = meta_send_ok | meta_send_refusal;

export type send_options = { test_event_code?: string };

export class meta_capi_rejected_error extends Error {
  readonly result: meta_send_refusal;

  constructor(result: meta_send_refusal) {
    super(
      result.reason === "invalid_event"
        ? `Meta event refused: ${result.issues.map(({ index, path, message }) => `[${index}] ${path}: ${message}`).join("; ")}`
        : `Meta refused the events (${result.status}, code ${result.error.code}): ${result.error.message}`,
    );
    this.result = result;
  }
}

const batch_limit = 1000;

const inbound_envelope_schema = z.object({ events: z.array(z.unknown()) });

const invalid = (issues: event_issue[]): meta_send_refusal => ({
  ok: false,
  reason: "invalid_event",
  issues,
});

const parsed_events = (events: readonly unknown[]) => {
  const valid: meta_event[] = [];
  const issues: event_issue[] = [];
  events.forEach((event, index) => {
    const parsed = event_schema.safeParse(event);
    if (parsed.success) valid.push(parsed.data);
    else
      issues.push(
        ...issue_list(parsed.error).map((issue) => ({ index, ...issue })),
      );
  });
  return { valid, issues };
};

const wire_event_of = (
  event: meta_event,
  index: number,
  now_s: number,
  warnings: string[],
): wire_event => {
  const hashed = hashed_user_data(event.user_data ?? {});
  warnings.push(
    ...hashed.warnings.map((warning) => `data[${index}].${warning}`),
    ...recommendation_warnings(event).map(
      (warning) => `data[${index}]: ${warning}`,
    ),
  );
  return {
    ...event,
    event_time: event.event_time ?? now_s,
    action_source: event.action_source ?? "website",
    user_data: hashed.user_data,
    custom_data:
      event.custom_data === undefined
        ? undefined
        : wire_custom_data(event.custom_data),
  };
};

const send_after_parse = async (
  events: readonly unknown[],
  options: send_options,
): Promise<meta_send_result> => {
  const config = engine_config();
  if (events.length === 0 || events.length > batch_limit) {
    return invalid([
      {
        index: 0,
        path: "data",
        message: `a batch holds between 1 and ${batch_limit} events`,
      },
    ]);
  }
  const { valid, issues } = parsed_events(events);
  if (issues.length > 0) return invalid(issues);
  const warnings: string[] = [];
  const now_s = Math.floor(Date.now() / 1000);
  const request = {
    data: valid.map((event, index) =>
      wire_event_of(event, index, now_s, warnings),
    ),
    test_event_code: options.test_event_code ?? config.test_event_code,
  };
  const outcome = await post_events_to_graph(config, request);
  if ("error" in outcome.body)
    return {
      ok: false,
      reason: "graph_rejected",
      status: outcome.status,
      error: outcome.body.error,
    };
  return { ok: true, ...outcome.body, warnings };
};

export const send_meta_events = (
  events: meta_event_input[],
  options: send_options = {},
) => send_after_parse(events, options);

export const send_parsed_meta_events = (
  events: meta_event[],
  options: send_options = {},
) => send_after_parse(events, options);

export const send_inbound_meta_events = (
  payload: unknown,
  options: send_options = {},
) => {
  const envelope = inbound_envelope_schema.safeParse(payload);
  if (!envelope.success) {
    return Promise.resolve(
      invalid([
        {
          index: 0,
          path: "events",
          message: 'the body must be { "events": [ ... ] }',
        },
      ]),
    );
  }
  return send_after_parse(envelope.data.events, options);
};
