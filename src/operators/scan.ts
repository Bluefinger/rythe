import { PENDING } from "../constants";
import { Stream, OperatorFn } from "../types/stream";
import { map } from "./map";

export function scan<T>(
  scanFn: (acc: T, newValue: T) => T,
  initial: T
): OperatorFn<T, T>;
export function scan<T>(
  scanFn: (acc: T[], newValue: T) => T[],
  initial: T[]
): OperatorFn<T, T[]>;
export function scan<T, U>(
  scanFn: (acc: U, newValue: T) => U,
  initial: U
): OperatorFn<T, U>;
/**
 * Accumulates values from a source Stream and outputs the accumulated value.
 * Always emits the initial value. Scan function should not be used to return
 * signals, such as END or SKIP. Always return a value.
 */
export function scan<T, U>(
  scanFn: (acc: U, newValue: T) => U,
  initial: U
): OperatorFn<T, U> {
  return (source: Stream<T>): Stream<U> => {
    let acc = initial;
    const scanned = map<T, U>((value) => {
      acc = scanFn(acc, value);
      return acc;
    })(source);
    if (scanned.state === PENDING) {
      scanned(initial);
    }
    return scanned;
  };
}
