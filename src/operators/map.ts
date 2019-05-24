import { createStream, isStream } from "../stream";
import { StreamState, StreamError } from "../constants";
import { SKIP } from "../signal";
import { Stream, OperatorFn } from "../types";

const { ACTIVE, PENDING } = StreamState;

export function map<T>(
  mapFn: (value: T) => T,
  ignoreInitial?: SKIP
): OperatorFn<T, T>;
export function map<T, U>(
  mapFn: (value: T) => U,
  ignoreInitial?: SKIP
): OperatorFn<T, U>;

/**
 * Map operator. Takes the current Stream and applies a function to yield a
 * new Stream of the map function's output type. Can ignore the initial value
 * from the source Stream.
 */
export function map<T>(
  mapFn: (value: T) => any,
  ignoreInitial?: SKIP
): OperatorFn<any, any> {
  return (source: Stream<any>): Stream<any> => {
    const { state, dependents, val } = source;
    if (!isStream(source)) {
      throw new Error(StreamError.SOURCE_ERROR);
    }
    const mapStream = createStream<any>();
    if (state === ACTIVE && ignoreInitial !== SKIP) {
      mapStream(mapFn(val));
    } else if (state === PENDING) {
      mapStream.waiting = 1;
    }
    dependents.push([mapStream, mapFn]);
    mapStream.parents = source;
    return mapStream;
  };
}
