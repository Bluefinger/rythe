import { SKIP } from "../signal";
import { Cell } from "../types";
import { map } from "./map";

/**
 * Pushes non-repeating values. Skips any repeated values.
 */
export const dropRepeats = <T>(source: Cell<T>) => {
  let prev: T;
  return map<T>(next => (next !== prev ? (prev = next) : SKIP))(source);
};
