import { Stream } from "../types";
import { combine } from "./combine";

const unwrapValue = <V>({ val }: Stream<V>): V => val;

export function lift(liftFn: () => void, ...sources: []): Stream<void>;
export function lift<T1, U>(
  liftFn: (value: T1) => U,
  ...sources: [Stream<T1>]
): Stream<U>;
export function lift<T1, T2, U>(
  liftFn: (value1: T1, value2: T2) => U,
  ...sources: [Stream<T1>, Stream<T2>]
): Stream<U>;
export function lift<T1, T2, T3, U>(
  liftFn: (value1: T1, value2: T2, value3: T3) => U,
  ...sources: [Stream<T1>, Stream<T2>, Stream<T3>]
): Stream<U>;
export function lift<T1, T2, T3, T4, U>(
  liftFn: (value1: T1, value2: T2, value3: T3, value4: T4) => U,
  ...sources: [Stream<T1>, Stream<T2>, Stream<T3>, Stream<T4>]
): Stream<U>;
export function lift<T1, T2, T3, T4, T5, U>(
  liftFn: (value1: T1, value2: T2, value3: T3, value4: T4, value5: T5) => U,
  ...sources: [Stream<T1>, Stream<T2>, Stream<T3>, Stream<T4>, Stream<T5>]
): Stream<U>;
export function lift<T1, T2, T3, T4, T5, T6, U>(
  liftFn: (
    value1: T1,
    value2: T2,
    value3: T3,
    value4: T4,
    value5: T5,
    value6: T6
  ) => U,
  ...sources: [
    Stream<T1>,
    Stream<T2>,
    Stream<T3>,
    Stream<T4>,
    Stream<T5>,
    Stream<T6>
  ]
): Stream<U>;
export function lift<T1, T2, T3, T4, T5, T6, T7, U>(
  liftFn: (
    value1: T1,
    value2: T2,
    value3: T3,
    value4: T4,
    value5: T5,
    value6: T6,
    value7: T7
  ) => U,
  ...sources: [
    Stream<T1>,
    Stream<T2>,
    Stream<T3>,
    Stream<T4>,
    Stream<T5>,
    Stream<T6>,
    Stream<T7>
  ]
): Stream<U>;
export function lift<T1, T2, T3, T4, T5, T6, T7, T8, U>(
  liftFn: (
    value1: T1,
    value2: T2,
    value3: T3,
    value4: T4,
    value5: T5,
    value6: T6,
    value7: T7,
    value8: T8
  ) => U,
  ...sources: [
    Stream<T1>,
    Stream<T2>,
    Stream<T3>,
    Stream<T4>,
    Stream<T5>,
    Stream<T6>,
    Stream<T7>,
    Stream<T8>
  ]
): Stream<U>;

export function lift(
  liftFn: (...values: any[]) => any,
  ...sources: Stream<any>[]
) {
  return combine(
    (...streams) => liftFn(...streams.map(unwrapValue)),
    ...sources
  );
}
