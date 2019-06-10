import { isStream, createStream } from "rythe/stream";
import { scan, after } from "rythe/operators";

jest.useFakeTimers();

describe("after", () => {
  afterEach(() => {
    jest.clearAllTimers();
  });
  it("returns a stream", () => {
    const a = createStream<number>();
    const af = a.pipe(after(100));
    expect(isStream(af)).toBe(true);
  });
  it("emits a list of accumulated after a specified period of no updates", () => {
    const a = createStream<number>();
    const af = a.pipe(after(100));
    const count = af.pipe(scan(num => ++num, 0));
    expect(af()).toBeUndefined();
    expect(count()).toBe(0);
    a(2);
    jest.advanceTimersByTime(80);
    expect(af()).toBeUndefined();
    expect(count()).toBe(0);
    a(4);
    jest.advanceTimersByTime(20);
    expect(af()).toBeUndefined();
    expect(count()).toBe(0);
    a(6);
    jest.advanceTimersByTime(100);
    expect(af()).toEqual([2, 4, 6]);
    expect(count()).toBe(1);
    a(8)(10);
    jest.advanceTimersByTime(100);
    expect(af()).toEqual([8, 10]);
    expect(count()).toBe(2);
  });
  it("stops accumulating after being ended", () => {
    const a = createStream<number>();
    const af = a.pipe(after(100));
    const count = af.pipe(scan(num => ++num, 0));
    a(2)(4);
    jest.advanceTimersByTime(100);
    expect(af()).toEqual([2, 4]);
    expect(count()).toBe(1);
    af.end(true);
    a(6)(8);
    jest.advanceTimersByTime(100);
    expect(af()).toEqual([2, 4]);
    expect(count()).toBe(1);
  });
  it("clears existing timers if ended after receiving updates during its waiting period", () => {
    const a = createStream<number>();
    const af = a.pipe(after(100));
    const count = af.pipe(scan(num => ++num, 0));
    a(2)(4);
    jest.advanceTimersByTime(100);
    expect(af()).toEqual([2, 4]);
    expect(count()).toBe(1);
    a(6)(8);
    jest.advanceTimersByTime(20);
    af.end(true);
    jest.advanceTimersByTime(100);
    expect(af()).toEqual([2, 4]);
    expect(count()).toBe(1);
  });
});
