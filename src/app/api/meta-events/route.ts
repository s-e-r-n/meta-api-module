import { timingSafeEqual } from "node:crypto";
import * as z from "zod/mini";
import {
  event_schema,
  issue_list,
  send_meta_events,
} from "@/lib/meta-capi/server";

const inbound_schema = z.object({
  events: z.array(event_schema).check(z.minLength(1)),
});

const authorized = (request: Request) => {
  const secret = process.env.META_CAPI_INBOUND_SECRET;
  const presented = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!secret || !presented) return false;
  const expected = Buffer.from(secret);
  const given = Buffer.from(presented);
  return expected.length === given.length && timingSafeEqual(expected, given);
};

const parsed_body = async (request: Request): Promise<unknown> => {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
};

export const POST = async (request: Request) => {
  if (!authorized(request))
    return Response.json({ error: "unauthorized" }, { status: 401 });
  const parsed = inbound_schema.safeParse(await parsed_body(request));
  if (!parsed.success) {
    return Response.json(
      { ok: false, reason: "invalid_event", issues: issue_list(parsed.error) },
      { status: 400 },
    );
  }
  const result = await send_meta_events(parsed.data.events);
  return Response.json(result, { status: result.ok ? 200 : 400 });
};
