import { Stream, StreamValuesAsTuple } from "../types";
import { combine } from "./combine";

const unwrapValue = <V>({ val }: Stream<V>): V => val;

export function lift<T extends Stream<any>[], U>(
  liftFn: (...values: StreamValuesAsTuple<T>) => U,
  ...sources: T
) {
  return combine<T, U>(
    (...streams) => liftFn(...(streams as any).map(unwrapValue)),
    ...sources
  );
}
