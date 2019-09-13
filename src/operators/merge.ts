import { Stream, StreamValuesAsArray } from "../types";
import { createStream, isStream } from "../stream";
import { ACTIVE } from "../constants";
import { SOURCE_ERROR } from "../errors";
import { subscriber } from "../utils/subscriber";
import { map } from "./map";

const passthrough = <T>(n: T): T => n;

export function merge<T extends Stream<any>[]>(
  ...sources: T
): Stream<StreamValuesAsArray<T>> {
  const merged = createStream<StreamValuesAsArray<T>>();

  let immediate;
  merged.immediate = true;

  for (let i = sources.length; i--; ) {
    const source = sources[i];
    if (!isStream(source)) {
      throw new Error(SOURCE_ERROR);
    }
    subscriber(merged, source, passthrough);
    map(merged.end)(source.end);
    if (!immediate && source.state === ACTIVE) {
      immediate = source;
    }
  }

  if (immediate) {
    merged(immediate.val);
  }

  return merged;
}
