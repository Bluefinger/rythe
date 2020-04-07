import { Stream, StreamArray } from "../types/stream";
import { createStream, isStream } from "../stream";
import { ACTIVE } from "../constants";
import { SOURCE_ERROR } from "../errors";
import { subscriber, subscribeEnd } from "../utils/subscriber";

const passthrough = <T>(n: T): T => n;

export function merge<T extends Stream<any>[]>(
  ...sources: T
): Stream<StreamArray<T>> {
  const merged = createStream<StreamArray<T>>();

  let immediate;
  merged.waiting = -1;

  for (let i = sources.length; i--; ) {
    const source = sources[i];
    if (!isStream(source)) {
      throw new Error(SOURCE_ERROR);
    }
    subscriber(merged, source, passthrough);
    subscribeEnd(merged.end, source.end);
    if (!immediate && source.state === ACTIVE) {
      immediate = source;
    }
  }

  if (immediate) {
    merged(immediate.val);
  }

  return merged;
}
