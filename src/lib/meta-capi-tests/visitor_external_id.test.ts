import { cookies, headers } from "next/headers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { visitor_external_id } from "../meta-capi/visitor_external_id";

vi.mock("next/headers", () => ({ headers: vi.fn(), cookies: vi.fn() }));

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const set_cookie = vi.fn();

const request_with = (options: {
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}) => {
  vi.mocked(headers).mockResolvedValue(
    new Headers(options.headers ?? {}) as Awaited<ReturnType<typeof headers>>,
  );
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) =>
      options.cookies?.[name] === undefined
        ? undefined
        : { name, value: options.cookies[name] },
    set: set_cookie,
  } as unknown as Awaited<ReturnType<typeof cookies>>);
};

beforeEach(() => {
  vi.stubEnv("META_CAPI_DATASET_ID", "123");
  vi.stubEnv("META_CAPI_ACCESS_TOKEN", "EAAtoken");
  set_cookie.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("visitor_external_id", () => {
  it("returns the id the browser already carries and sets nothing", async () => {
    request_with({ cookies: { external_id: "visitor-1" } });
    await expect(visitor_external_id()).resolves.toBe("visitor-1");
    expect(set_cookie).not.toHaveBeenCalled();
  });

  it("mints a UUID on a browser without one and stores it for ninety days, secure behind https", async () => {
    request_with({ headers: { "x-forwarded-proto": "https" } });
    const id = await visitor_external_id();
    expect(id).toMatch(uuid);
    expect(set_cookie).toHaveBeenCalledWith("external_id", id, {
      path: "/",
      maxAge: 7_776_000,
      sameSite: "lax",
      secure: true,
      httpOnly: false,
      domain: undefined,
    });
  });

  it("leaves the cookie insecure on plain http and scopes it to the configured domain", async () => {
    vi.stubEnv("META_CAPI_COOKIE_DOMAIN", ".shop.example");
    request_with({});
    await visitor_external_id();
    expect(set_cookie.mock.calls[0]?.[2]).toMatchObject({
      secure: false,
      domain: ".shop.example",
    });
  });
});
