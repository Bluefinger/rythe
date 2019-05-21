import { createStream, setDispatcher } from "../../src/stream";
import { StreamState } from "../../src/constants";
import { flatDispatcher } from "../../src/dispatchers/flatDispatcher";
import { combine, map } from "../../src/operators/index";
import { END, SKIP } from "../../src/signal";
import { Stream } from "../../src/types";

describe("flatDispatcher", () => {
  const dispatcher = jest.fn<void, [Stream<any>, any]>(flatDispatcher);
  setDispatcher(dispatcher);
  beforeEach(() => {
    dispatcher.mockClear();
  });
  it("can update cells", () => {
    const a = createStream<number>();
    const b = a.pipe(map(val => (val === 8 ? SKIP : val + 1)));
    a(5)(8);
    expect(dispatcher).toBeCalledTimes(2);
    expect(b()).toBe(6);
  });
  it("can close cells with an END signal", () => {
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

    // Should invoke once once there are no cells pending values
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
