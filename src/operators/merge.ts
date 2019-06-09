import { Stream, StreamValuesFromArray } from "../types";
import { createStream, isStream } from "../stream";
import { StreamState, StreamError } from "../constants";
import { subscriber } from "../utils/subscriber";
import { kill } from "../utils/kill";

const { ACTIVE } = StreamState;

const passthrough = <T>(n: T): T => n;

export function merge<
  T extends Stream<any>[],
  U extends StreamValuesFromArray<T>
>(...sources: T): Stream<U> {
  const merged = createStream<U>();

  let immediate;
  merged.immediate = true;

  for (let i = sources.length; i--; ) {
    const source = sources[i];
    if (!isStream(source)) {
      throw new Error(StreamError.SOURCE_ERROR);
    }
    subscriber(merged, source, passthrough);
    subscriber(merged.end, source.end, kill);
    if (!immediate && source.state === ACTIVE) {
      immediate = source;
    }
  }

  if (immediate) {
    merged(immediate.val);
  }

  return merged;
}
