import "server-only";
import * as z from "zod/mini";
import { issue_list } from "./event_schema";

export class meta_capi_config_error extends Error {}

const env_schema = z.object({
  META_CAPI_DATASET_ID: z
    .string()
    .check(z.regex(/^\d+$/, "must be the numeric dataset (pixel) id")),
  META_CAPI_ACCESS_TOKEN: z.string().check(z.minLength(1)),
  META_CAPI_GRAPH_VERSION: z.optional(
    z.string().check(z.regex(/^v\d+\.\d+$/, "must look like v26.0")),
  ),
  META_CAPI_TEST_EVENT_CODE: z.optional(z.string()),
  META_CAPI_SITE_ORIGIN: z.optional(z.url()),
  META_CAPI_COOKIE_DOMAIN: z.optional(z.string().check(z.minLength(1))),
  META_CAPI_TIMEOUT_MS: z.optional(
    z.string().check(z.regex(/^\d+$/, "must be a number of milliseconds")),
  ),
});

export type engine_config = {
  dataset_id: string;
  access_token: string;
  graph_version: string;
  timeout_ms: number;
  test_event_code: string | undefined;
  site_origin: string | undefined;
  cookie_domain: string | undefined;
};

const default_graph_version = "v26.0";
const default_timeout_ms = 1500;

const without_blanks = (env: Record<string, string | undefined>) =>
  Object.fromEntries(
    Object.entries(env).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );

export const engine_config = (
  env: Record<string, string | undefined> = process.env,
): engine_config => {
  const parsed = env_schema.safeParse(without_blanks(env));
  if (!parsed.success) {
    const details = issue_list(parsed.error)
      .map(({ path, message }) => `${path}: ${message}`)
      .join("; ");
    throw new meta_capi_config_error(
      `Meta Conversions API is not configured: ${details}`,
    );
  }
  const { data } = parsed;
  return {
    dataset_id: data.META_CAPI_DATASET_ID,
    access_token: data.META_CAPI_ACCESS_TOKEN,
    graph_version: data.META_CAPI_GRAPH_VERSION ?? default_graph_version,
    timeout_ms:
      data.META_CAPI_TIMEOUT_MS === undefined
        ? default_timeout_ms
        : Number(data.META_CAPI_TIMEOUT_MS),
    test_event_code: data.META_CAPI_TEST_EVENT_CODE,
    site_origin:
      data.META_CAPI_SITE_ORIGIN === undefined
        ? undefined
        : new URL(data.META_CAPI_SITE_ORIGIN).origin,
    cookie_domain: data.META_CAPI_COOKIE_DOMAIN,
  };
};
