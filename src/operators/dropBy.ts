import { dropWith } from "./dropWith";

/**
 * Selects a value by key from next/previous objects and pushes non-repeating values.
 * Skips any repeated values.
 */
export const dropBy = <
  T extends any = any,
  K extends keyof T = string | number | symbol
>(
  key: K
) => dropWith<T>((prev, next) => prev[key] === next[key]);
