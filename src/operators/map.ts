import { createStream, isStream } from "../stream";
import { ACTIVE } from "../constants";
import { SOURCE_ERROR } from "../errors";
import { Stream, OperatorFn } from "../types/stream";
import { subscriber } from "../utils/subscriber";

export function map<T>(
  mapFn: (value: T) => T,
  ignoreInitial?: true
): OperatorFn<T, T>;
export function map<T>(
  mapFn: (value: T) => T[],
  ignoreInitial?: true
): OperatorFn<T, T[]>;
export function map<T, U>(
  mapFn: (value: T) => U,
  ignoreInitial?: true
): OperatorFn<T, U>;

/**
 * Map operator. Takes the current Stream and applies a function to yield a
 * new Stream of the map function's output type. Can ignore the initial value
 * from the source Stream.
 */
export function map<T, U>(
  mapFn: (value: T) => U,
  ignoreInitial?: true
): OperatorFn<any, any> {
  return (source: Stream<T>): Stream<U> => {
    const { state, val } = source;
    if (!isStream(source)) {
      throw new Error(SOURCE_ERROR);
    }
    const mapStream = createStream<U>();
    if (state === ACTIVE && !ignoreInitial) {
      mapStream(mapFn(val));
    }
    return subscriber(mapStream, source, mapFn);
  };
}
