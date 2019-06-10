import { SKIP } from "../signal";
import { Stream, OperatorFn } from "../types";
import { map } from "./map";
import { makeUInt } from "../utils/makeUInt";

export function skip<T>(amount: number): OperatorFn<T, T> {
  let remaining = makeUInt(amount);
  return (source: Stream<T>): Stream<T> =>
    map<T>(
      (value): T => {
        if (remaining) {
          --remaining;
          return SKIP;
        }
        return value;
      }
    )(source);
}
