import { Stream, ImmediateStream } from "../types/stream";
import { createImmediateStream, isStream } from "../stream";
import { subscriber, subscribeEnd } from "../utils/subscriber";
import { SOURCE_ERROR } from "../errors";

export function scanMerge<T>(
  initialValue: T,
  ...pairs: [Stream<T>, (acc: T, value: T) => T][]
): ImmediateStream<T>;
export function scanMerge<T>(
  initialValue: T[],
  ...pairs: [Stream<T>, (acc: T[], value: T) => T[]][]
): ImmediateStream<T[]>;
export function scanMerge<T, U>(
  initialValue: U,
  ...pairs: [Stream<T>, (acc: U, value: T) => U][]
): ImmediateStream<U>;

export function scanMerge<T, U>(
  initialValue: U,
  ...pairs: [Stream<T>, (acc: U, value: T) => U][]
): ImmediateStream<U> {
  let acc = initialValue;
  const merged = createImmediateStream<U>();
  for (let i = pairs.length; i--; ) {
    const [source, sourceFn] = pairs[i];
    if (!isStream(source)) {
      throw new Error(SOURCE_ERROR);
    }
    const subscribeFn = (val: T): U => (acc = sourceFn(acc, val));
    subscriber(merged, source, subscribeFn);
    subscribeEnd(merged.end, source.end);
  }
  return merged(acc);
}
