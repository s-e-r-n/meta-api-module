import "server-only";
import { createHash } from "node:crypto";
import {
  as_list,
  clear_identifiers,
  type clear_key,
  hashed_identifiers,
  type hashed_key,
  normalized_country,
  type user_data_input,
} from "./user_data";

export const sha256_hex = (value: string) =>
  createHash("sha256").update(value, "utf8").digest("hex");

export type hashed_user_data = Partial<Record<hashed_key, string[]>> &
  Pick<user_data_input, clear_key | "fb_login_id" | "lead_id">;

const already_hashed = /^[a-f0-9]{64}$/;

export const hashed_user_data = (
  user_data: user_data_input,
): { user_data: hashed_user_data; warnings: string[] } => {
  const warnings: string[] = [];
  const country = normalized_country(user_data);
  const result: hashed_user_data = {};
  for (const { key, normalize } of hashed_identifiers) {
    const hashes = as_list(user_data[key]).flatMap((raw, index) => {
      const lowered = raw.trim().toLowerCase();
      if (lowered.length === 0) return [];
      if (already_hashed.test(lowered)) return [lowered];
      const normalized = normalize(lowered, country);
      if (normalized === undefined) {
        warnings.push(
          `user_data.${key}[${index}] dropped: not a usable ${key}`,
        );
        return [];
      }
      return [sha256_hex(normalized)];
    });
    if (hashes.length > 0) result[key] = hashes;
  }
  for (const { key, valid } of clear_identifiers) {
    const trimmed = user_data[key]?.trim();
    if (!trimmed) continue;
    if (!valid(trimmed)) {
      warnings.push(`user_data.${key} dropped: not a usable ${key}`);
      continue;
    }
    result[key] = trimmed;
  }
  if (user_data.fb_login_id !== undefined)
    result.fb_login_id = user_data.fb_login_id;
  if (user_data.lead_id !== undefined) result.lead_id = user_data.lead_id;
  return { user_data: result, warnings };
};
