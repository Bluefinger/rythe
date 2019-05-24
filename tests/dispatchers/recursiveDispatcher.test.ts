import { createStream } from "../../src/stream";
import { StreamState } from "../../src/constants";
import { recursiveDispatcher } from "../../src/dispatchers/recursiveDispatcher";
import { combine, map } from "../../src/operators/index";
import { END, SKIP } from "../../src/signal";

jest.mock("../../src/dispatchers/recursiveDispatcher", () => {
  const { recursiveDispatcher } = jest.requireActual(
    "../../src/dispatchers/recursiveDispatcher"
  );
  return {
    recursiveDispatcher: jest.fn(recursiveDispatcher)
  };
});

describe("recursiveDispatcher", () => {
  const dispatcher = recursiveDispatcher as jest.Mock;

  beforeEach(() => {
    dispatcher.mockClear();
  });
  it("can update streams", () => {
    const a = createStream<number>();
    const b = a.pipe(map(val => (val === 8 ? SKIP : val + 1)));
    a(5)(8);
    expect(dispatcher).toBeCalledTimes(2);
    expect(b()).toBe(6);
  });
  it("can close streams with an END signal", () => {
    const a = createStream<number>(5);
    const b = a.pipe(map(val => val + 1));
    expect(dispatcher).toBeCalledTimes(2);
    dispatcher.mockClear();
    a(END);
    expect(dispatcher).toBeCalledTimes(2);
    dispatcher.mockClear();
    a(6);
    expect(dispatcher).toBeCalledTimes(1);
    expect(b()).toBe(6);
    expect(a.state).toBe(StreamState.CLOSED);
  });
  it("combines complicated stream dependencies atomically", () => {
    const atomic: string[] = [];
    const a = createStream<string>();
    const b = createStream<string>();
    const c = combine((sA, sB) => sA() + sB() + "c", [a, b]);
    const d = map<string>(val => val + "d")(c);
    const e = combine((sB, sC) => sB() + sC() + "e", [b, c]);
    const f = combine(
      (sD, sE) => {
        const result = sD() + sE() + "f";
        atomic.push(result);
        return result;
      },
      [d, e]
    );

    // Should invoke once once there are no streams pending values
    a("a");
    b("b");
    expect(f()).toBe("abcdbabcef");
    expect(atomic).toEqual(["abcdbabcef"]);
    expect(dispatcher).toBeCalledTimes(2);
    dispatcher.mockClear();
    atomic.length = 0;
    // Should now invoke three times
    a("A");
    b("B");
    a("");
    expect(f()).toBe("BcdBBcef");
    expect(atomic).toEqual(["AbcdbAbcef", "ABcdBABcef", "BcdBBcef"]);
    expect(dispatcher).toBeCalledTimes(3);
  });
});
