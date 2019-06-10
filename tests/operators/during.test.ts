import { isStream, createStream } from "rythe/stream";
import { scan, during } from "rythe/operators";
import { advanceBy } from "jest-date-mock";

jest.useFakeTimers();

describe("during", () => {
  afterEach(() => {
    jest.clearAllTimers();
  });
  it("returns a stream", () => {
    const a = createStream<number>();
    const d = a.pipe(during(100));
    expect(isStream(d)).toBe(true);
    d.end(true);
  });
  it("collects values it receives and only emits after set duration has passed", () => {
    const a = createStream<number>();
    const d = a.pipe(during(100));
    const count = d.pipe(scan(num => ++num, 0));
    a(1)(2)(3);
    expect(d()).toBeUndefined();
    expect(count()).toBe(0);
    advanceBy(100);
    jest.advanceTimersByTime(100);
    expect(d()).toEqual([1, 2, 3]);
    expect(count()).toBe(1);
    a(4)(5);
    advanceBy(50);
    jest.advanceTimersByTime(50);
    expect(d()).toEqual([1, 2, 3]);
    expect(count()).toBe(1);
    a(6);
    advanceBy(50);
    jest.advanceTimersByTime(50);
    expect(d()).toEqual([4, 5, 6]);
    expect(count()).toBe(2);
  });
  it("doesn't collect values after it has ended", () => {
    const a = createStream<number>();
    const d = a.pipe(during(100));
    const count = d.pipe(scan(num => ++num, 0));
    a(1)(2)(3);
    advanceBy(100);
    jest.advanceTimersByTime(100);
    expect(d()).toEqual([1, 2, 3]);
    expect(count()).toBe(1);
    d.end(true);
    a(4)(5);
    advanceBy(100);
    jest.advanceTimersByTime(100);
    expect(d()).toEqual([1, 2, 3]);
    expect(count()).toBe(1);
    a(6);
    advanceBy(100);
    jest.advanceTimersByTime(100);
    expect(d()).toEqual([1, 2, 3]);
    expect(count()).toBe(1);
  });
});
