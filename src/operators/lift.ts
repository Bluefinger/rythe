import { Stream, StreamTuple } from "../types/stream";
import { combine } from "./combine";

const unwrapValue = <V>({ val }: Stream<V>): V => val;

export function lift<T extends Stream<any>[], U>(
  liftFn: (...values: StreamTuple<T>) => U,
  ...sources: T
): Stream<U> {
  return combine<T, U>(
    (...streams) => liftFn(...(streams.map(unwrapValue) as StreamTuple<T>)),
    ...sources
  );
}
