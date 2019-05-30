import { createStream, isStream } from "rythe/stream";
import { map } from "rythe/operators";
import { pipe } from "rythe/utils/pipe";

describe("pipe", () => {
  it("should throw an error if no functions are piped", () => {
    expect(() => pipe()).toThrow();
  });
  it("should accept any pipeable operators", () => {
    const piped = pipe(map((n: number) => n + 1));
    expect(typeof piped).toBe("function");
  });
  it("should apply piped functions to Streams and return a new Stream", () => {
    const piped = pipe(
      map<number>(n => n + 1),
      map(n => n.toString(16)),
      map(s => s + "b")
    );
    const a = createStream<number>();
    const b = piped(a);
    expect(a).not.toBe(b);
    expect(isStream(b)).toBe(true);
    a(9);
    expect(a()).toBe(9);
    expect(b()).toBe("ab");
  });
});
