import { createStream } from "rythe/stream";
import { combine, map, scan } from "rythe/operators";
import { SKIP } from "rythe/signal";

describe("scan", () => {
  it("should default to an initial value", () => {
    const a = createStream<number>();
    const s = scan((acc, value) => acc + value, 0)(a);
    expect(s()).toBe(0);
  });
  it("should accumulate values", () => {
    const a = createStream<number>(0);
    const s = scan<number, string>((acc, value) => acc + value, "")(a);
    a(1)(2)(3);
    expect(s()).toBe("0123");
  });
  it("can be mapped", () => {
    const a = createStream<number>();
    const m = a.pipe(
      scan((acc, value) => acc + value, 0),
      map(value => value + 1)
    );
    a(1)(2)(3);
    expect(m()).toBe(7);
  });
  it("pushes initial value down first", () => {
    const atomic: number[] = [];
    const scanFn = jest.fn((acc: number, value: number) => acc + value);
    const a = createStream<number>();
    const m = a.pipe(
      scan(scanFn, 0),
      map(value => atomic.push(value))
    );

    expect(m()).toBe(1);
    expect(atomic).toEqual([0]);
    expect(scanFn).toBeCalledTimes(0);
  });
  it("should accumulate atomically", () => {
    const atomic: number[] = [];
    const scanFn = jest.fn((acc: number, value: number) => acc + value);
    const a = createStream<number>();
    const b = createStream<number>();
    const aM = map<number>(n => n)(a);
    const c = combine((sA, sB) => sA() + sB(), [aM, b]);
    const s = scan(scanFn, 0)(c);
    const m = map<number>(value => atomic.push(value), SKIP)(s);
    a(2);
    b(2)(5);
    a(3);
    expect(m()).toBe(3);
    expect(atomic).toEqual([4, 11, 19]);
    expect(scanFn).toBeCalledTimes(3);
  });
  it("stops accumulating after .end is invoked", () => {
    const a = createStream<number>();
    const scanFn = jest.fn((acc: number, value: number) => acc + value);
    const s = scan(scanFn, 0)(a);

    a(1)(2)(3);
    expect(s()).toBe(6);
    expect(s.parents).toBe(a);
    expect(scanFn).toBeCalledTimes(3);

    scanFn.mockClear();
    s.end(true);
    a(5)(6);

    expect(s()).toBe(6);
    expect(s.parents).toBe(null);
    expect(scanFn).toBeCalledTimes(0);
  });
});
