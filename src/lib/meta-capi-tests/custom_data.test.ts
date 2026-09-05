import { describe, expect, it } from "vitest";
import { custom_data_schema, wire_custom_data } from "../meta-capi/custom_data";

describe("custom_data_schema", () => {
  it("accepts commerce keys and custom properties without whitespace in the key", () => {
    expect(
      custom_data_schema.safeParse({
        value: 1,
        currency: "chf",
        compared_product: "shoes",
        tags: ["a"],
      }).success,
    ).toBe(true);
    expect(custom_data_schema.safeParse({ "has space": "x" }).success).toBe(
      false,
    );
    expect(
      custom_data_schema.safeParse({ nested: { deep: true } }).success,
    ).toBe(false);
  });
});

describe("wire_custom_data", () => {
  it("uppercases the currency and leaves everything else as given", () => {
    expect(
      wire_custom_data({ value: 1, currency: "chf", order_id: "1" }),
    ).toEqual({ value: 1, currency: "CHF", order_id: "1" });
    expect(wire_custom_data({ value: 1 })).toEqual({ value: 1 });
  });
});
