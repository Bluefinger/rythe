import { Stream } from "../../src";
import { createStream } from "../../src/stream";
import { StreamState } from "../../src/constants";
import { combine, map } from "../../src/operators/index";

describe("combine()", () => {
  it("transforms value", () => {
    const a = createStream<number>();
    const b = combine(sA => sA() + 1, [a]);
    a(2);
    expect(b()).toBe(3);
  });
  it("transforms default value", () => {
    const a = createStream<number>(4);
    const b = combine(sA => sA() - 1, [a]);
    expect(b()).toBe(3);
  });
  it("transforms multiple values", () => {
    const a = createStream<number>();
    const b = createStream<string>();
    const c = combine<[Stream<number>, Stream<string>], string>(
      (sA, sB) => sA() + sB(),
      [a, b]
    );
    a(1);
    b("5");
    expect(c()).toBe("15");
  });
  it("transforms multiple default values", () => {
    const a = createStream<number>(2);
    const b = createStream<number>(4);
    const c = combine((sA, sB) => sA() + sB(), [a, b]);

    expect(c()).toBe(6);
  });
  it("transforms mixed default and emitted values", () => {
    const a = createStream<number>(5);
    const b = createStream<number>();
    const c = combine((sA, sB) => sA() + sB(), [a, b]);
    b(1);
    expect(c()).toBe(6);
  });
  it("combines value atomically", () => {
    const atomic: number[] = [];
    const a = createStream<number>();
    const b = a.pipe(map(num => num + 2));
    const c = a.pipe(map(num => num * 10));
    const testInference = (sA: Stream<number>, sB: Stream<number>): number =>
      atomic.push(sA() + sB());
    const d = combine(testInference, [b, c]);
    a(3)(4);
    expect(d()).toBe(2);
    expect(atomic).toEqual([35, 46]);
  });
  it("combines default value atomically", () => {
    const atomic: number[] = [];
    const a = createStream<number>(4);
    const b = a.pipe(map(num => num + 2));
    const c = a.pipe(map(num => num * 10));
    const d = combine((sA, sB) => atomic.push(sA() + sB()), [b, c]);
    expect(d()).toBe(1);
    expect(atomic).toEqual([46]);
  });
  it("combines and maps nested streams atomically", () => {
    const atomic: string[] = [];
    const a = createStream<string>();
    const b = combine(sA => sA() + 2, [a]);
    const c = combine(sA => sA() + sA(), [a]);
    const d = c.pipe(map(x => x + 1));
    const e = combine(x => x() + 0, [d]);
    const f = combine((sB, sE) => atomic.push(sB() + sE()), [b, e]);

    a("3")("4");

    expect(atomic).toEqual(["323310", "424410"]);
    expect(f()).toBe(2);
  });
  it("combine continues with ended streams", () => {
    const a = createStream<number>();
    const b = createStream<number>();
    const combined = combine((sA, sB) => sA() + sB(), [a, b]);

    a(3);
    b(4);
    a.end(true);
    b(5);

    expect(combined()).toBe(8);
  });
  it("combine removes all listeners with .end", () => {
    const a = createStream<number>();
    const b = createStream<number>();
    const c = combine((sA, sB) => sA() + sB(), [b, a]);

    expect(c.parents!.length).toBe(2);
    a(3);
    b(4);

    c.end(true);
    b(5);

    expect(c()).toBe(7);
    expect(c.parents).toBe(null);
    expect(b.dependents.length).toBe(0);
    expect(a.dependents.length).toBe(0);
  });
  it("creates a pending stream with an empty array as sources", () => {
    const c = combine(() => true, []);
    expect(c.state).toBe(StreamState.PENDING);
    expect(c()).toBeUndefined();
    c(false);
    expect(c.state).toBe(StreamState.ACTIVE);
    expect(c()).toBe(false);
  });
  it("throws an error if the sources are not Stream functions", () => {
    const fakeCell = (() => true) as Stream<boolean>;
    expect(() => combine(fake => fake(), [fakeCell])).toThrow();
  });
});
