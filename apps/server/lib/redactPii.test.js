import { describe, it, expect } from "vitest";
import {
  maskEmail,
  maskPhone,
  maskNamePart,
  maskFullName,
  redactDeep,
} from "./redactPii.js";

describe("maskEmail", () => {
  it("keeps the first character and the top-level domain", () => {
    expect(maskEmail("alice@gmail.com")).toBe("a••••@•••••.com");
  });

  it("hides the domain name itself", () => {
    expect(maskEmail("bob@farmfresh-private.com")).not.toContain("farmfresh-private");
  });

  it("handles a single-character local part", () => {
    expect(maskEmail("a@b.com")).toBe("a•@•.com");
  });

  it("handles a domain with no dot", () => {
    expect(maskEmail("dev@localhost")).toBe("d••@•••••••••");
  });

  it("degrades safely on malformed input", () => {
    expect(maskEmail("not-an-email")).toBe("•••••");
    expect(maskEmail("@nolocal.com")).toBe("•••••");
    expect(maskEmail(null)).toBe("•••••");
  });
});

describe("maskPhone", () => {
  it("keeps only the last four digits", () => {
    expect(maskPhone("01712345678")).toBe("•••••••5678");
  });

  it("does not leak a short number", () => {
    expect(maskPhone("123")).toBe("•123");
  });

  it("returns empty for empty input", () => {
    expect(maskPhone("")).toBe("");
    expect(maskPhone(null)).toBe("");
  });
});

describe("name masking", () => {
  it("reduces a name part to an initial", () => {
    expect(maskNamePart("Ada")).toBe("A.");
    expect(maskNamePart("lovelace")).toBe("L.");
  });

  it("reduces a joined full name to initials", () => {
    expect(maskFullName("Ada Lovelace")).toBe("A. L.");
    expect(maskFullName("  Grace  Brewster Hopper ")).toBe("G. B. H.");
  });

  it("returns empty rather than throwing on missing input", () => {
    expect(maskNamePart(null)).toBe("");
    expect(maskFullName(undefined)).toBe("");
  });
});

describe("redactDeep", () => {
  it("masks PII on a flat user record", () => {
    const out = redactDeep({
      _id: "abc",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@analytical.com",
      phone: "01712345678",
      address: "12 Somewhere Road, Dhaka",
      userType: "customer",
    });

    expect(out.firstName).toBe("A.");
    expect(out.lastName).toBe("L.");
    expect(out.email).toBe("a••@••••••••••.com");
    expect(out.phone).toBe("•••••••5678");
    expect(out.address).toBe("•••••");
    expect(out._id).toBe("abc");
    expect(out.userType).toBe("customer");
  });

  it("reaches PII inside a populated sub-document", () => {
    const out = redactDeep({
      status: true,
      data: [
        { _id: "o1", total: 500, user: { firstName: "Ada", email: "ada@analytical.com" } },
      ],
    });

    expect(out.data[0].user.email).not.toContain("analytical.com");
    expect(out.data[0].user.firstName).toBe("A.");
    expect(out.data[0].total).toBe(500);
    expect(out.status).toBe(true);
  });

  it("reaches PII nested several levels deep", () => {
    const out = redactDeep({ a: { b: { c: [{ farmer: { email: "f@farm.io" } }] } } });
    expect(out.a.b.c[0].farmer.email).not.toContain("farm.io");
  });

  it("leaves a response with no PII untouched", () => {
    const body = { status: true, data: { totalOrders: 13, revenue: 19141 } };
    expect(redactDeep(body)).toEqual(body);
  });

  it("does not mutate its input", () => {
    const body = { user: { email: "ada@analytical.com" } };
    redactDeep(body);
    expect(body.user.email).toBe("ada@analytical.com");
  });

  it("leaves Dates intact rather than rebuilding them", () => {
    const when = new Date("2026-01-01T00:00:00.000Z");
    const out = redactDeep({ createdAt: when, email: "a@b.com" });
    expect(out.createdAt).toBeInstanceOf(Date);
    expect(out.createdAt.getTime()).toBe(when.getTime());
  });

  it("survives a cyclic structure", () => {
    const node = { email: "a@b.com" };
    node.self = node;
    expect(() => redactDeep(node)).not.toThrow();
  });

  it("passes primitives and null through", () => {
    expect(redactDeep(null)).toBeNull();
    expect(redactDeep(42)).toBe(42);
    expect(redactDeep("plain")).toBe("plain");
  });

  it("masks every record in a list, leaking nothing", () => {
    const out = redactDeep([
      { email: "ada@analytical.com", phone: "01711111111" },
      { email: "alan@bletchley.uk", phone: "01722222222" },
    ]);
    const serialised = JSON.stringify(out);
    expect(serialised).not.toContain("analytical.com");
    expect(serialised).not.toContain("bletchley");
    expect(serialised).not.toContain("0171111");
  });
});
