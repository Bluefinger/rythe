import { makeUInt } from "rythe/utils/makeUInt";

describe("makeUInt", () => {
  it("takes a float and returns an integer", () => {
    expect(makeUInt(3.5)).toBe(3);
  });
  it("takes a negative number/float and returns a positive number", () => {
    expect(makeUInt(-3)).toBe(3);
    expect(makeUInt(-3.5)).toBe(3);
  });
  it("guards against non-number types", () => {
    expect(() => makeUInt("3" as any)).toThrow();
    expect(() => makeUInt(true as any)).toThrow();
    expect(() => makeUInt({} as any)).toThrow();
    expect(() => makeUInt([] as any)).toThrow();
    expect(() => makeUInt((() => {}) as any)).toThrow();
    expect(() => makeUInt(null as any)).toThrow();
    expect(() => makeUInt(undefined as any)).toThrow();
  });
  it("guards against NaN", () => {
    expect(() => makeUInt(NaN)).toThrow();
  });
});
