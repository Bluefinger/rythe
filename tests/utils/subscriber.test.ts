import { createStream } from "rythe/stream";
import { combine, map } from "rythe/operators";
import { END } from "rythe/signal";
import { subscriber } from "rythe/utils/subscriber";

describe("subscriber", () => {
  it("subscribes a stream with no parents", () => {
    const a = createStream<number>();
    const b = createStream<string>();
    expect(a.dependents.length).toBe(0);
    expect(a.parents).toBe(null);
    subscriber<number, string>(b, a, (value: number) => value + "");
    expect(b.parents).toBe(a);
  });
  it("subscribes a stream with one parent already", () => {
    const a = createStream<number>();
    const b = a.pipe(map(value => value + ""));
    expect(b.parents).toBe(a);
    subscriber(b, a.end, () => END);
    expect(b.parents).toEqual([a, a.end]);
  });
  it("subscribes a stream with many parents already", () => {
    const a = createStream<number>();
    const b = createStream<number>();
    const c = combine((sA, sB) => sA() + sB(), [a, b]);
    expect(c.parents).toEqual([a, b]);
    subscriber(c, a.end, () => END);
    expect(c.parents).toEqual([a, b, a.end]);
  });
});
