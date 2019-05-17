import { createCell } from "../../src/cell";
import { dropRepeats, map } from "../../src/operators/index";

describe("dropRepeats", () => {
  it("will not pass down repeat values", () => {
    const a = createCell<number>();
    const mapFn = jest.fn((n: number) => n);
    const m = a.pipe(
      dropRepeats,
      map(mapFn)
    );
    a(1)(1)(2)(2)(2)(3);
    expect(m()).toBe(3);
    expect(mapFn).toBeCalledTimes(3);
  });
  it("passes down initial value immediately", () => {
    const a = createCell<number>(1);
    const mapFn = jest.fn((n: number) => n);
    const m = a.pipe(
      dropRepeats,
      map(mapFn)
    );
    expect(m()).toBe(1);
    expect(mapFn).toBeCalledTimes(1);
  });
  it("handles explicit undefined values", () => {
    const a = createCell<number | undefined>();
    const mapFn = jest.fn((n: number | undefined) => n);
    const m = a.pipe(
      dropRepeats,
      map(mapFn)
    );
    a(1)(1)(undefined)(undefined)(2)(3);
    expect(m()).toBe(3);
    expect(mapFn).toBeCalledTimes(4);
  });
  it("handles explicit null values", () => {
    const a = createCell<number | null>();
    const mapFn = jest.fn((n: number | null) => n);
    const m = a.pipe(
      dropRepeats,
      map(mapFn)
    );
    a(1)(1)(null)(null)(2)(3);
    expect(m()).toBe(3);
    expect(mapFn).toBeCalledTimes(4);
  });
  it("uses strict equality to check for repeats", () => {
    const objA = { a: 1 };
    const objB = { a: 1 };
    const a = createCell<any>();
    const mapFn = jest.fn((n: any) => n);
    const m = a.pipe(
      dropRepeats,
      map(mapFn)
    );

    // Assert objects are similar in shape, but not the same instance
    expect(objA).toEqual(objB);
    expect(objA).not.toBe(objB);

    a(objA)(objA)(objB)(objB)(objA);
    expect(m()).toBe(objA);
    expect(mapFn).toBeCalledTimes(3);

    // Different types are not strictly equal
    mapFn.mockClear();
    a("1")(1)(1);
    expect(m()).toBe(1);
    expect(mapFn).toBeCalledTimes(2);

    // undefined and null are not strictly equal
    mapFn.mockClear();
    a(undefined)(undefined)(null)(null);
    expect(m()).toBe(null);
    expect(mapFn).toBeCalledTimes(2);
  });
  it("doesn't push values down after .end is invoked", () => {
    const a = createCell<number>();
    const dr = dropRepeats(a);
    const mapFn = jest.fn((n: number) => n);
    const m = map(mapFn)(dr);

    a(1)(3);
    expect(m()).toBe(3);
    expect(mapFn).toBeCalledTimes(2);
    expect(dr.parents).toBe(a);

    mapFn.mockClear();
    dr.end(true);
    a(3)(3)(1);
    expect(m()).toBe(3);
    expect(mapFn).toBeCalledTimes(0);
    expect(dr.parents).toBe(null);
  });
});
