import { CellState } from "./constants";
import { recursiveDispatcher } from "./dispatchers/recursiveDispatcher";
import { SKIP } from "./signal";
import { Cell, Dispatcher, OperatorFn } from "./types";
import { pipeFromArray } from "./utils/pipe";

function toJSON(this: Cell<any>): any {
  return this.val != null && this.val.toJSON ? this.val.toJSON() : this.val;
}

function map<T, U>(
  this: Cell<T>,
  mapFn: (current: T) => U,
  ignoreInitial?: SKIP
) {
  const mapCell = createCell<U>();
  if (this.state >= CellState.ACTIVE && ignoreInitial !== SKIP) {
    mapCell(mapFn(this.val));
  }
  this.dependents.push([mapCell, mapFn]);
  mapCell.parents = this;
  return mapCell;
}

function removeDep(this: Cell<any>, parent: Cell<any>) {
  let index: number;
  const deps = parent.dependents;
  for (index = deps.length; index--; ) {
    if (deps[index][0] === this) {
      break;
    }
  }
  if (index >= 0) {
    deps.splice(index, 1);
  }
}

function boundPipe<T>(
  this: Cell<T>,
  ...operators: Array<OperatorFn<any, any>>
) {
  if (!operators.length) {
    return this;
  }
  return pipeFromArray(operators)(this);
}

const close = <T>(cell: Cell<T>) => {
  if (cell.parents) {
    if (Array.isArray(cell.parents)) {
      cell.parents.forEach(removeDep, cell);
    } else {
      removeDep.call(cell, cell.parents);
    }
  }
  cell.dependents.length = 0;
  cell.parents = null;
  cell.state = CellState.CLOSED;
  return close;
};

let dispatch: Dispatcher = recursiveDispatcher;

const initCell = <T>(cell: Partial<Cell<T>>): Cell<T> => {
  cell.dependents = [];
  cell.parents = null;
  cell.state = CellState.PENDING;

  cell.map = map;
  cell.pipe = boundPipe;
  cell.toJSON = toJSON;
  cell.constructor = initCell;

  return cell as Cell<T>;
};

/**
 * Checks for whether the input is a Cell object.
 */
export const isCell = (obj: any): boolean =>
  obj && obj.constructor === initCell;

/**
 * Cell Factory function. Creates a Cell stream function based on the type of
 * the initial value, or by the type definition.
 */
export const createCell = <T>(initialValue?: T): Cell<T> => {
  function next(value?: T): T | Cell<T> {
    if (!arguments.length) {
      return cell.val;
    }
    dispatch(cell, value!);
    return cell;
  }
  function complete(value?: boolean): boolean | Cell<boolean> {
    if (!arguments.length) {
      return cell.end.val;
    } else if (cell.end.state && value && typeof value === "boolean") {
      dispatch(cell.end, value);
      close(cell)(cell.end);
    }
    return cell.end;
  }

  const cell = initCell<T>(next as Partial<Cell<T>>);
  cell.end = initCell<boolean>(complete as Partial<Cell<boolean>>);
  cell.end.val = false;
  cell.end.end = cell.end;

  if (initialValue !== undefined) {
    cell(initialValue);
  }

  return cell;
};

/**
 * Sets the dispatcher to the provided function. Must match the Dispatcher signature.
 */
export const setDispatcher = (newDispatcher: Dispatcher) => {
  dispatch = newDispatcher;
};
