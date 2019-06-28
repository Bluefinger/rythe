import { createStream } from "rythe/stream";
import { StreamState } from "rythe/constants";
import { dispatcher } from "rythe/dispatcher";
import { combine, map } from "rythe/operators";
import { END, SKIP } from "rythe/signal";

jest.mock("rythe/dispatcher", () => {
  const { dispatcher } = jest.requireActual("rythe/dispatcher");
  return {
    dispatcher: jest.fn(dispatcher)
  };
});

describe("recursiveDispatcher", () => {
  const dispatch = dispatcher as jest.Mock;

  beforeEach(() => {
    dispatch.mockClear();
  });
  it("can update streams", () => {
    const a = createStream<number>();
    const b = a.pipe(map(val => (val === 8 ? SKIP : val + 1)));
    a(5)(8);
    expect(dispatch).toBeCalledTimes(2);
    expect(b()).toBe(6);
  });
  it("can close streams with an END signal", () => {
    const a = createStream<number>(5);
    const b = a.pipe(map(val => val + 1));
    expect(dispatch).toBeCalledTimes(2);
    dispatch.mockClear();
    a(END);
    expect(dispatch).toBeCalledTimes(2);
    dispatch.mockClear();
    a(6);
    expect(dispatch).toBeCalledTimes(1);
    expect(b()).toBe(6);
    expect(a.state).toBe(StreamState.CLOSED);
  });
  it("combines complicated stream dependencies atomically", () => {
    const atomic: string[] = [];
    const a = createStream<string>();
    const b = createStream<string>();
    const c = combine((sA, sB) => sA() + sB() + "c", a, b);
    const d = map<string>(val => val + "d")(c);
    const e = combine((sB, sC) => sB() + sC() + "e", b, c);
    const f = combine(
      (sD, sE) => {
        const result = sD() + sE() + "f";
        atomic.push(result);
        return result;
      },
      d,
      e
    );

    // Should invoke once once there are no streams pending values
    a("c")("a");
    b("b");
    expect(f()).toBe("abcdbabcef");
    expect(atomic).toEqual(["abcdbabcef"]);
    expect(dispatcher).toBeCalledTimes(3);
    dispatch.mockClear();
    atomic.length = 0;
    // Should now invoke three times
    a("A");
    b("B");
    a("");
    expect(f()).toBe("BcdBBcef");
    expect(atomic).toEqual(["AbcdbAbcef", "ABcdBABcef", "BcdBBcef"]);
    expect(dispatch).toBeCalledTimes(3);
  });
});
