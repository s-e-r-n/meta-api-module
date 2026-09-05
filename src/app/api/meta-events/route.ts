import { timingSafeEqual } from "node:crypto";
import { send_inbound_meta_events } from "@/lib/meta-capi/server";

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
  const result = await send_inbound_meta_events(await parsed_body(request));
  return Response.json(result, { status: result.ok ? 200 : 400 });
};
