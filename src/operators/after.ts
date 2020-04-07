import { Stream, OperatorFn } from "../types/stream";
import { scan } from "./scan";
import { createStream } from "../stream";
import { addTimer, clearTimer } from "../utils/timers";
import { bufferValues } from "../utils/bufferValues";
import { subscribeEnd } from "../utils/subscriber";

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
  subscribeEnd(accumulator.end, emit.end, () => {
    clearTimer(clearStore);
    accumulator.val.length = 0;
  });
  return emit;
};
