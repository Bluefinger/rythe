import { CellState } from "../constants";
import { END, SKIP } from "../signal";
import { Cell, DependentTuple } from "../types";
import { markDependencies } from "./helpers/markDependencies";

const applyValue = <T>(cell: Cell<T>, value: T) => {
  if (value === END) {
    cell.end(true);
  } else if (value !== SKIP) {
    cell.val = value;
    return true;
  }
  return false;
};

function updateDep<T, U>(this: Cell<T>, [dep, fn]: DependentTuple<T, U>) {
  if (applyValue(dep, fn(this.val))) {
    flatDispatcher.stack.push(dep);
  }
}

const notifyDeps = <T>(cell: Cell<T>) => {
  cell.state = CellState.ACTIVE;
  if (cell.dependents.length) {
    cell.dependents.forEach(updateDep, cell);
  }
};

const flushQueue = () => {
  while (flatDispatcher.stack.length) {
    notifyDeps(flatDispatcher.stack.pop()!);
  }
};

/**
 * Dispatch Function for propagating Cell values across all dependencies.
 * Uses a flat queue broadcast approach (oldest dependency to newest
 * dependency traversal).
 */
export const flatDispatcher = <T>(cell: Cell<T>, value: T) => {
  if (applyValue(cell, value) && cell.state) {
    markDependencies(cell);
    notifyDeps(cell);
    flushQueue();
  }
};

flatDispatcher.stack = [] as Array<Cell<any>>;
