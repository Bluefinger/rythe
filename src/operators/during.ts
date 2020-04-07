import { Stream, OperatorFn } from "../types/stream";
import { scan } from "./scan";
import { createStream } from "../stream";
import { addInterval, clearTimer } from "../utils/timers";
import { bufferValues } from "../utils/bufferValues";
import { subscribeEnd } from "../utils/subscriber";

const emitValues = <T>(emit: Stream<T[]>, values: T[]) => {
  if (values.length) {
    emit(values.slice());
    values.length = 0;
  }
};

/**
 * Time-slicing Stream. Buffers all values during a set interval into an array,
 * and then once the duration passes, emits a copied array with the collected values
 * and resets the internal array. Does not emit when there are no collected values.
 */
export const during = <T>(duration: number): OperatorFn<T, T[]> => (
  source: Stream<T>
): Stream<T[]> => {
  const emit = createStream<T[]>();
  const accumulator = scan<T>(bufferValues, [])(source);
  const tick = () => emitValues(emit, accumulator());
  addInterval(tick, duration);
  subscribeEnd(accumulator.end, emit.end, () => {
    clearTimer(tick);
    accumulator.val.length = 0;
  });
  return emit;
};
