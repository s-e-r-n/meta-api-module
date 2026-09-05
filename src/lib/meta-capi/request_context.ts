import "server-only";
import { randomInt } from "node:crypto";
import {
  click_id_in_fbc,
  fbc_from_click_id,
  fbp_from_random,
} from "./user_data";

export type identity_cookie = "_fbc" | "_fbp";

export type request_context = {
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
  cookies_to_set: Partial<Record<identity_cookie, string>>;
};

type request_headers = { get(name: string): string | null };

type request_view = {
  headers: request_headers;
  cookie: (name: identity_cookie) => string | undefined;
  event_source_url: string;
  now_ms: number;
};

const present = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const client_ip = (headers: request_headers) =>
  present(headers.get("x-vercel-forwarded-for")) ??
  present(headers.get("x-real-ip")) ??
  present(headers.get("x-forwarded-for")?.split(",")[0]);

const click_id_in_url = (event_source_url: string) => {
  try {
    return present(new URL(event_source_url).searchParams.get("fbclid"));
  } catch {
    return undefined;
  }
};

const fbc_for = (
  cookie_fbc: string | undefined,
  event_source_url: string,
  now_ms: number,
) => {
  const url_click_id = click_id_in_url(event_source_url);
  if (
    url_click_id !== undefined &&
    url_click_id !== click_id_in_fbc(cookie_fbc)
  ) {
    return { fbc: fbc_from_click_id(url_click_id, now_ms), fresh: true };
  }
  return { fbc: cookie_fbc, fresh: false };
};

const fbp_for = (cookie_fbp: string | undefined, now_ms: number) =>
  cookie_fbp === undefined
    ? {
        fbp: fbp_from_random(randomInt(1_000_000_000, 10_000_000_000), now_ms),
        fresh: true,
      }
    : { fbp: cookie_fbp, fresh: false };

export const request_context = ({
  headers,
  cookie,
  event_source_url,
  now_ms,
}: request_view): request_context => {
  const fbc = fbc_for(present(cookie("_fbc")), event_source_url, now_ms);
  const fbp = fbp_for(present(cookie("_fbp")), now_ms);
  return {
    client_ip_address: client_ip(headers),
    client_user_agent: present(headers.get("user-agent")),
    fbp: fbp.fbp,
    fbc: fbc.fbc,
    cookies_to_set: {
      ...(fbc.fresh && fbc.fbc !== undefined ? { _fbc: fbc.fbc } : {}),
      ...(fbp.fresh ? { _fbp: fbp.fbp } : {}),
    },
  };
};
