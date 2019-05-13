import { Cell } from "../types";
import { markActive } from "./helpers/markActive";
import { markDependencies } from "./helpers/markDependencies";
import { shouldApplyValue } from "./helpers/shouldApplyValue";

const updateDependencies = <T>(cell: Cell<T>) => {
  markActive(cell);
  const deps = cell.dependents;
  let len = deps.length;
  while (len--) {
    const [dep, fn] = deps[len];
    if (shouldApplyValue(dep, fn(cell.val))) {
      updateDependencies(dep);
    }
  }
};

/**
 * Dispatch Function for propagating Cell values across all dependencies.
 * Uses a recursive broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const recursiveDispatcher = <T>(cell: Cell<T>, value: T) => {
  if (shouldApplyValue(cell, value) && cell.state) {
    if (cell.dependents.length) {
      markDependencies(cell);
      updateDependencies(cell);
    } else {
      markActive(cell);
    }
  }
};
