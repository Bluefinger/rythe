import { createStream } from "rythe/stream";
import { StreamState } from "rythe/constants";
import { map } from "rythe/operators";
import { END, SKIP } from "rythe/signal";
import { Stream } from "rythe/types";

describe("map", () => {
  it("transforms values it receives", () => {
    const a = createStream<number | null>();
    const b = a.pipe(map<number>(value => value || 0));
    a(5);
    expect(a()).toBe(5);
    expect(b()).toBe(5);
    a(null);
    expect(a()).toBe(null);
    expect(b()).toBe(0);
  });
  it("transforms initial values", () => {
    const a = createStream<number | null>(5);
    const mapFn = jest.fn((value: number | null) => value || 0);
    const b = a.pipe(map<number>(mapFn));
    expect(a()).toBe(5);
    expect(b()).toBe(5);
    expect(mapFn).toBeCalledTimes(1);
  });
  it("can ignore the initial value", () => {
    const a = createStream<number | null>(5);
    const mapFn = jest.fn((value: number | null) => value || 0);
    const b = a.pipe(map<number>(mapFn, SKIP));
    expect(a()).toBe(5);
    expect(b()).toBeUndefined();
    expect(mapFn).toBeCalledTimes(0);
  });
  it("can be interrupted with SKIP signal", () => {
    const a = createStream<number>();
    const mapFn = jest.fn((n: number) => (n === 5 ? SKIP : n));
    const b = a.pipe(map<number>(mapFn));
    a(2)(3)(SKIP)(5);
    expect(a()).toBe(5);
    expect(b()).toBe(3);
    expect(mapFn).toBeCalledTimes(3);
  });
  it("can be ended with .end", () => {
    const a = createStream<number>(2);
    const mapFn = jest.fn((n: number) => (n === 5 ? SKIP : n));
    const b = a.pipe(map<number>(mapFn));

    expect(b()).toBe(2);
    expect(b.parents).toEqual([a]);
    expect(a.dependents.length).toBe(1);
    expect(a.dependents[0]).toEqual([b, mapFn]);

    b.end(true);
    expect(b.parents).toEqual([]);
    expect(a.dependents.length).toBe(0);

    a(3)(5);
    expect(a()).toBe(5);
    expect(b()).toBe(2);
    expect(mapFn).toBeCalledTimes(1);
    expect(b.state).toBe(StreamState.CLOSED);
    expect(a.state).toBe(StreamState.ACTIVE);
  });
  it("can be ended with END signal", () => {
    const a = createStream<number>(2);
    const mapFn = jest.fn((n: number) => (n === 5 ? SKIP : n));
    const b = a.pipe(map<number>(mapFn));
    expect(b()).toBe(2);
    b(END);
    a(3)(5);
    expect(a()).toBe(5);
    expect(b()).toBe(2);
    expect(mapFn).toBeCalledTimes(1);
    expect(b.state).toBe(StreamState.CLOSED);
  });
  it("will only push to Streams that aren't closed", () => {
    const a = createStream<number>();
    const b = map<number>(n => n + 1)(a);
    const c = map<number>(n => n + 2)(b);
    const d = map<number, string>(n => n.toString(16))(b);
    const e = map<number, boolean>(n => n < 5)(b);
    expect(b.dependents.length).toBe(3);
    a(9);
    expect(c()).toBe(12);
    expect(d()).toBe("a");
    expect(e()).toBe(false);
    d.end(true);
    a(10);
    expect(c()).toBe(13);
    expect(d()).toBe("a");
    expect(e()).toBe(false);
    expect(b.dependents.length).toBe(2);
  });
  it("will throw an error if trying to map a non Stream function", () => {
    expect(() =>
      map((n: number) => n)(((n: number) => n) as Stream<number>)
    ).toThrow();
  });
});
