import { flatDispatcher } from "..";
import { createCell, setDispatcher } from "../cell";
import { CellState } from "../constants";
import { END, SKIP } from "../signal";
import { Cell } from "../types";

describe("CellStream", () => {
  describe("createCell", () => {
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
  });
  describe("map", () => {
    it("transforms values it receives", () => {
      const a = createCell<number | null>();
      const b = a.map<number>(value => value || 0);
      a(5);
      expect(a()).toBe(5);
      expect(b()).toBe(5);
      a(null);
      expect(a()).toBe(null);
      expect(b()).toBe(0);
    });
    it("transforms initial values", () => {
      const a = createCell<number | null>(5);
      const mapFn = jest.fn((value: number | null) => value || 0);
      const b = a.map<number>(mapFn);
      expect(a()).toBe(5);
      expect(b()).toBe(5);
      expect(mapFn).toBeCalledTimes(1);
    });
    it("can ignore the initial value", () => {
      const a = createCell<number | null>(5);
      const mapFn = jest.fn((value: number | null) => value || 0);
      const b = a.map<number>(mapFn, SKIP);
      expect(a()).toBe(5);
      expect(b()).toBeUndefined();
      expect(mapFn).toBeCalledTimes(0);
    });
    it("can be interrupted with SKIP signal", () => {
      const a = createCell<number>();
      const mapFn = jest.fn((n: number) => (n === 5 ? SKIP : n));
      const b = a.map<number>(mapFn);
      a(2)(3)(SKIP)(5);
      expect(a()).toBe(5);
      expect(b()).toBe(3);
      expect(mapFn).toBeCalledTimes(3);
    });
    it("can be ended with .end", () => {
      const a = createCell<number>(2);
      const mapFn = jest.fn((n: number) => (n === 5 ? SKIP : n));
      const b = a.map<number>(mapFn);

      expect(b()).toBe(2);
      expect(b.parents).toBe(a);
      expect(a.dependents.length).toBe(1);
      expect(a.dependents[0]).toEqual([b, mapFn]);

      b.end(true);
      expect(b.parents).toBe(null);
      expect(a.dependents.length).toBe(0);

      a(3)(5);
      expect(a()).toBe(5);
      expect(b()).toBe(2);
      expect(mapFn).toBeCalledTimes(1);
      expect(b.state).toBe(CellState.CLOSED);
      expect(a.state).toBe(CellState.ACTIVE);
    });
    it("can be ended with END signal", () => {
      const a = createCell<number>(2);
      const mapFn = jest.fn((n: number) => (n === 5 ? SKIP : n));
      const b = a.map<number>(mapFn);
      expect(b()).toBe(2);
      b(END);
      a(3)(5);
      expect(a()).toBe(5);
      expect(b()).toBe(2);
      expect(mapFn).toBeCalledTimes(1);
      expect(b.state).toBe(CellState.CLOSED);
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
      // tslint:disable-next-line
      const dispatcher = jest.fn(<T>(cell: Cell<T>, value: T) => {});
      const a = createCell<number>();
      setDispatcher(dispatcher);
      a(5);
      expect(dispatcher).toBeCalledTimes(1);
    });
    it("can use alternative dispatcher approaches to update cells", () => {
      const dispatcher = jest.fn<void, [Cell<any>, any]>(flatDispatcher);
      const a = createCell<number>();
      const b = a.map(val => (val === 8 ? SKIP : val + 1));
      setDispatcher(dispatcher);
      a(5)(8);
      expect(dispatcher).toBeCalledTimes(2);
      expect(b()).toBe(6);
    });
    it("can use the alternate dispatcher to close cells with an END signal", () => {
      const dispatcher = jest.fn<void, [Cell<any>, any]>(flatDispatcher);
      setDispatcher(dispatcher);
      const a = createCell<number>(5);
      const b = a.map(val => val + 1);
      dispatcher.mockClear();
      a(END);
      a(6);
      expect(dispatcher).toBeCalledTimes(3);
      expect(b()).toBe(6);
    });
  });
});
