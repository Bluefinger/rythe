import { Stream, StreamTuple } from "../types/stream";
import { combine } from "./combine";

const unwrapValue = <V>({ val }: Stream<V>): V => val;

export function lift<T extends Stream<any>[], U>(
  liftFn: (...values: StreamTuple<T>) => U,
  ...sources: T
): Stream<U> {
  return combine<T, U>(
    (...streams) =>
      // Spread type inference is borked in 3.9 for this use-case
      // .apply() is the workaround but eslint hates that
      // eslint-disable-next-line prefer-spread
      liftFn.apply(undefined, streams.map(unwrapValue) as StreamTuple<T>),
    ...sources
  );
}
