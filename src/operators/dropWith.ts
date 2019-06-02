import { SKIP } from "../signal";
import { Stream, OperatorFn } from "../types";
import { map } from "./map";

/**
 * Pushes non-repeating values using a predicate function. Skips any repeated values.
 */
export const dropWith = <T>(
  predicate: (prev: T | undefined, next: T) => boolean
): OperatorFn<T, T> => (source: Stream<T>): Stream<T> => {
  let prev: T | undefined;
  return map<T>((value): T => (predicate(prev, value) ? SKIP : (prev = value)))(
    source
  );
};
