import { SKIP } from "../signal";
import { Cell, OperatorFn } from "../types";
import { map } from "./map";

/**
 * Filters emitted values using a predicate function to determine what is
 * allowed and what is not.
 */
export function filter<T>(filterFn: (value: T) => boolean): OperatorFn<T, T> {
  return (source: Cell<T>) =>
    map<T>(value => (filterFn(value) ? value : SKIP))(source);
}
