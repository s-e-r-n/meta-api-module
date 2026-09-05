import { describe, expect, it } from "vitest";
import {
  as_list,
  click_id_in_fbc,
  fbc_from_click_id,
  fbp_from_random,
  identity_cookie_max_age_s,
  normalized_country,
} from "../meta-capi/user_data";

describe("identity formats", () => {
  it("builds fbc in Meta's server-side format and reads the click id back", () => {
    expect(fbc_from_click_id("AbC_dEf", 5)).toBe("fb.1.5.AbC_dEf");
    expect(click_id_in_fbc("fb.1.1700000000000.AbC_dEf")).toBe("AbC_dEf");
    expect(click_id_in_fbc(undefined)).toBeUndefined();
  });

  it("builds fbp in the pixel's format and keeps identity cookies for ninety days", () => {
    expect(fbp_from_random(1116446470, 1596403881668)).toBe(
      "fb.1.1596403881668.1116446470",
    );
    expect(identity_cookie_max_age_s).toBe(7_776_000);
  });

  it("reads the first country as a lowercase ISO code, or nothing", () => {
    expect(normalized_country({ country: ["US", "CH"] })).toBe("us");
    expect(normalized_country({ country: "Switzerland" })).toBeUndefined();
    expect(normalized_country({})).toBeUndefined();
  });

  it("turns a single value or nothing into a list", () => {
    expect(as_list("a")).toEqual(["a"]);
    expect(as_list(["a", "b"])).toEqual(["a", "b"]);
    expect(as_list(undefined)).toEqual([]);
  });
});
