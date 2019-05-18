import { Cell, DependentTuple } from "../types";
import { markActive } from "./helpers/markActive";
import { markDependencies } from "./helpers/markDependencies";
import { shouldApplyValue } from "./helpers/shouldApplyValue";

const stack: Cell<any>[] = [];

const updateCell = <T, U>(cell: Cell<T>, [dep, fn]: DependentTuple<T, U>): void => {
  if (shouldApplyValue(dep, fn(cell.val))) {
    if (dep.dependents.length) {
      stack.push(dep);
    } else {
      markActive(dep);
    }
  }
};

const updateDependencies = <T>(cell: Cell<T>): void => {
  markActive(cell);
  const deps = cell.dependents;
  for (let i = deps.length; i--; ) {
    updateCell(cell, deps[i]);
  }
};

/**
 * Dispatch Function for propagating Cell values across all dependencies.
 * Uses a flat stack broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const flatDispatcher = <T>(cell: Cell<T>, value: T): void => {
  if (shouldApplyValue(cell, value) && cell.state) {
    if (cell.dependents.length) {
      markDependencies(cell);
      updateDependencies(cell);
      while (stack.length) {
        // While stack has a length, that means .pop() will always yield an item.
        // Therefore, I have to assert to TS that it will always get a value here.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        updateDependencies(stack.pop()!);
      }
    } else {
      markActive(cell);
    }
  }
};
