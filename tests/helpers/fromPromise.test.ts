import { fromPromise } from "rythe/helpers";
import { isStream } from "rythe/stream";
import { StreamState } from "rythe/constants";

const delay = <T>(ms: number, value?: T, fail?: true) =>
  new Promise<T>((resolve, reject) =>
    setTimeout(fail ? reject : resolve, ms, value)
  );

jest.useFakeTimers();

describe("fromPromise", () => {
  it("should return a Stream that is waiting for the Promise to resolve", () => {
    const p = delay(100);
    const s = fromPromise(p);
    expect(isStream(s)).toBe(true);
    expect(s.state).toBe(StreamState.PENDING);
  });
  it("should return the resolved value and close once done", async () => {
    expect.assertions(4);
    const p = delay(100, "foo");
    const s = fromPromise(p);

    expect(s()).toBeUndefined();
    expect(s.state).toBe(StreamState.PENDING);

    jest.runAllTimers();
    await p;
    expect(s()).toBe("foo");
    expect(s.state).toBe(StreamState.CLOSED);
  });
  it("should close if the Promise rejects", async () => {
    expect.assertions(4);
    const p = delay(100, "Error", true);
    const s = fromPromise(p);
    try {
      expect(s.state).toBe(StreamState.PENDING);
      jest.runAllTimers();
      await p;
    } catch (e) {
      expect(e).toBe("Error");
      expect(s()).toBe(undefined);
      expect(s.state).toBe(StreamState.CLOSED);
    }
  });
});
