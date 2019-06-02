import { Stream } from "../types";
import { dropWith } from "./dropWith";

const directComparison = <T>(prev: T, next: T): boolean => prev === next;

/**
 * Pushes non-repeating values via direct comparison `prev === next`. Skips any repeated values.
 */
export const dropRepeats = <T>(source: Stream<T>): Stream<T> =>
  dropWith<T>(directComparison)(source);
