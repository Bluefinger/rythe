import { createStream, isStream } from "rythe/stream";
import { take, map } from "rythe/operators";
import { CLOSED } from "rythe/constants";

describe("skip", () => {
  it("returns a stream", () => {
    const a = createStream<number>();
    const t = a.pipe(take(3));
    expect(isStream(t)).toBe(true);
  });
  it("takes the provided amount of times then ends", () => {
    const a = createStream<number>();
    const t = a.pipe(take(3));
    const m = t.pipe(map(value => value + 1));
    a(1)(2)(3);
    expect(t()).toBe(3);
    expect(m()).toBe(4);

    a(4);
    expect(t()).toBe(3);
    expect(m()).toBe(4);
    expect(t.state).toBe(CLOSED);
  });
});
