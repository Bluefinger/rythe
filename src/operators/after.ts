import { Stream, OperatorFn } from "../types";
import { scan } from "./scan";
import { map } from "./map";
import { createStream } from "../stream";
import { timers } from "../utils/timers";

const clearStore = <T>(values: T[], emit: Stream<T[]>) => {
  emit(values.slice());
  values.length = 0;
};

/**
 * Buffering Stream. Accumulates a series of stream events into an array, and
 * after a period of no updates, it then emits that list.
 */
export const after = <T>(duration: number): OperatorFn<T, T[]> => (
  source: Stream<T>
): Stream<T[]> => {
  const emit = createStream<T[]>();
  const accumulator = scan<T>(
    (stored, value) => {
      stored.push(value);
      timers.clear(emit);
      timers.add(emit, setTimeout(clearStore, duration, stored, emit));
      return stored;
    },
    [] as T[]
  )(source);
  emit.end.pipe(
    map(accumulator.end),
    map(() => {
      timers.clear(emit);
      accumulator.val.length = 0;
    })
  );
  return emit;
};
