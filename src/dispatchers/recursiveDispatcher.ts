import { Cell, DependentTuple } from "../types";
import { markActive } from "./helpers/markActive";
import { markDependencies } from "./helpers/markDependencies";
import { shouldApplyValue } from "./helpers/shouldApplyValue";

const hasDependencies = <T>(cell: Cell<T>): void => {
  markActive(cell);
  if (cell.dependents.length) {
    // Recursive, so it has to rely on hoisting.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    updateDependencies(cell.val, cell.dependents);
  }
};

const updateDependencies = <T>(value: T, deps: DependentTuple<T, any>[]): void => {
  for (let i = deps.length; i--; ) {
    const [dep, fn] = deps[i];
    if (shouldApplyValue(dep, fn(value))) {
      hasDependencies(dep);
    }
  }
};

/**
 * Dispatch Function for propagating Cell values across all dependencies.
 * Uses a recursive broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const recursiveDispatcher = <T>(cell: Cell<T>, value: T): void => {
  if (shouldApplyValue(cell, value) && cell.state) {
    markDependencies(cell);
    hasDependencies(cell);
  }
};
