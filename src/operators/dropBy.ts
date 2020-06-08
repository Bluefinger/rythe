import { dropWith } from "./dropWith";
import { OperatorFn } from "../types/stream";

/**
 * Selects a value by key from next/previous objects and pushes non-repeating values.
 * Skips any repeated values.
 */
export const dropBy = <T, K extends keyof T = any>(key: K): OperatorFn<T, T> =>
  dropWith<T>((prev, next) => (prev && prev[key]) === next[key]);
