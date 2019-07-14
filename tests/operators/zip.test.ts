import { createStream, isStream } from "rythe/stream";
import { zip } from "rythe/operators";
import { Stream } from "rythe/types";
import { ACTIVE, CLOSED, PENDING } from "rythe/constants";

describe("zip", () => {
  it("zips multiple streams into a single array value", () => {
    const a = createStream<number>();
    const b = createStream<string>();
    const z = zip(a, b);
    expect(isStream(z)).toBe(true);
    a(5)(4)(3);
    b("c");
    expect(z()).toEqual([5, "c"]);
    b("d");
    expect(z()).toEqual([4, "d"]);
  });
  it("zips all active streams immediately into an array value", () => {
    const a = createStream<number>(2);
    const b = createStream<string>("b");
    const z = zip(a, b);
    expect(z()).toEqual([2, "b"]);
  });
  it("errors if a non-stream source is provided", () => {
    const a = createStream<number>();
    const b = (() => true) as Stream<boolean>;
    expect(() => zip(a, b)).toThrow();
  });
  it("errors if no input streams are provided", () => {
    expect(() => zip()).toThrow();
  });
  it("closes when any of its parent streams ends and has no more values in the closed stream's buffer", () => {
    const a = createStream<number>();
    const b = createStream<string>();
    const c = createStream<boolean>();
    const z = zip(a, b, c);
    a(8)(9)(10);
    c(true)(false);
    b("e");
    expect(z()).toEqual([8, "e", true]);
    expect(z.state).toBe(ACTIVE);
    a.end(true);
    c.end(true);
    expect(z.state).toBe(ACTIVE);
    b("f");
    expect(z()).toEqual([9, "f", false]);
    expect(z.state).toBe(CLOSED);
  });
  it("closes after the initial value of a closed stream has been zipped", () => {
    const a = createStream<number>();
    const b = createStream<string>("a");
    b.end(true);
    const z = zip(a, b);
    expect(z.state).toBe(PENDING);
    a(10);
    expect(z()).toEqual([10, "a"]);
    expect(z.state).toBe(CLOSED);
  });
});
