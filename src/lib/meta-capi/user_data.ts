import * as z from "zod/mini";

const identifier_list = z.union([z.string(), z.array(z.string())]);

const hashed_shape = {
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

const browser_clear_shape = {
  subscription_id: z.optional(z.string()),
  fb_login_id: z.optional(z.int()),
  lead_id: z.optional(z.int()),
};

const request_clear_shape = {
  client_ip_address: z.optional(z.string()),
  client_user_agent: z.optional(z.string()),
  fbc: z.optional(z.string()),
  fbp: z.optional(z.string()),
};

export const browser_user_data_schema = z.strictObject({
  ...hashed_shape,
  ...browser_clear_shape,
});
export const user_data_schema = z.strictObject({
  ...hashed_shape,
  ...browser_clear_shape,
  ...request_clear_shape,
});

export type browser_user_data_input = z.infer<typeof browser_user_data_schema>;
export type user_data_input = z.infer<typeof user_data_schema>;
export type hashed_key = keyof typeof hashed_shape;
export type clear_key = keyof typeof request_clear_shape | "subscription_id";

export type normalizer = (
  value: string,
  country: string | undefined,
) => string | undefined;

const current_year = () => new Date().getUTCFullYear();

const email: normalizer = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : undefined;

const phone: normalizer = (value) => {
  const digits = value.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length >= 7 ? digits : undefined;
};

const person_name: normalizer = (value) =>
  value.replace(/\p{P}/gu, "").trim() || undefined;

const gender: normalizer = (value) =>
  value[0] === "f" || value[0] === "m" ? value[0] : undefined;

const birth_date: normalizer = (value) => {
  const match = /^(\d{4})-?(\d{2})-?(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, year = "", month = "", day = ""] = match;
  const in_range = (part: string, min: number, max: number) =>
    Number(part) >= min && Number(part) <= max;
  return in_range(year, 1900, current_year()) &&
    in_range(month, 1, 12) &&
    in_range(day, 1, 31)
    ? `${year}${month}${day}`
    : undefined;
};

const place: normalizer = (value) =>
  value.replace(/[\d\s\p{P}\p{S}]/gu, "") || undefined;

const postal_code: normalizer = (value, country) => {
  const compact = value.replace(/\s/g, "").split("-")[0] ?? "";
  const code = country === "us" ? compact.slice(0, 5) : compact;
  return code.length >= 2 ? code : undefined;
};

const country_code: normalizer = (value) =>
  /^[a-z]{2}$/.test(value) ? value : undefined;

const as_is: normalizer = (value) => value;

export const hashed_identifiers = [
  { key: "em", normalize: email },
  { key: "ph", normalize: phone },
  { key: "fn", normalize: person_name },
  { key: "ln", normalize: person_name },
  { key: "ge", normalize: gender },
  { key: "db", normalize: birth_date },
  { key: "ct", normalize: place },
  { key: "st", normalize: place },
  { key: "zp", normalize: postal_code },
  { key: "country", normalize: country_code },
  { key: "external_id", normalize: as_is },
] as const satisfies readonly { key: hashed_key; normalize: normalizer }[];

type normalized_key = (typeof hashed_identifiers)[number]["key"];
const _every_hashed_key_is_normalized: [hashed_key] extends [normalized_key]
  ? true
  : never = true;

const ipv4 =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
const ipv6 = /^(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i;
const ipv4_in_ipv6 =
  /^::ffff:(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/i;

const ip_address = (value: string) =>
  ipv4.test(value) || ipv6.test(value) || ipv4_in_ipv6.test(value);

const any_text = () => true;

export const clear_identifiers = [
  { key: "client_ip_address", valid: ip_address },
  { key: "client_user_agent", valid: any_text },
  { key: "fbc", valid: any_text },
  { key: "fbp", valid: any_text },
  { key: "subscription_id", valid: any_text },
] as const satisfies readonly {
  key: clear_key;
  valid: (value: string) => boolean;
}[];

export const as_list = (value: string | string[] | undefined) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

export const normalized_country = (user_data: user_data_input) =>
  country_code(
    as_list(user_data.country)[0]?.trim().toLowerCase() ?? "",
    undefined,
  );

export const fbc_from_click_id = (fbclid: string, now_ms: number) =>
  `fb.1.${now_ms}.${fbclid}`;

export const click_id_in_fbc = (fbc: string | undefined) => fbc?.split(".")[3];
