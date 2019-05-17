import { createCell, setDispatcher } from "../../src/cell";
import { CellState } from "../../src/constants";
import { recursiveDispatcher } from "../../src/dispatchers/recursiveDispatcher";
import { combine, map } from "../../src/operators/index";
import { END, SKIP } from "../../src/signal";
import { Cell } from "../../src/types";

describe("recursiveDispatcher", () => {
  const dispatcher = jest.fn<void, [Cell<any>, any]>(recursiveDispatcher);
  setDispatcher(dispatcher);
  beforeEach(() => {
    dispatcher.mockClear();
  });
  it("can update cells", () => {
    const a = createCell<number>();
    const b = a.pipe(map(val => (val === 8 ? SKIP : val + 1)));
    setDispatcher(dispatcher);
    a(5)(8);
    expect(dispatcher).toBeCalledTimes(2);
    expect(b()).toBe(6);
  });
  it("can close cells with an END signal", () => {
    const a = createCell<number>(5);
    const b = a.pipe(map(val => val + 1));
    expect(dispatcher).toBeCalledTimes(2);
    dispatcher.mockClear();
    a(END);
    expect(dispatcher).toBeCalledTimes(2);
    dispatcher.mockClear();
    a(6);
    expect(dispatcher).toBeCalledTimes(1);
    expect(b()).toBe(6);
    expect(a.state).toBe(CellState.CLOSED);
  });
  it("combines complicated stream dependencies atomically", () => {
    const atomic: string[] = [];
    const a = createCell<string>();
    const b = createCell<string>();
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
