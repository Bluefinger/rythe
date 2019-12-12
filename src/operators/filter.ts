import { SKIP } from "../signal";
import { Stream, OperatorFn } from "../types/stream";
import { map } from "./map";

export function filter<T, U extends T>(
  predicate: (value: T) => value is U
): OperatorFn<T, U>;
export function filter<T>(predicate: (value: T) => boolean): OperatorFn<T, T>;

/**
 * Filters emitted values using a predicate function to determine what is
 * allowed and what is not.
 */
export function filter<T>(predicate: (value: T) => boolean): OperatorFn<T, T> {
  return (source: Stream<T>): Stream<T> =>
    map<T>((value): T => (predicate(value) ? value : SKIP))(source);
}
