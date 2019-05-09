import { CellState } from "../constants";
import { END, SKIP } from "../signal";
import { Cell, DependentTuple } from "../types";
import { markDependencies } from "./helpers/markDependencies";

const applyValue = <T, U>(cell: Cell<T>, [dep, fn]: DependentTuple<T, U>) =>
  recursiveDispatcher(dep, fn(cell.val));

/**
 * Dispatch Function for propagating Cell values across all dependencies.
 * Uses a recursive broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const recursiveDispatcher = <T>(cell: Cell<T>, value: T) => {
  if (value === END) {
    cell.end(true);
  } else if (value !== SKIP) {
    cell.val = value;
    if (cell.state) {
      cell.state = CellState.ACTIVE;
      const deps = cell.dependents;
      let len = deps.length;
      if (len) {
        if (!recursiveDispatcher.depth++) {
          markDependencies(cell);
        }
        while (len--) {
          applyValue(cell, deps[len]);
        }
        --recursiveDispatcher.depth;
      }
    }
  }
};

recursiveDispatcher.depth = 0;
