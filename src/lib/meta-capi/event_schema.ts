import * as z from "zod/mini";

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

const seven_days_s = 7 * 86_400;
const clock_skew_s = 600;

const event_name_schema = z.string().check(z.minLength(1), z.maxLength(50));

const custom_event_name_schema = event_name_schema.brand<"custom_event">();

export type custom_event_name = z.infer<typeof custom_event_name_schema>;

export const custom_event = (name: string): custom_event_name => {
  const parsed = custom_event_name_schema.safeParse(name);
  if (!parsed.success) {
    const details = issue_list(parsed.error)
      .map(({ message }) => message)
      .join("; ");
    throw new meta_capi_invalid_event_error(
      `Custom event name refused: ${details}`,
    );
  }
  return parsed.data;
};

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

const identifier_list = z.union([z.string(), z.array(z.string())]);

const hashed_identifier_shape = {
  em: z.optional(identifier_list),
  ph: z.optional(identifier_list),
  fn: z.optional(identifier_list),
  ln: z.optional(identifier_list),
  ge: z.optional(identifier_list),
  db: z.optional(identifier_list),
  ct: z.optional(identifier_list),
  st: z.optional(identifier_list),
  zp: z.optional(identifier_list),
  country: z.optional(identifier_list),
  external_id: z.optional(identifier_list),
};

const browser_user_data_shape = {
  ...hashed_identifier_shape,
  subscription_id: z.optional(z.string()),
  fb_login_id: z.optional(z.int()),
  lead_id: z.optional(z.int()),
};

const user_data_shape = {
  ...browser_user_data_shape,
  client_ip_address: z.optional(z.string()),
  client_user_agent: z.optional(z.string()),
  fbc: z.optional(z.string()),
  fbp: z.optional(z.string()),
};

export const user_data_schema = z.strictObject(user_data_shape);
const browser_user_data_schema = z.strictObject(browser_user_data_shape);

export type user_data_input = z.infer<typeof user_data_schema>;

const delivery_category_schema = z.enum([
  "in_store",
  "curbside",
  "home_delivery",
]);

const content_schema = z.strictObject({
  id: z.string().check(z.minLength(1)),
  quantity: z.int().check(z.gte(1)),
  item_price: z.optional(z.number().check(z.gte(0))),
  delivery_category: z.optional(delivery_category_schema),
});

const commerce_shape = {
  value: z.optional(z.number().check(z.gte(0))),
  currency: z.optional(
    z
      .string()
      .check(
        z.regex(
          /^[A-Za-z]{3}$/,
          "currency must be a three-letter ISO 4217 code",
        ),
      ),
  ),
  content_ids: z.optional(z.array(z.string())),
  content_type: z.optional(z.enum(["product", "product_group"])),
  contents: z.optional(z.array(content_schema)),
  content_name: z.optional(z.string()),
  content_category: z.optional(z.string()),
  order_id: z.optional(z.string()),
  search_string: z.optional(z.string()),
  num_items: z.optional(z.int().check(z.gte(0))),
  predicted_ltv: z.optional(z.number()),
  net_revenue: z.optional(z.number()),
  status: z.optional(z.boolean()),
  delivery_category: z.optional(delivery_category_schema),
};

const custom_property_schema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.union([z.string(), z.number()])),
]);

const custom_property_issue = (key: string, value: Record<string, unknown>) => {
  if (/\s/.test(key)) return "custom_data keys must not contain whitespace";
  if (key in commerce_shape) return undefined;
  return custom_property_schema.safeParse(value[key]).success
    ? undefined
    : "a custom property must be a string, a number, a boolean, or a list of strings or numbers";
};

export const custom_data_schema = z.looseObject(commerce_shape).check((ctx) => {
  for (const key of Object.keys(ctx.value)) {
    const message = custom_property_issue(key, ctx.value);
    if (message)
      ctx.issues.push({
        code: "custom",
        message,
        input: ctx.value,
        path: [key],
      });
  }
});

export type custom_data_input = z.infer<typeof custom_data_schema>;

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
  event_name: z.optional(event_name_schema),
  event_time: z.optional(z.int().check(z.gte(0))),
  order_id: z.optional(z.string()),
  event_id: z.optional(z.string()),
});

const attribution_data_schema = z.strictObject({
  ad_id: z.string().check(z.minLength(1)),
  touchpoint_ts: z.int().check(z.gte(0)),
  attribution_share: z.number().check(z.gte(0), z.lte(1)),
  attribution_value: z.number().check(z.gte(0)),
});

export type attribution_data_input = z.infer<typeof attribution_data_schema>;

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

type declaration = {
  event_name: string;
  custom_data?: { value?: number; currency?: string };
  attribution_data?: attribution_data_input;
  data_processing_options?: "LDU"[];
  data_processing_options_country?: number;
};

const declaration_rules = (ctx: z.core.ParsePayload<declaration>) => {
  const { value } = ctx;
  const missing = (path: string[], message: string) =>
    ctx.issues.push({ code: "custom", message, input: value, path });
  if (value.event_name === "Purchase") {
    if (value.custom_data?.value === undefined)
      missing(["custom_data", "value"], "Purchase requires custom_data.value");
    if (value.custom_data?.currency === undefined)
      missing(
        ["custom_data", "currency"],
        "Purchase requires custom_data.currency",
      );
  }
  if (value.event_name === "AppendAttribution") {
    if (value.attribution_data === undefined)
      missing(
        ["attribution_data"],
        "AppendAttribution requires attribution_data",
      );
    if (value.custom_data?.currency === undefined) {
      missing(
        ["custom_data", "currency"],
        "AppendAttribution requires custom_data.currency",
      );
    }
  }
  if (
    value.data_processing_options?.includes("LDU") &&
    value.data_processing_options_country === undefined
  ) {
    missing(
      ["data_processing_options_country"],
      "Limited Data Use requires data_processing_options_country",
    );
  }
};

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
  .check(declaration_rules, (ctx) => {
    const { value } = ctx;
    if (
      (value.action_source ?? "website") === "website" &&
      value.event_source_url === undefined
    ) {
      ctx.issues.push({
        code: "custom",
        message: "website events require event_source_url",
        input: value,
        path: ["event_source_url"],
      });
    }
  });

export const browser_context_schema = z.strictObject({
  event_source_url: z.url(),
  referrer_url: z.optional(z.string()),
  event_id: z.string().check(z.minLength(1)),
});

export const browser_submission_schema = z.strictObject({
  event: browser_event_schema,
  browser: browser_context_schema,
});

export type meta_event = z.infer<typeof event_schema>;
export type browser_event = z.infer<typeof browser_event_schema>;
export type browser_context = z.infer<typeof browser_context_schema>;
export type browser_submission = z.infer<typeof browser_submission_schema>;

type required_for<name extends standard_event_name> = name extends "Purchase"
  ? { custom_data: custom_data_input & { value: number; currency: string } }
  : name extends "AppendAttribution"
    ? {
        attribution_data: attribution_data_input;
        custom_data: custom_data_input & { currency: string };
      }
    : { custom_data?: custom_data_input };

type declared_as<base, name extends string, extras> = Omit<
  base,
  "event_name" | keyof extras
> & {
  event_name: name;
} & extras;

type declarations<base> =
  | {
      [name in standard_event_name]: declared_as<
        base,
        name,
        required_for<name>
      >;
    }[standard_event_name]
  | declared_as<base, custom_event_name, { custom_data?: custom_data_input }>;

export type meta_event_input = declarations<meta_event>;
export type browser_meta_event = declarations<browser_event>;
