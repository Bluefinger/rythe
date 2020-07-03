import { Stream, OperatorFn } from "../types/stream";
import { filter } from "./filter";
import { makeUInt } from "../utils/makeUInt";

export function skip<T>(amount: number): OperatorFn<T, T> {
  let remaining = makeUInt(amount);
  return (source: Stream<T>): Stream<T> =>
    filter<T>(() => !(remaining ? remaining-- : remaining))(source);
}
