import { Stream, DependentTuple } from "../types";
import { markActive } from "./helpers/markActive";
import { markDependencies } from "./helpers/markDependencies";
import { shouldApplyValue } from "./helpers/shouldApplyValue";

const stack: Stream<any>[] = [];

const updateCell = <T, U>(value: T, [dep, fn]: DependentTuple<T, U>): void => {
  if (shouldApplyValue(dep, fn(value))) {
    if (dep.dependents.length) {
      stack.push(dep);
    } else {
      markActive(dep);
    }
  }
};

const updateDependencies = <T>(stream: Stream<T>): void => {
  markActive(stream);
  const deps = stream.dependents;
  const value = stream.val;
  for (let i = deps.length; i--; ) {
    updateCell(value, deps[i]);
  }
};

/**
 * Dispatch Function for propagating Stream values across all dependencies.
 * Uses a flat stack broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const flatDispatcher = <T>(stream: Stream<T>, value: T): void => {
  if (shouldApplyValue(stream, value) && stream.state) {
    if (stream.dependents.length) {
      markDependencies(stream);
      updateDependencies(stream);
      while (stack.length) {
        // While stack has a length over 0, that means .pop() will always yield an item.
        // Therefore, I have to assert to TS that it will always get a value here.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        updateDependencies(stack.pop()!);
      }
    } else {
      markActive(stream);
    }
  }
};
