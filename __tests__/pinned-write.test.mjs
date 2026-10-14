import { describe, it, expect } from "vitest";
import { readBackFirst, storedDiffers } from "../src/logic.js";

describe("readBackFirst", () => {
  it("no status, a 400, a 5xx other than 507, or a UNIQUE answer: may have been stored", () => {
    for (const e of [new TypeError("Failed to fetch"), { status: 400 }, { status: 500 }, { status: 503 }, undefined,
      { status: 400, code: "UNIQUE_CONSTRAINT" }, Object.assign(new Error("UNIQUE constraint failed: t.id"), { status: 400 })]) {
      expect(readBackFirst(e)).toBe(true);
    }
  });
  it("a refusal the hub named stored nothing", () => {
    for (const status of [403, 404, 409, 429, 507]) expect(readBackFirst({ status })).toBe(false);
    expect(readBackFirst(Object.assign(new Error("Pick one."), { forUser: true }))).toBe(false);
  });
});

describe("storedDiffers", () => {
  const fields = { title: "Bills", notes: "" };
  it("same as stored, compared as text, null as empty", () => {
    expect(storedDiffers({ title: "Bills", notes: null, extra: "x" }, fields)).toBe(false);
  });
  it("a form edited since the first try", () => {
    expect(storedDiffers({ title: "Bills", notes: "monthly" }, fields)).toBe(true);
  });
});
