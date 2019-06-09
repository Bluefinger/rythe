import { createStream, isStream } from "rythe/stream";
import { skip, map } from "rythe/operators";

describe("skip", () => {
  it("returns a stream", () => {
    const a = createStream<number>();
    const s = a.pipe(skip(3));
    expect(isStream(s)).toBe(true);
  });
  it("skips the provided amount of times", () => {
    const a = createStream<number>();
    const s = a.pipe(skip(3));
    const m = s.pipe(map(value => value + 1));
    a(1)(2)(3);
    expect(s()).toBeUndefined();
    expect(m()).toBeUndefined();

    a(4);
    expect(s()).toBe(4);
    expect(m()).toBe(5);
  });
});
