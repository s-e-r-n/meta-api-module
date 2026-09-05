import * as z from "zod/mini";
import {
  type commerce_key,
  type custom_data_input,
  custom_data_schema,
  type custom_property,
} from "./custom_data";
import {
  action_source_rules,
  type attribution_data_input,
  attribution_data_schema,
  type event_rules,
  missing_fields,
  type rule_subject,
  type standard_event_name,
  standard_event_names,
  standard_event_rules,
} from "./event_catalog";
import { policy } from "./policy";
import { browser_user_data_schema, user_data_schema } from "./user_data";

export class meta_capi_invalid_event_error extends Error {}

export type issue = { path: string; message: string };

export const issue_list = (error: z.core.$ZodError): issue[] =>
  error.issues.flatMap((issue) => {
    const path = issue.path.map(String);
    if (issue.code === "unrecognized_keys") {
      return issue.keys.map((key) => ({
        path: [...path, key].join("."),
        message: `Unknown key "${key}"`,
      }));
    }
    return [{ path: path.join("."), message: issue.message }];
  });

type rule_lookup = { readonly [event_name: string]: event_rules | undefined };

const catalog: rule_lookup = standard_event_rules;
const site: rule_lookup = policy;
const action_sources: rule_lookup = action_source_rules;

const declared_names = new Set<string>([
  ...standard_event_names,
  ...Object.keys(policy).filter((name) => name !== "*"),
]);

const seven_days_s = 7 * 86_400;
const clock_skew_s = 600;

const event_name_text = z.string().check(z.minLength(1), z.maxLength(50));

const event_name_schema = z.string().check(
  z.maxLength(50),
  z.refine(
    (name) => declared_names.has(name),
    "unknown event name, declare it in policy.ts",
  ),
);

const event_time_schema = z.int().check(
  z.gte(0),
  z.refine((event_time) => {
    const now = Math.floor(Date.now() / 1000);
    return event_time >= now - seven_days_s && event_time <= now + clock_skew_s;
  }, "event_time must be within the last 7 days and at most 10 minutes ahead"),
);

const action_source_schema = z.enum([
  "email",
  "website",
  "app",
  "phone_call",
  "chat",
  "physical_store",
  "system_generated",
  "business_messaging",
  "other",
]);

export type action_source = z.infer<typeof action_source_schema>;

const data_processing_shape = {
  data_processing_options: z.optional(z.array(z.literal("LDU"))),
  data_processing_options_country: z.optional(
    z.union([z.literal(0), z.literal(1)]),
  ),
  data_processing_options_state: z.optional(
    z
      .int()
      .check(
        z.refine((state) => state === 0 || (state >= 1000 && state <= 1013)),
      ),
  ),
};

const customer_segmentation_schema = z.enum([
  "new_customer_to_business",
  "new_customer_to_business_line",
  "new_customer_to_product_area",
  "new_customer_to_medium",
  "existing_customer_to_business",
  "existing_customer_to_business_line",
  "existing_customer_to_product_area",
  "existing_customer_to_medium",
  "customer_in_loyalty_program",
]);

const original_event_data_schema = z.strictObject({
  event_name: z.optional(event_name_text),
  event_time: z.optional(z.int().check(z.gte(0))),
  order_id: z.optional(z.string()),
  event_id: z.optional(z.string()),
});

const declaration_shape = {
  event_name: event_name_schema,
  event_id: z.optional(z.string().check(z.minLength(1))),
  custom_data: z.optional(custom_data_schema),
  opt_out: z.optional(z.boolean()),
  ...data_processing_shape,
  customer_segmentation: z.optional(customer_segmentation_schema),
  original_event_data: z.optional(original_event_data_schema),
  attribution_data: z.optional(attribution_data_schema),
};

type declaration_value = rule_subject & {
  event_name: string;
  action_source?: string;
  data_processing_options?: readonly "LDU"[];
  data_processing_options_country?: number;
};

type rule_source = readonly [label: string, rules: event_rules | undefined];

const declaration_sources = (value: declaration_value): rule_source[] => [
  [value.event_name, catalog[value.event_name]],
  [value.event_name, site[value.event_name]],
  ["every event", site["*"]],
];

const envelope_sources = (value: declaration_value): rule_source[] => {
  const source = value.action_source ?? "website";
  return [[`${source} events`, action_sources[source]]];
};

const push_missing = (
  ctx: z.core.ParsePayload<declaration_value>,
  sources: rule_source[],
) => {
  for (const [label, rules] of sources) {
    for (const path of missing_fields(ctx.value, rules?.requires)) {
      ctx.issues.push({
        code: "custom",
        message: `${label} requires ${path.join(".")}`,
        input: ctx.value,
        path,
      });
    }
  }
};

const declaration_rules = (ctx: z.core.ParsePayload<declaration_value>) => {
  const { value } = ctx;
  push_missing(ctx, declaration_sources(value));
  if (
    value.data_processing_options?.includes("LDU") &&
    value.data_processing_options_country === undefined
  ) {
    ctx.issues.push({
      code: "custom",
      message: "Limited Data Use requires data_processing_options_country",
      input: value,
      path: ["data_processing_options_country"],
    });
  }
};

const envelope_rules = (ctx: z.core.ParsePayload<declaration_value>) =>
  push_missing(ctx, envelope_sources(ctx.value));

export const browser_event_schema = z
  .strictObject({
    ...declaration_shape,
    user_data: z.optional(browser_user_data_schema),
  })
  .check(declaration_rules);

export const event_schema = z
  .strictObject({
    ...declaration_shape,
    event_time: z.optional(event_time_schema),
    action_source: z.optional(action_source_schema),
    event_source_url: z.optional(z.url()),
    referrer_url: z.optional(z.string()),
    user_data: z.optional(user_data_schema),
  })
  .check(declaration_rules, envelope_rules);

export type meta_event = z.infer<typeof event_schema>;
export type browser_event = z.infer<typeof browser_event_schema>;

export const recommendation_warnings = (event: meta_event): string[] =>
  [...declaration_sources(event), ...envelope_sources(event)].flatMap(
    ([label, rules]) =>
      missing_fields(event, rules?.recommends).map(
        (path) =>
          `${label}: ${path.join(".")} is recommended by Meta and missing`,
      ),
  );

type catalog_rules = typeof standard_event_rules;
type site_rules = typeof policy;

type rules_of<table, name> = name extends keyof table ? table[name] : never;

type listed<rules, section extends string> = rules extends {
  readonly requires: {
    readonly [k in section]: readonly (infer key extends string)[];
  };
}
  ? key
  : never;

type required_keys<pol, name, section extends string> =
  | listed<rules_of<catalog_rules, name>, section>
  | listed<rules_of<pol, name>, section>
  | listed<rules_of<pol, "*">, section>;

type requires_attribution<pol, name> =
  | rules_of<catalog_rules, name>
  | rules_of<pol, name>
  | rules_of<pol, "*"> extends infer r
  ? r extends { readonly requires: { readonly attribution_data: true } }
    ? true
    : never
  : never;

type required_custom<keys extends string> = {
  [key in keys]-?: key extends commerce_key
    ? Exclude<custom_data_input[key], undefined>
    : custom_property;
};

type required_user<u, keys extends string> = {
  [key in keys]-?: key extends keyof u ? Exclude<u[key], undefined> : never;
};

type custom_data_part<pol, name> = [
  required_keys<pol, name, "custom_data">,
] extends [never]
  ? { custom_data?: custom_data_input }
  : {
      custom_data: custom_data_input &
        required_custom<required_keys<pol, name, "custom_data">>;
    };

type user_data_part<u, pol, name> = [
  required_keys<pol, name, "user_data">,
] extends [never]
  ? { user_data?: u }
  : { user_data: u & required_user<u, required_keys<pol, name, "user_data">> };

type attribution_part<pol, name> = [requires_attribution<pol, name>] extends [
  never,
]
  ? { attribution_data?: attribution_data_input }
  : { attribution_data: attribution_data_input };

type user_data_of<base> = base extends { user_data?: infer u }
  ? Exclude<u, undefined>
  : never;

type declared<base, pol, name extends string> = Omit<
  base,
  "event_name" | "custom_data" | "user_data" | "attribution_data"
> & {
  event_name: name;
} & custom_data_part<pol, name> &
  user_data_part<user_data_of<base>, pol, name> &
  attribution_part<pol, name>;

type names_under<pol> =
  | standard_event_name
  | Exclude<keyof pol & string, "*" | standard_event_name>;

export type declarations<base, pol> = {
  [name in names_under<pol>]: declared<base, pol, name>;
}[names_under<pol>];

export type declared_event_name = names_under<site_rules>;
export type meta_event_input = declarations<meta_event, site_rules>;
export type browser_meta_event = declarations<browser_event, site_rules>;
