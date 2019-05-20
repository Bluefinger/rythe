import { createCell, isCell } from "../cell";
import { CellState } from "../constants";
import { SKIP } from "../signal";
import { Cell, OperatorFn } from "../types";

export function map<T>(
  mapFn: (value: T) => T,
  ignoreInitial?: SKIP
): OperatorFn<T, T>;
export function map<T, U>(
  mapFn: (value: T) => U,
  ignoreInitial?: SKIP
): OperatorFn<T, U>;

/**
 * Map operator. Takes the current Cell and applies a function to yield a
 * new Cell of the map function's output type. Can ignore the initial value
 * from the source Cell.
 */
export function map<T>(
  mapFn: (value: T) => any,
  ignoreInitial?: SKIP
): OperatorFn<any, any> {
  return (source: Cell<any>): Cell<any> => {
    if (!isCell(source)) {
      throw new Error("Source must be a Cell object");
    }
    const mapCell = createCell<any>();
    if (source.state >= CellState.ACTIVE && ignoreInitial !== SKIP) {
      mapCell(mapFn(source.val));
    }
    source.dependents.push([mapCell, mapFn]);
    mapCell.parents = source;
    return mapCell;
  };
}
