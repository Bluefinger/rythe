import { Cell, DependentTuple } from "../types";
import { markActive } from "./helpers/markActive";
import { markDependencies } from "./helpers/markDependencies";
import { shouldApplyValue } from "./helpers/shouldApplyValue";

function updateCell<T, U>(this: Cell<T>, [dep, fn]: DependentTuple<T, U>) {
  if (shouldApplyValue(dep, fn(this.val))) {
    if (dep.dependents.length) {
      flatDispatcher.stack.push(dep);
    } else {
      markActive(dep);
    }
  }
}

const updateDependencies = <T>(cell: Cell<T>) => {
  markActive(cell);
  cell.dependents.forEach(updateCell, cell);
};

/**
 * Dispatch Function for propagating Cell values across all dependencies.
 * Uses a flat stack broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const flatDispatcher = <T>(cell: Cell<T>, value: T) => {
  if (shouldApplyValue(cell, value) && cell.state) {
    if (cell.dependents.length) {
      markDependencies(cell);
      updateDependencies(cell);
      while (flatDispatcher.stack.length) {
        updateDependencies(flatDispatcher.stack.pop()!);
      }
    } else {
      markActive(cell);
    }
  }
};

flatDispatcher.stack = [] as Array<Cell<any>>;
