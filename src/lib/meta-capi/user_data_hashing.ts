import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import type { user_data_input } from "./event_schema";

export const sha256_hex = (value: string) =>
  createHash("sha256").update(value, "utf8").digest("hex");

const hashed_keys = [
  "em",
  "ph",
  "fn",
  "ln",
  "ge",
  "db",
  "ct",
  "st",
  "zp",
  "country",
  "external_id",
] as const;
type hashed_key = (typeof hashed_keys)[number];

const clear_keys = [
  "client_ip_address",
  "client_user_agent",
  "fbc",
  "fbp",
  "subscription_id",
] as const;

export type hashed_user_data = Partial<Record<hashed_key, string[]>> &
  Pick<
    user_data_input,
    (typeof clear_keys)[number] | "fb_login_id" | "lead_id"
  >;

type normalizer = (
  value: string,
  country: string | undefined,
) => string | undefined;

const already_hashed = /^[a-f0-9]{64}$/;
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

const normalizers: Record<hashed_key, normalizer> = {
  em: email,
  ph: phone,
  fn: person_name,
  ln: person_name,
  ge: gender,
  db: birth_date,
  ct: place,
  st: place,
  zp: postal_code,
  country: country_code,
  external_id: as_is,
};

const as_list = (value: string | string[] | undefined) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const lowercased_country = (user_data: user_data_input) => {
  const first = as_list(user_data.country)[0]?.trim().toLowerCase() ?? "";
  return country_code(first, undefined);
};

const hashed_list = (
  key: hashed_key,
  values: string[],
  country: string | undefined,
  warnings: string[],
) =>
  values.flatMap((raw, index) => {
    const lowered = raw.trim().toLowerCase();
    if (lowered.length === 0) return [];
    if (already_hashed.test(lowered)) return [lowered];
    const normalized = normalizers[key](lowered, country);
    if (normalized === undefined) {
      warnings.push(`user_data.${key}[${index}] dropped: not a usable ${key}`);
      return [];
    }
    return [sha256_hex(normalized)];
  });

const clear_value = (
  key: (typeof clear_keys)[number],
  value: string | undefined,
  warnings: string[],
) => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (key === "client_ip_address" && isIP(trimmed) === 0) {
    warnings.push(
      "user_data.client_ip_address dropped: not an IPv4 or IPv6 address",
    );
    return undefined;
  }
  return trimmed;
};

export const hashed_user_data = (
  user_data: user_data_input,
): { user_data: hashed_user_data; warnings: string[] } => {
  const warnings: string[] = [];
  const country = lowercased_country(user_data);
  const result: hashed_user_data = {};
  for (const key of hashed_keys) {
    const hashes = hashed_list(key, as_list(user_data[key]), country, warnings);
    if (hashes.length > 0) result[key] = hashes;
  }
  for (const key of clear_keys) {
    const value = clear_value(key, user_data[key], warnings);
    if (value !== undefined) result[key] = value;
  }
  if (user_data.fb_login_id !== undefined)
    result.fb_login_id = user_data.fb_login_id;
  if (user_data.lead_id !== undefined) result.lead_id = user_data.lead_id;
  return { user_data: result, warnings };
};
