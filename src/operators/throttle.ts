import { Stream } from "../types/stream";
import { map } from "./map";
import { createStream } from "../stream";
import { clearFrame, addFrame } from "../utils/timers";

/**
 * Throttling Stream. Stores the latest received value during an animation
 * frame interval, and then once the duration passes, emits the most recent
 * stored value. Does not emit when there are no collected values.
 * Uses requestFrameAnimation for throttling.
 */
export const throttle = <T>(source: Stream<T>): Stream<T> => {
  const emit = createStream<T>();
  let latest: T;
  const frame = () => {
    emit(latest);
  };
  const collector = source.pipe(
    map((value) => {
      latest = value;
      addFrame(frame);
    })
  );
  emit.end.pipe(
    map(collector.end),
    map<boolean, void>(() => {
      clearFrame(frame);
    })
  );
  return emit;
};
