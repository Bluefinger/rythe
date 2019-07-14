import { createStream, isStream } from "rythe/stream";
import { scanMerge, map } from "rythe/operators";
import { Stream } from "rythe/types";
import { ACTIVE, CLOSED, PENDING } from "rythe/constants";

describe("scanMerge", () => {
  it("accumulates many streams into a single stream", () => {
    const add = createStream<number>();
    const sub = createStream<number>();
    const mul = createStream<number>();
    const m = scanMerge(
      1,
      [add, (acc, val) => acc + val],
      [sub, (acc, val) => acc - val],
      [mul, (acc, val) => acc * val]
    );
    const v = m.pipe(map(val => val + ""));
    expect(isStream(m)).toBe(true);
    expect(m()).toBe(1);
    add(5);
    expect(v()).toBe("6");
    sub(3);
    expect(v()).toBe("3");
    mul(4);
    expect(v()).toBe("12");
  });
  it("doesn't immediately accumulates all active parent streams, returns only initial value", () => {
    const add = createStream<number>(4);
    const sub = createStream<number>();
    const mul = createStream<number>(2);
    const m = scanMerge(
      0,
      [add, (acc, val) => acc + val],
      [sub, (acc, val) => acc - val],
      [mul, (acc, val) => acc * val]
    );
    expect(m()).toBe(0);
  });
  it("errors if a non-stream source is provided", () => {
    const add = createStream<number>();
    const sub = (() => 10) as Stream<number>;
    expect(() =>
      scanMerge(
        0,
        [add, (acc, val) => acc + val],
        [sub, (acc, val) => acc - val]
      )
    ).toThrow();
  });
  it("closes when any of its parent streams ends", () => {
    const add = createStream<number>(4);
    const sub = createStream<number>(5);
    const mul = createStream<number>();
    const m = scanMerge(
      0,
      [add, (acc, val) => acc + val],
      [sub, (acc, val) => acc - val],
      [mul, (acc, val) => acc * val]
    );
    sub(1);
    expect(m()).toBe(-1);
    expect(m.state).toBe(ACTIVE);
    add.end(true);
    expect(add.state).toBe(CLOSED);
    expect(sub.state).toBe(ACTIVE);
    expect(mul.state).toBe(PENDING);
    expect(m.state).toBe(CLOSED);
  });
});
