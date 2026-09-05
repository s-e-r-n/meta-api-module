import "server-only";
import { engine_config } from "./config";
import {
  event_schema,
  issue_list,
  type meta_event,
  type meta_event_input,
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

const invalid = (issues: event_issue[]): meta_send_refusal => ({
  ok: false,
  reason: "invalid_event",
  issues,
});

const parsed_events = (events: meta_event_input[]) => {
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
  );
  const action_source = event.action_source ?? "website";
  if (
    action_source === "website" &&
    hashed.user_data.client_user_agent === undefined
  ) {
    warnings.push(
      `data[${index}].user_data.client_user_agent missing: Meta documents it as required for website events`,
    );
  }
  const currency = event.custom_data?.currency;
  return {
    ...event,
    event_time: event.event_time ?? now_s,
    action_source,
    user_data: hashed.user_data,
    custom_data:
      event.custom_data === undefined
        ? undefined
        : {
            ...event.custom_data,
            currency:
              currency === undefined ? undefined : currency.toUpperCase(),
          },
  };
};

export const send_meta_events = async (
  events: meta_event_input[],
  options: send_options = {},
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
