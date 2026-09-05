import { describe, expect, it } from "vitest";
import { engine_config, meta_capi_config_error } from "../meta-capi/config";

const complete = {
  META_CAPI_DATASET_ID: "1202835294532393",
  META_CAPI_ACCESS_TOKEN: "EAAtoken",
};

describe("engine_config", () => {
  it("reads the dataset and token and fills the defaults", () => {
    expect(engine_config(complete)).toEqual({
      dataset_id: "1202835294532393",
      access_token: "EAAtoken",
      graph_version: "v26.0",
      timeout_ms: 1500,
      test_event_code: undefined,
      site_origin: undefined,
      cookie_domain: undefined,
    });
  });

  it("names the missing variable", () => {
    expect(() => engine_config({ META_CAPI_DATASET_ID: "1" })).toThrow(
      meta_capi_config_error,
    );
    expect(() => engine_config({ META_CAPI_DATASET_ID: "1" })).toThrow(
      /META_CAPI_ACCESS_TOKEN/,
    );
  });

  it("refuses a dataset id that is not a number and a version without its v", () => {
    expect(() =>
      engine_config({ ...complete, META_CAPI_DATASET_ID: "pixel" }),
    ).toThrow(/META_CAPI_DATASET_ID/);
    expect(() =>
      engine_config({ ...complete, META_CAPI_GRAPH_VERSION: "26.0" }),
    ).toThrow(/META_CAPI_GRAPH_VERSION/);
    expect(
      engine_config({ ...complete, META_CAPI_GRAPH_VERSION: "v27.0" })
        .graph_version,
    ).toBe("v27.0");
  });

  it("keeps only the origin of the site URL", () => {
    expect(
      engine_config({
        ...complete,
        META_CAPI_SITE_ORIGIN: "https://shop.example/some/path?x=1",
      }).site_origin,
    ).toBe("https://shop.example");
    expect(() =>
      engine_config({ ...complete, META_CAPI_SITE_ORIGIN: "shop.example" }),
    ).toThrow(/META_CAPI_SITE_ORIGIN/);
  });

  it("takes an optional cookie domain", () => {
    expect(
      engine_config({ ...complete, META_CAPI_COOKIE_DOMAIN: ".example.ch" })
        .cookie_domain,
    ).toBe(".example.ch");
  });

  it("takes the test event code and a numeric timeout", () => {
    const config = engine_config({
      ...complete,
      META_CAPI_TEST_EVENT_CODE: "TEST123",
      META_CAPI_TIMEOUT_MS: "2500",
    });
    expect(config.test_event_code).toBe("TEST123");
    expect(config.timeout_ms).toBe(2500);
    expect(() =>
      engine_config({ ...complete, META_CAPI_TIMEOUT_MS: "soon" }),
    ).toThrow(/META_CAPI_TIMEOUT_MS/);
  });
});
