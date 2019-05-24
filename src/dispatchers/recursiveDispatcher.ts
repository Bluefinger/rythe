import { Stream, DependentTuple, Dispatcher } from "../types";
import {
  isReady,
  markActive,
  markDependencies,
  shouldApplyValue
} from "./dispatcherHelpers";

const hasDependencies = <T>(stream: Stream<T>): void => {
  markActive(stream);
  const { dependents, val } = stream;
  if (dependents.length) {
    // Recursive, so it has to rely on hoisting.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    updateDependencies(val, dependents);
  }
};

const updateDependencies = <T>(
  value: T,
  deps: DependentTuple<T, any>[]
): void => {
  for (let i = deps.length; i--; ) {
    const [dep, fn] = deps[i];
    if (isReady(dep) && shouldApplyValue(dep, fn(value))) {
      hasDependencies(dep);
    }
  }
};

/**
 * Dispatch Function for propagating Stream values across all dependencies.
 * Uses a recursive broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const recursiveDispatcher: Dispatcher = <T>(
  stream: Stream<T>,
  value: T
): void => {
  if (shouldApplyValue(stream, value) && stream.state) {
    markDependencies(stream);
    hasDependencies(stream);
  }
};
