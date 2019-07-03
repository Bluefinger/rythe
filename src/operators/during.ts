import { Stream, OperatorFn } from "../types";
import { scan } from "./scan";
import { map } from "./map";
import { createStream } from "../stream";
import { addInterval, clearTimer } from "../utils/timers";

const emitValues = <T>(emit: Stream<T[]>, values: T[]) => {
  if (values.length) {
    emit(values.slice());
    values.length = 0;
  }
};

const bufferValues = <T>(stored: T[], value: T): T[] => {
  stored.push(value);
  return stored;
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
  emit.end.pipe(
    map(accumulator.end),
    map(() => {
      clearTimer(tick);
      accumulator.val.length = 0;
    })
  );
  return emit;
};
