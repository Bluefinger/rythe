import { Stream } from "../types";
import { createStream, isStream } from "../stream";
import { subscriber } from "../utils/subscriber";
import { SOURCE_ERROR } from "../errors";
import { map } from "./map";

export function scanMerge<T>(
  initialValue: T,
  ...pairs: [Stream<T>, (acc: T, value: T) => T][]
): Stream<T>;
export function scanMerge<T>(
  initialValue: T[],
  ...pairs: [Stream<T>, (acc: T[], value: T) => T[]][]
): Stream<T[]>;
export function scanMerge<T, U>(
  initialValue: U,
  ...pairs: [Stream<T>, (acc: U, value: T) => U][]
): Stream<U>;

export function scanMerge<T, U>(
  initialValue: U,
  ...pairs: [Stream<T>, (acc: U, value: T) => U][]
): Stream<U> {
  let acc = initialValue;
  const merged = createStream<U>();
  merged.immediate = true;
  for (let i = pairs.length; i--; ) {
    const [source, sourceFn] = pairs[i];
    if (!isStream(source)) {
      throw new Error(SOURCE_ERROR);
    }
    const subscribeFn = (val: T): U => (acc = sourceFn(acc, val));
    subscriber(merged, source, subscribeFn);
    map(merged.end)(source.end);
  }
  return merged(acc);
}
