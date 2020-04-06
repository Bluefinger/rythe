import { Stream, OperatorFn } from "../types/stream";
import { scan } from "./scan";
import { map } from "./map";
import { createStream } from "../stream";
import { addTimer, clearTimer } from "../utils/timers";
import { bufferValues } from "../utils/bufferValues";

/**
 * Buffering Stream. Accumulates a series of stream events into an array, and
 * after a period of no updates, it then emits that list.
 */
export const after = <T>(duration: number): OperatorFn<T, T[]> => (
  source: Stream<T>
): Stream<T[]> => {
  const emit = createStream<T[]>();
  const clearStore = (emit: Stream<T[]>, values: T[]) => {
    emit(values.slice());
    values.length = 0;
  };
  const accumulator = scan<T>((stored, value) => {
    clearTimer(clearStore);
    addTimer(clearStore, duration, emit, stored);
    return bufferValues(stored, value);
  }, [])(source);
  emit.end.pipe(
    map(accumulator.end),
    map<boolean, void>(() => {
      clearTimer(clearStore);
      accumulator.val.length = 0;
    })
  );
  return emit;
};
