import { createStream, isStream } from "rythe/stream";
import { ACTIVE, PENDING } from "rythe/constants";
import { flattenPromise, map } from "rythe/operators";
import flushPromises from "flush-promises";

jest.useFakeTimers();

const delay = <T>(ms: number, value: T, error?: true) =>
  new Promise<T>((resolve, reject) =>
    setTimeout(error ? reject : resolve, ms, value)
  );

describe("flattenPromise", () => {
  it("returns a stream", () => {
    const a = createStream(Promise.resolve(1));
    const b = flattenPromise(a);
    expect(isStream(b)).toBe(true);
  });
  it("flattens the stream to return a promise's value", async () => {
    expect.assertions(6);
    const promise = delay(100, 1);
    const a = createStream(promise);
    const b = flattenPromise(a);
    expect(a()).toBe(promise);
    expect(b.state).toBe(PENDING);
    expect(b()).toBeUndefined();
    jest.runAllTimers();
    const value = await promise;
    expect(a()).resolves.toBe(value);
    expect(b.state).toBe(ACTIVE);
    expect(b()).toBe(value);
  });
  it("is pipeable", async () => {
    expect.assertions(3);
    const a = createStream<number>();
    const b = a.pipe(
      map(value => delay(100, value)),
      flattenPromise,
      map(value => value + 2)
    );
    expect(isStream(b)).toBe(true);
    a(5);
    expect(b()).toBeUndefined();
    jest.runAllTimers();
    await flushPromises();
    expect(b()).toBe(7);
  });
  it("skips rejected promises", async () => {
    expect.assertions(4);
    const a = createStream(delay(100, "Error", true));
    const b = flattenPromise(a);
    jest.runAllTimers();
    await flushPromises();
    expect(a.state).toBe(ACTIVE);
    expect(a()).rejects.toBe("Error");
    expect(b.state).toBe(PENDING);
    expect(b()).toBeUndefined();
  });
  it("allows an error handler to be used to catch errors", async () => {
    expect.assertions(2);
    const handler = jest.fn();
    const a = createStream(delay(100, "Error", true));
    const b = flattenPromise(a, handler);
    jest.runAllTimers();
    await flushPromises();
    expect(b()).toBeUndefined();
    expect(handler).toBeCalledWith("Error");
  });
});
