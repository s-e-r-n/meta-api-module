import * as z from "zod/mini";
import type { user_data_input } from "./user_data";

export const standard_event_names = [
  "AddPaymentInfo",
  "AddToCart",
  "AddToWishlist",
  "CompleteRegistration",
  "Contact",
  "CustomizeProduct",
  "Donate",
  "FindLocation",
  "InitiateCheckout",
  "Lead",
  "Purchase",
  "Schedule",
  "Search",
  "StartTrial",
  "SubmitApplication",
  "Subscribe",
  "ViewContent",
  "PageView",
  "AppendAttribution",
] as const;

export type standard_event_name = (typeof standard_event_names)[number];

export type field_requirements = {
  readonly custom_data?: readonly string[];
  readonly user_data?: readonly (keyof user_data_input)[];
  readonly attribution_data?: true;
  readonly event_source_url?: true;
};

export type event_rules = {
  readonly requires?: field_requirements;
  readonly recommends?: field_requirements;
};

export type event_rule_table = { readonly [event_name: string]: event_rules };

export const standard_event_rules = {
  Purchase: { requires: { custom_data: ["value", "currency"] } },
  AppendAttribution: {
    requires: { custom_data: ["currency"], attribution_data: true },
  },
} as const satisfies Partial<Record<standard_event_name, event_rules>>;

export const custom_data_key_scopes = {
  num_items: ["InitiateCheckout"],
  search_string: ["Search"],
  status: ["CompleteRegistration"],
} as const satisfies Record<string, readonly standard_event_name[]>;

export type scoped_custom_data_key = keyof typeof custom_data_key_scopes;

export const action_source_rules = {
  website: {
    requires: { event_source_url: true },
    recommends: { user_data: ["client_user_agent"] },
  },
} as const satisfies event_rule_table;

export const attribution_data_schema = z.strictObject({
  ad_id: z.string().check(z.minLength(1)),
  touchpoint_ts: z.int().check(z.gte(0)),
  attribution_share: z.number().check(z.gte(0), z.lte(1)),
  attribution_value: z.number().check(z.gte(0)),
});

export type attribution_data_input = z.infer<typeof attribution_data_schema>;

type custom_events_of<p> = p extends {
  readonly custom_events: infer c extends readonly string[];
}
  ? c
  : readonly [];

type events_of<p> = p extends { readonly events: infer e }
  ? e
  : Record<never, never>;

export type meta_capi_policy<p> = {
  readonly custom_events?: readonly string[];
  readonly every_event?: event_rules;
  readonly events?: {
    readonly [name in keyof events_of<p>]: name extends
      | standard_event_name
      | custom_events_of<p>[number]
      ? event_rules
      : never;
  };
};

export const define_policy = <const p extends meta_capi_policy<p>>(policy: p) =>
  policy;

export type rule_subject = {
  custom_data?: Record<string, unknown>;
  user_data?: Record<string, unknown>;
  attribution_data?: unknown;
  event_source_url?: unknown;
};

const absent = (value: unknown) =>
  value === undefined || (Array.isArray(value) && value.length === 0);

export const missing_fields = (
  subject: rule_subject,
  requirements: field_requirements | undefined,
): string[][] => {
  if (requirements === undefined) return [];
  const missing: string[][] = [];
  for (const key of requirements.custom_data ?? []) {
    if (absent(subject.custom_data?.[key])) missing.push(["custom_data", key]);
  }
  for (const key of requirements.user_data ?? []) {
    if (absent(subject.user_data?.[key])) missing.push(["user_data", key]);
  }
  if (requirements.attribution_data && absent(subject.attribution_data))
    missing.push(["attribution_data"]);
  if (requirements.event_source_url && absent(subject.event_source_url))
    missing.push(["event_source_url"]);
  return missing;
};

export const out_of_scope_keys = (
  event_name: string,
  custom_data: Record<string, unknown> | undefined,
): string[] =>
  Object.entries(custom_data_key_scopes).flatMap(([key, events]) =>
    custom_data?.[key] !== undefined &&
    !(events as readonly string[]).includes(event_name)
      ? [key]
      : [],
  );
