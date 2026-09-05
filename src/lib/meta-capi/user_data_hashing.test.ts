import { describe, expect, it } from "vitest";
import { hashed_user_data, sha256_hex } from "./user_data_hashing";

const hash_of = {
  john_smith:
    "62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f",
  us_phone: "e323ec626319ca94ee8bff2e4c87cf613be6ea19919ed1364124e16807ab3176",
  mary: "6915771be1c5aa0c886870b6951b03d7eafc121fea0e80a5ea83beb7c449f4ec",
  valery: "08e1996b5dd49e62a4b4c010d44e4345592a863bb9f8e3976219bac29417149c",
  jeong: "8fa8cd9c440be61d0151429310034083132b35975c4bea67fdd74158eb51db14",
  birth: "01acdbf6ec7b4f478a225f1a246e5d6767eeab1a7ffa17f025265b5b94f40f0c",
  us: "79adb2a2fce5c6ba215fe5f27f532d4e7edbac4b6a5e09e1ef3a08084a904621",
  user_42: "6d894aa3ee802549d7f340e7c1cf0d1c1cb14cd84f768d92ffaa6785337c4997",
  swiss_phone:
    "641b2674c7b3d41f0c5167c163c845f3d899639ebc622d0d3b4632abeb14e6b0",
};

describe("sha256_hex", () => {
  it("returns the lowercase hex digest Meta documents", () => {
    expect(sha256_hex("john_smith@gmail.com")).toBe(hash_of.john_smith);
  });
});

describe("hashed_user_data", () => {
  it("normalizes then hashes an email the way Meta's documentation shows", () => {
    expect(
      hashed_user_data({ em: "  John_Smith@gmail.com " }).user_data.em,
    ).toEqual([hash_of.john_smith]);
  });

  it("keeps digits only in a phone number and drops the leading zeros", () => {
    expect(hashed_user_data({ ph: "+1 (650) 555-1212" }).user_data.ph).toEqual([
      hash_of.us_phone,
    ]);
    expect(hashed_user_data({ ph: "0041 79 123 45 67" }).user_data.ph).toEqual([
      hash_of.swiss_phone,
    ]);
  });

  it("lowercases names, strips punctuation and keeps accents and other scripts", () => {
    const { user_data } = hashed_user_data({
      fn: ["Mary", "Valéry", "정"],
      ln: "O'Brien",
    });
    expect(user_data.fn).toEqual([hash_of.mary, hash_of.valery, hash_of.jeong]);
    expect(user_data.ln).toEqual([sha256_hex("obrien")]);
  });

  it("takes a birth date as YYYYMMDD or YYYY-MM-DD and refuses anything ambiguous", () => {
    expect(hashed_user_data({ db: "1997-02-16" }).user_data.db).toEqual([
      hash_of.birth,
    ]);
    expect(hashed_user_data({ db: "19970216" }).user_data.db).toEqual([
      hash_of.birth,
    ]);
    const refused = hashed_user_data({ db: "2/16/1997" });
    expect(refused.user_data.db).toBeUndefined();
    expect(refused.warnings).toEqual([expect.stringContaining("db")]);
  });

  it("reduces gender to its initial and drops anything else with a warning", () => {
    expect(hashed_user_data({ ge: "Female" }).user_data.ge).toEqual([
      sha256_hex("f"),
    ]);
    const refused = hashed_user_data({ ge: "x" });
    expect(refused.user_data.ge).toBeUndefined();
    expect(refused.warnings).toEqual([expect.stringContaining("ge")]);
  });

  it("removes spaces, digits and punctuation from city and state", () => {
    const { user_data } = hashed_user_data({ ct: "New York", st: "Zürich 8" });
    expect(user_data.ct).toEqual([sha256_hex("newyork")]);
    expect(user_data.st).toEqual([sha256_hex("zürich")]);
  });

  it("strips spaces from a postal code, keeps the part before a dash, and keeps five digits for the US", () => {
    expect(hashed_user_data({ zp: "M1 1AE" }).user_data.zp).toEqual([
      sha256_hex("m11ae"),
    ]);
    expect(hashed_user_data({ zp: "8000" }).user_data.zp).toEqual([
      sha256_hex("8000"),
    ]);
    expect(
      hashed_user_data({ zp: "94035-1234", country: "US" }).user_data.zp,
    ).toEqual([sha256_hex("94035")]);
    expect(
      hashed_user_data({ zp: "940351234", country: "US" }).user_data.zp,
    ).toEqual([sha256_hex("94035")]);
  });

  it("lowercases a country code and refuses anything but two letters", () => {
    expect(hashed_user_data({ country: "US" }).user_data.country).toEqual([
      hash_of.us,
    ]);
    const refused = hashed_user_data({ country: "Switzerland" });
    expect(refused.user_data.country).toBeUndefined();
    expect(refused.warnings).toEqual([expect.stringContaining("country")]);
  });

  it("trims and lowercases an external id before hashing, as Meta's SDK does", () => {
    expect(
      hashed_user_data({ external_id: " User-42 " }).user_data.external_id,
    ).toEqual([hash_of.user_42]);
  });

  it("passes an already hashed value through untouched", () => {
    expect(
      hashed_user_data({ em: hash_of.john_smith.toUpperCase() }).user_data.em,
    ).toEqual([hash_of.john_smith]);
  });

  it("drops empty values without a warning and warns on an invalid email", () => {
    const empty = hashed_user_data({ em: ["", "  "], fn: "" });
    expect(empty.user_data).toEqual({});
    expect(empty.warnings).toEqual([]);
    const invalid = hashed_user_data({ em: "not-an-email" });
    expect(invalid.user_data.em).toBeUndefined();
    expect(invalid.warnings).toEqual([expect.stringContaining("em")]);
  });

  it("never hashes the identifiers Meta wants in clear", () => {
    const { user_data } = hashed_user_data({
      client_ip_address: "203.0.113.7",
      client_user_agent: "Mozilla/5.0",
      fbc: "fb.1.1700000000000.AbC",
      fbp: "fb.1.1700000000000.123",
      subscription_id: "sub-1",
      fb_login_id: 42,
      lead_id: 7,
    });
    expect(user_data).toEqual({
      client_ip_address: "203.0.113.7",
      client_user_agent: "Mozilla/5.0",
      fbc: "fb.1.1700000000000.AbC",
      fbp: "fb.1.1700000000000.123",
      subscription_id: "sub-1",
      fb_login_id: 42,
      lead_id: 7,
    });
  });

  it("refuses an IP address that is neither v4 nor v6", () => {
    const refused = hashed_user_data({ client_ip_address: "not an ip" });
    expect(refused.user_data.client_ip_address).toBeUndefined();
    expect(refused.warnings).toEqual([
      expect.stringContaining("client_ip_address"),
    ]);
    expect(
      hashed_user_data({ client_ip_address: "2001:db8::1" }).user_data
        .client_ip_address,
    ).toBe("2001:db8::1");
  });
});
