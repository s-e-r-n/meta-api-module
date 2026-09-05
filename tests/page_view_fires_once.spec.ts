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

test.describe("PageView tag on the server-rendered main page", () => {
  test.skip(!configured, "needs META_CAPI_ACCESS_TOKEN in .env.local");

  test("fires exactly one server action per page load and Meta receives one event", async ({
    page,
  }) => {
    const action_bodies: Promise<string>[] = [];
    page.on("response", (response) => {
      const request = response.request();
      if (request.method() === "POST" && request.headers()["next-action"]) {
        action_bodies.push(response.text().catch(() => ""));
      }
    });
    await page.goto("/?utm_source=playwright&fbclid=PlaywrightClick");
    await expect.poll(() => action_bodies.length, { timeout: 15_000 }).toBe(1);
    await page.waitForTimeout(1_500);
    expect(action_bodies).toHaveLength(1);
    const body = await action_bodies[0];
    expect(body).toContain('"events_received":1');
  });
});
