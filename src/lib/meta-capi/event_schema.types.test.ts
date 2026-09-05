import { describe, expectTypeOf, it } from "vitest";
import type {
  browser_meta_event,
  custom_event_name,
  meta_event_input,
} from "./event_schema";

describe("declaration types", () => {
  it("offers the standard names and refuses a misspelt one", () => {
    expectTypeOf<{
      event_name: "ViewContent";
    }>().toExtend<browser_meta_event>();
    expectTypeOf<{ event_name: "PageView" }>().toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "viewcontent";
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{ event_name: "" }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{ event_name: string }>().not.toExtend<browser_meta_event>();
  });

  it("requires value and currency on a Purchase, in the browser and on the server", () => {
    expectTypeOf<{
      event_name: "Purchase";
      custom_data: { value: number; currency: string };
    }>().toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Purchase";
      custom_data: { value: number };
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Purchase";
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Purchase";
      event_source_url: string;
      custom_data: { value: number; currency: string };
    }>().toExtend<meta_event_input>();
    expectTypeOf<{
      event_name: "Purchase";
      event_source_url: string;
    }>().not.toExtend<meta_event_input>();
  });

  it("requires attribution_data and a currency on AppendAttribution", () => {
    expectTypeOf<{
      event_name: "AppendAttribution";
      custom_data: { currency: string };
      attribution_data: {
        ad_id: string;
        touchpoint_ts: number;
        attribution_share: number;
        attribution_value: number;
      };
    }>().toExtend<meta_event_input>();
    expectTypeOf<{
      event_name: "AppendAttribution";
      custom_data: { currency: string };
    }>().not.toExtend<meta_event_input>();
  });

  it("takes a custom event only through its branded name", () => {
    expectTypeOf<{
      event_name: custom_event_name;
      custom_data: { promotion: string };
    }>().toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "ShareDiscount";
    }>().not.toExtend<browser_meta_event>();
  });

  it("never lets the browser carry the identifiers the server reads from the request", () => {
    expectTypeOf<{
      event_name: "Lead";
      user_data: { client_ip_address: string };
    }>().not.toExtend<browser_meta_event>();
  });
});
