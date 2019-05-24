import { createStream, isStream } from "../stream";
import { StreamState } from "../constants";
import { SKIP } from "../signal";
import { Stream, OperatorFn } from "../types";

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
    if (!isStream(source)) {
      throw new Error("Source must be a Stream function");
    }
    const mapStream = createStream<any>();
    if (source.state >= StreamState.ACTIVE && ignoreInitial !== SKIP) {
      mapStream(mapFn(source.val));
    } else if (source.state === StreamState.PENDING) {
      mapStream.waiting = 1;
    }
    source.dependents.push([mapStream, mapFn]);
    mapStream.parents = source;
    return mapStream;
  };
}
