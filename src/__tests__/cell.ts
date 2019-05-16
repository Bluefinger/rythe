import { createCell, isCell, setDispatcher } from "../cell";
import { CellState } from "../constants";
import { END } from "../signal";
import { Cell } from "../types";

describe("CellStream", () => {
  describe("Cell", () => {
    it("can act as a getter and setter", () => {
      const a = createCell<number>(5);
      expect(a()).toBe(5);
      expect(a(6)).toBe(a);
      expect(a()).toBe(6);
    });
    it("it returns undefined by default", () => {
      const a = createCell<number>();
      expect(a()).toBeUndefined();
    });
    it("it can be updated with an explicit undefined", () => {
      const a = createCell<number | undefined>(5);
      expect(a()).toBe(5);
      a(undefined);
      expect(a()).toBe(undefined);
    });
    it("it can be updated with an explicit null", () => {
      const a = createCell<number | null>(5);
      expect(a()).toBe(5);
      a(null);
      expect(a()).toBe(null);
    });
    it("it starts with pending state value and updates to active value", () => {
      const a = createCell<number>();
      expect(a()).toBeUndefined();
      expect(a.state).toBe(CellState.PENDING);
      a(5);
      expect(a()).toBe(5);
      expect(a.state).toBe(CellState.ACTIVE);
    });
    it("it can be ended by passing true to .end", () => {
      const a = createCell<number>(5);
      expect(a()).toBe(5);
      expect(a.end()).toBe(false);
      a.end(true);
      expect(a()).toBe(5);
      expect(a.end()).toBe(true);
      expect(a.state).toBe(CellState.CLOSED);

      // The Cell can still be updated, but it will remain closed and won't push to any dependents
      a(6);
      expect(a()).toBe(6);
      expect(a.state).toBe(CellState.CLOSED);
    });
    it("it can be ended with END signal", () => {
      const a = createCell<number>(5);
      expect(a()).toBe(5);
      expect(a.end.val).toBe(false);
      a(END);
      expect(a()).toBe(5);
      expect(a.end.val).toBe(true);
      expect(a.state).toBe(CellState.CLOSED);
    });
    it("won't end if passed anything that isn't a boolean true value into .end", () => {
      const a = createCell<number>(5);
      expect(a()).toBe(5);
      expect(a.end.val).toBe(false);
      expect(a.state).toBe(CellState.ACTIVE);
      a.end(false);
      expect(a.state).toBe(CellState.ACTIVE);
      a.end(END);
      expect(a.state).toBe(CellState.ACTIVE);
      a.end(true);
      expect(a.state).toBe(CellState.CLOSED);
    });
    it("is pipeable", () => {
      const a = createCell<number>();
      expect(isCell(a.pipe())).toBe(true);
      expect(a.pipe()).toBe(a);
    });
  });
  describe("toJSON", () => {
    it("can serialize into a JSON string", () => {
      const a = createCell<number>(2);
      const b = createCell<string>("foo");
      const c = createCell<Cell<number>>(a);
      const d = createCell<any>({ e: true });
      const e = createCell<any>();
      const f = createCell<any>(null);
      const json = JSON.stringify({ a, b, c, d, e, f });
      expect(json).toBe('{"a":2,"b":"foo","c":2,"d":{"e":true},"f":null}');
    });
  });
  describe("setDispatcher", () => {
    it("can be set with a new dispatcher function", () => {
      const dispatcher = jest.fn(<T>(cell: Cell<T>, value: T) => {
        cell.val = value;
      });
      const a = createCell<number>();
      setDispatcher(dispatcher);
      a(5);
      expect(a()).toBe(5);
      expect(dispatcher).toBeCalledTimes(1);
    });
  });
});
