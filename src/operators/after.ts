import { Stream, OperatorFn } from "../types";
import { scan } from "./scan";
import { map } from "./map";
import { createStream } from "../stream";
import { addTimer, clearTimer } from "../utils/timers";

/**
 * Buffering Stream. Accumulates a series of stream events into an array, and
 * after a period of no updates, it then emits that list.
 */
export const after = <T>(duration: number): OperatorFn<T, T[]> => (
  source: Stream<T>
): Stream<T[]> => {
  const emit = createStream<T[]>();
  const clearStore = (values: T[]) => {
    emit(values.slice());
    values.length = 0;
  };
  const accumulator = scan<T>(
    (stored, value) => {
      stored.push(value);
      clearTimer(clearStore);
      addTimer(clearStore, duration, stored);
      return stored;
    },
    [] as T[]
  )(source);
  emit.end.pipe(
    map(accumulator.end),
    map(() => {
      clearTimer(clearStore);
      accumulator.val.length = 0;
    })
  );
  return emit;
};
