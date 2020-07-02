import { Stream, ImmediateStream, StreamArray } from "../types/stream";
import { createImmediateStream, isStream } from "../stream";
import { ACTIVE } from "../constants";
import { SOURCE_ERROR } from "../errors";
import { subscriber, subscribeEnd } from "../utils/subscriber";

const passthrough = <T>(n: T): T => n;

export function merge<T extends Stream<any>[]>(
  ...sources: T
): ImmediateStream<StreamArray<T>> {
  const merged = createImmediateStream<StreamArray<T>>();

  let immediate;

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
    merged(immediate());
  }

  return merged;
}
