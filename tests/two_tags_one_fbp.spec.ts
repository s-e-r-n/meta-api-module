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

test.describe("two tags on one landing page", () => {
  test.skip(!configured, "needs META_CAPI_ACCESS_TOKEN in .env.local");

  test("two simultaneous sends on a fresh browser end with one _fbp and one _fbc, both events carrying them", async ({
    page,
    context,
  }) => {
    const observed: Promise<{
      started_at: number;
      cookie_in: string;
      set_cookies: string[];
    }>[] = [];
    page.on("response", (response) => {
      const request = response.request();
      if (request.method() !== "POST" || !request.headers()["next-action"])
        return;
      observed.push(
        (async () => ({
          started_at: request.timing().startTime,
          cookie_in: (await request.allHeaders()).cookie ?? "",
          set_cookies: (await response.headersArray())
            .filter((h) => h.name.toLowerCase() === "set-cookie")
            .map((h) => h.value),
        }))(),
      );
    });
    await page.goto("/two-tags?fbclid=RaceClick");
    await expect.poll(() => observed.length, { timeout: 15_000 }).toBe(2);
    await page.waitForTimeout(1_000);
    const calls = (await Promise.all(observed)).sort(
      (a, b) => a.started_at - b.started_at,
    );
    const fbp_headers = calls.flatMap((call) =>
      call.set_cookies.filter((v) => v.startsWith("_fbp=")),
    );
    const fbc_headers = calls.flatMap((call) =>
      call.set_cookies.filter((v) => v.startsWith("_fbc=")),
    );
    console.log(
      `first send: cookie in "${calls[0]?.cookie_in}", sets ${calls[0]?.set_cookies.length}; ` +
        `second send: cookie in "${calls[1]?.cookie_in}", sets ${calls[1]?.set_cookies.length}`,
    );
    const stored = await context.cookies();
    expect(stored.filter((c) => c.name === "_fbp")).toHaveLength(1);
    expect(stored.filter((c) => c.name === "_fbc")).toHaveLength(1);
    expect(fbp_headers).toHaveLength(1);
    expect(fbc_headers).toHaveLength(1);
    expect(calls[1]?.cookie_in).toContain("_fbp=");
  });
});
