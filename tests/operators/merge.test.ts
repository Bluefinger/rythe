import { createStream, isStream } from "rythe/stream";
import { merge } from "rythe/operators";
import { Stream } from "rythe/types";
import { ACTIVE, CLOSED, PENDING } from "rythe/constants";

describe("merge", () => {
  it("combines many streams into a single stream", () => {
    const a = createStream<number>();
    const b = createStream<string>();
    const c = createStream<boolean>();
    const m = merge(a, b, c);
    expect(isStream(m)).toBe(true);
    a(5);
    expect(m()).toBe(5);
    b("6");
    expect(m()).toBe("6");
    c(true);
    expect(m()).toBe(true);
  });
  it("immediately returns the newest active parent stream", () => {
    const a = createStream<number>();
    const b = createStream<string>("4");
    const c = createStream<boolean>();
    const m = merge(a, b, c);
    expect(m()).toBe("4");
  });
  it("errors if a non-stream source is provided", () => {
    const a = createStream<number>();
    const b = (() => true) as Stream<boolean>;
    expect(() => merge(a, b)).toThrow();
  });
  it("closes when any of its parent streams ends", () => {
    const a = createStream<number>();
    const b = createStream<string>("5");
    const c = createStream<boolean>();
    const m = merge(a, b, c);
    expect(m()).toBe("5");
    expect(m.state).toBe(ACTIVE);
    a.end(true);
    expect(a.state).toBe(CLOSED);
    expect(b.state).toBe(ACTIVE);
    expect(c.state).toBe(PENDING);
    expect(m.state).toBe(CLOSED);
  });
});
