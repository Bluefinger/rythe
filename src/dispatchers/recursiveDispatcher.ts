import { Stream, DependentTuple } from "../types";
import { markActive } from "./helpers/markActive";
import { markDependencies } from "./helpers/markDependencies";
import { shouldApplyValue } from "./helpers/shouldApplyValue";

const hasDependencies = <T>(stream: Stream<T>): void => {
  markActive(stream);
  if (stream.dependents.length) {
    // Recursive, so it has to rely on hoisting.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    updateDependencies(stream.val, stream.dependents);
  }
};

const updateDependencies = <T>(
  value: T,
  deps: DependentTuple<T, any>[]
): void => {
  for (let i = deps.length; i--; ) {
    const [dep, fn] = deps[i];
    if (shouldApplyValue(dep, fn(value))) {
      hasDependencies(dep);
    }
  }
};

/**
 * Dispatch Function for propagating Stream values across all dependencies.
 * Uses a recursive broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const recursiveDispatcher = <T>(stream: Stream<T>, value: T): void => {
  if (shouldApplyValue(stream, value) && stream.state) {
    markDependencies(stream);
    hasDependencies(stream);
  }
};
