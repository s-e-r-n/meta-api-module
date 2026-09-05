import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const configured = (() => {
  try {
    return /^META_CAPI_ACCESS_TOKEN=.+/m.test(
      readFileSync(".env.local", "utf8"),
    );
  } catch {
    return false;
  }
})();

type action_call = {
  request_cookie: string;
  set_cookies: string[];
  body_length: number;
  body_has_page: boolean;
};

const observe_actions = (page: import("@playwright/test").Page) => {
  const calls: Promise<action_call>[] = [];
  page.on("response", (response) => {
    const request = response.request();
    if (request.method() !== "POST" || !request.headers()["next-action"])
      return;
    calls.push(
      (async () => {
        const body = await response.text().catch(() => "");
        return {
          request_cookie: (await request.allHeaders()).cookie ?? "",
          set_cookies: (await response.headersArray())
            .filter((header) => header.name.toLowerCase() === "set-cookie")
            .map((header) => header.value),
          body_length: body.length,
          body_has_page: body.includes('"main"'),
        };
      })(),
    );
  });
  return calls;
};

test.describe("identity cookies", () => {
  test.skip(!configured, "needs META_CAPI_ACCESS_TOKEN in .env.local");

  test("a consented send stores _fbc from fbclid and a fresh _fbp, and the next load sends them back", async ({
    page,
    context,
  }) => {
    const calls = observe_actions(page);
    const before = Date.now();
    await page.goto("/?utm_source=e2e&fbclid=E2EClick");
    await expect.poll(() => calls.length, { timeout: 15_000 }).toBe(1);
    await page.waitForTimeout(1_000);
    expect(calls).toHaveLength(1);
    const first = await calls[0];
    expect(first.request_cookie).toBe("");
    const fbc_header = first.set_cookies.find((value) =>
      value.startsWith("_fbc="),
    );
    const fbp_header = first.set_cookies.find((value) =>
      value.startsWith("_fbp="),
    );
    const external_id_header = first.set_cookies.find((value) =>
      value.startsWith("external_id="),
    );
    expect(fbc_header).toMatch(
      /^_fbc=fb\.1\.\d{13}\.E2EClick; Path=\/; Expires=[^;]+; Max-Age=7776000; SameSite=lax$/i,
    );
    expect(fbp_header).toMatch(
      /^_fbp=fb\.1\.\d{13}\.\d{10}; Path=\/; Expires=[^;]+; Max-Age=7776000; SameSite=lax$/i,
    );
    expect(external_id_header).toMatch(
      /^external_id=[0-9a-f-]{36}; Path=\/; Expires=[^;]+; Max-Age=7776000; SameSite=lax$/i,
    );

    const stored = await context.cookies();
    const fbc = stored.find((cookie) => cookie.name === "_fbc");
    const fbp = stored.find((cookie) => cookie.name === "_fbp");
    const external_id = stored.find((cookie) => cookie.name === "external_id");
    expect(fbc).toMatchObject({
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
      path: "/",
      domain: "localhost",
    });
    expect(fbp).toMatchObject({
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
      path: "/",
      domain: "localhost",
    });
    expect(external_id).toMatchObject({
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
      path: "/",
      domain: "localhost",
    });
    const ninety_days_s = 90 * 86_400;
    expect(
      Math.abs((fbc?.expires ?? 0) - (before / 1000 + ninety_days_s)),
    ).toBeLessThan(120);
    expect(
      Math.abs((fbp?.expires ?? 0) - (before / 1000 + ninety_days_s)),
    ).toBeLessThan(120);

    await page.goto("/");
    await expect.poll(() => calls.length, { timeout: 15_000 }).toBe(2);
    await page.waitForTimeout(1_000);
    expect(calls).toHaveLength(2);
    const second = await calls[1];
    expect(second.request_cookie).toContain(`_fbc=${fbc?.value}`);
    expect(second.request_cookie).toContain(`_fbp=${fbp?.value}`);
    expect(second.request_cookie).toContain(
      `external_id=${external_id?.value}`,
    );
    expect(second.set_cookies).toEqual([]);

    console.log(
      `action response with cookies set: ${first.body_length} bytes, re-rendered page inside: ${first.body_has_page}; ` +
        `action response without cookies set: ${second.body_length} bytes, re-rendered page inside: ${second.body_has_page}`,
    );
  });
});
