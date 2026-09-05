import * as z from "zod/mini";
import { type currency_code, currency_codes } from "./iso_codes";

const currency_set = new Set<string>(currency_codes);

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
        z.refine(
          (code) => currency_set.has(code.toUpperCase()),
          "currency must be an ISO 4217 code",
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

export type commerce_key = keyof typeof commerce_shape;

const custom_property_schema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.union([z.string(), z.number()])),
]);

export type custom_property = z.infer<typeof custom_property_schema>;

const custom_property_issue = (key: string, value: Record<string, unknown>) => {
  if (/\s/.test(key)) return "custom_data keys must not contain whitespace";
  if (key in commerce_shape) return undefined;
  return custom_property_schema.safeParse(value[key]).success
    ? undefined
    : "a custom property must be a string, a number, a boolean, or a list of strings or numbers";
};

type parsed_commerce = z.infer<z.ZodMiniObject<typeof commerce_shape>>;

const pairing_issues = (
  value: parsed_commerce,
): { path: string; message: string }[] => {
  const issues: { path: string; message: string }[] = [];
  if (value.value !== undefined && value.currency === undefined)
    issues.push({ path: "currency", message: "value needs its currency" });
  if (
    value.content_type !== undefined &&
    value.content_ids === undefined &&
    value.contents === undefined
  ) {
    issues.push({
      path: "content_type",
      message:
        "content_type qualifies content_ids or contents, give one of them",
    });
  }
  return issues;
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
  for (const { path, message } of pairing_issues(ctx.value)) {
    ctx.issues.push({
      code: "custom",
      message,
      input: ctx.value,
      path: [path],
    });
  }
});

type parsed_custom_data = z.infer<typeof custom_data_schema>;

type priced =
  | { value: number; currency: currency_code }
  | { value?: undefined; currency?: currency_code };

type catalogued =
  | { content_type?: undefined }
  | ({ content_type: "product" | "product_group" } & (
      | { content_ids: string[] }
      | { contents: NonNullable<parsed_custom_data["contents"]> }
    ));

export type custom_data_input = Omit<
  parsed_custom_data,
  "value" | "currency" | "content_type"
> &
  priced &
  catalogued;

export const wire_custom_data = (
  custom_data: parsed_custom_data,
): parsed_custom_data =>
  custom_data.currency === undefined
    ? custom_data
    : { ...custom_data, currency: custom_data.currency.toUpperCase() };
