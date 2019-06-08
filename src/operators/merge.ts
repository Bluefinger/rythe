import { Stream, StreamValuesFromArray } from "../types";
import { createStream, isStream } from "../stream";
import { StreamState, StreamError } from "../constants";
import { subscriber } from "../utils/subscriber";
import { killFn } from "../utils/killFn";

const { ACTIVE } = StreamState;

const passthrough = <T>(n: T): T => n;

export function merge<T extends Stream<any>[]>(
  ...sources: T
): Stream<StreamValuesFromArray<T>> {
  const merged = createStream<StreamValuesFromArray<T>>();

  let immediate;
  merged.immediate = true;

  for (let i = sources.length; i--; ) {
    const source = sources[i];
    if (!isStream(source)) {
      throw new Error(StreamError.SOURCE_ERROR);
    }
    subscriber(merged, source, passthrough);
    subscriber(merged.end, source.end, killFn);
    if (!immediate && source.state === ACTIVE) {
      immediate = source;
    }
  }

  if (immediate) {
    merged(immediate.val);
  }

  return merged;
}
