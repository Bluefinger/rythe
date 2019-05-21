import { SKIP } from "../signal";
import { Stream } from "../types";
import { map } from "./map";

/**
 * Pushes non-repeating values. Skips any repeated values.
 */
export const dropRepeats = <T>(source: Stream<T>): Stream<T> => {
  let prev: T;
  return map<T>((next): T => (next !== prev ? (prev = next) : SKIP))(source);
};
