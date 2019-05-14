import { SKIP } from "../signal";
import { Cell, OperatorFn } from "../types";
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
  return (source: Cell<T>) =>
    map<T>(value => (predicate(value) ? value : SKIP))(source);
}
