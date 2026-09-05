import "server-only";
import { cookies, headers } from "next/headers";
import { engine_config } from "./config";
import { identity_cookie_options, minted_external_id } from "./request_context";

export const visitor_external_id = async (): Promise<string> => {
  const [store, request_headers] = await Promise.all([cookies(), headers()]);
  const existing = store.get("external_id")?.value.trim();
  if (existing) return existing;
  const external_id = minted_external_id();
  store.set(
    "external_id",
    external_id,
    identity_cookie_options({
      https: request_headers.get("x-forwarded-proto") === "https",
      domain: engine_config().cookie_domain,
    }),
  );
  return external_id;
};
