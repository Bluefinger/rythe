import { lift } from "rythe/operators";
import { createStream, isStream } from "rythe/stream";

describe("lift", () => {
  it("unwraps all its source Streams and provides their values as parameters", () => {
    const a = createStream<number>(5);
    const b = createStream<string>("5");
    const c = lift((...args) => args, a, b);
    expect(isStream(c)).toBe(true);
    expect(c()).toEqual([5, "5"]);
  });
});
