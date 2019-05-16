import { Cell } from "../types";
import { markActive } from "./helpers/markActive";
import { markDependencies } from "./helpers/markDependencies";
import { shouldApplyValue } from "./helpers/shouldApplyValue";

const hasDependencies = (cell: Cell<any>, first?: true) => {
  if (cell.dependents.length) {
    if (first) {
      markDependencies(cell);
    }
    markActive(cell);
    updateDependencies(cell);
  } else {
    markActive(cell);
  }
};

const updateDependencies = <T>(cell: Cell<T>) => {
  const deps = cell.dependents;
  for (let i = deps.length; i--; ) {
    const [dep, fn] = deps[i];
    if (shouldApplyValue(dep, fn(cell.val))) {
      hasDependencies(dep);
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
    hasDependencies(cell, true);
  }
};
