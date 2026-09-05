import { describe, expectTypeOf, it } from "vitest";
import type {
  browser_event,
  browser_meta_event,
  declarations,
  meta_event_input,
  unix_seconds,
} from "../meta-capi/event_schema";
import type { browser_user_data_input } from "../meta-capi/user_data";

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

  it("requires nothing about the person: a Lead goes with whatever the form had", () => {
    expectTypeOf<{ event_name: "Lead" }>().toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Lead";
      user_data: { ph: string };
    }>().toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Schedule";
      user_data: { em: string; ph: string };
    }>().toExtend<browser_meta_event>();
    expectTypeOf<{ event_name: "Contact" }>().toExtend<browser_meta_event>();
  });

  it("requires value and currency on a Purchase, in the browser and on the server", () => {
    expectTypeOf<{
      event_name: "Purchase";
      custom_data: { value: number; currency: "CHF" };
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
      custom_data: { value: number; currency: "CHF" };
    }>().toExtend<meta_event_input>();
    expectTypeOf<{
      event_name: "Purchase";
      event_source_url: string;
    }>().not.toExtend<meta_event_input>();
  });

  it("requires attribution_data and a currency on AppendAttribution, and on nothing else", () => {
    expectTypeOf<{
      event_name: "AppendAttribution";
      event_source_url: string;
      custom_data: { currency: "USD" };
      attribution_data: {
        ad_id: string;
        touchpoint_ts: number;
        attribution_share: number;
        attribution_value: number;
      };
    }>().toExtend<meta_event_input>();
    expectTypeOf<{
      event_name: "AppendAttribution";
      event_source_url: string;
      custom_data: { currency: "USD" };
    }>().not.toExtend<meta_event_input>();
    expectTypeOf<{
      event_name: "SubmitApplication";
    }>().toExtend<browser_meta_event>();
  });

  it("types the enumerations: currency, country, gender, birth date", () => {
    expectTypeOf<{
      event_name: "Lead";
      custom_data: { value: 1; currency: "chf" };
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Lead";
      user_data: { country: "CH"; ge: "f"; db: "1997-02-16" };
    }>().toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Lead";
      user_data: { country: "Switzerland" };
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Lead";
      user_data: { ge: "female" };
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Lead";
      user_data: { db: "2/16/1997" };
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Lead";
      user_data: { db: "19970216" };
    }>().not.toExtend<browser_meta_event>();
  });

  it("ties value to its currency and content_type to content ids", () => {
    expectTypeOf<{
      event_name: "AddToCart";
      custom_data: { value: number };
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "AddToCart";
      custom_data: { content_type: "product" };
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "AddToCart";
      custom_data: { content_type: "product"; content_ids: string[] };
    }>().toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "AddToCart";
      custom_data: {
        content_type: "product";
        contents: { id: string; quantity: number }[];
      };
    }>().toExtend<browser_meta_event>();
  });

  it("keeps num_items, search_string and status on the events Meta scopes them to", () => {
    expectTypeOf<{
      event_name: "InitiateCheckout";
      custom_data: { num_items: number };
    }>().toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "ViewContent";
      custom_data: { num_items: number };
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Search";
      custom_data: { search_string: string };
    }>().toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Lead";
      custom_data: { search_string: string };
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "CompleteRegistration";
      custom_data: { status: boolean };
    }>().toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Lead";
      custom_data: { status: boolean };
    }>().not.toExtend<browser_meta_event>();
  });

  it("ties Limited Data Use to a country, website events to their URL, and event_time to a Date", () => {
    expectTypeOf<{
      event_name: "Lead";
      data_processing_options: ["LDU"];
    }>().not.toExtend<browser_meta_event>();
    expectTypeOf<{
      event_name: "Lead";
      data_processing_options: ["LDU"];
      data_processing_options_country: 1;
    }>().toExtend<browser_meta_event>();
    expectTypeOf<{ event_name: "Lead" }>().not.toExtend<meta_event_input>();
    expectTypeOf<{
      event_name: "Lead";
      action_source: "email";
    }>().toExtend<meta_event_input>();
    expectTypeOf<{
      event_name: "Lead";
      event_source_url: string;
      event_time: number;
    }>().not.toExtend<meta_event_input>();
    expectTypeOf<{
      event_name: "Lead";
      event_source_url: string;
      event_time: unix_seconds;
    }>().toExtend<meta_event_input>();
  });

  it("adds the custom events the policy declares, and nothing it does not", () => {
    type fixture_policy = {
      readonly custom_events: readonly ["ShareDiscount"];
    };
    type under_policy = declarations<
      browser_event,
      browser_user_data_input,
      fixture_policy
    >;
    expectTypeOf<{
      event_name: "ShareDiscount";
      custom_data: { promotion: string };
    }>().toExtend<under_policy>();
    expectTypeOf<{ event_name: "ShareDiscount" }>().toExtend<under_policy>();
    expectTypeOf<{ event_name: "Unknown" }>().not.toExtend<under_policy>();
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
