import { Stream } from "../types/stream";
import { map } from "./map";
import { createStream } from "../stream";
import { addMicroTask } from "../utils/timers";
import { subscribeEnd } from "../utils/subscriber";

/**
 * Defer Stream. Stores the latest received value during an event loop
 * execution cycle, and then once all other code has executed and before
 * returning to the browser event loop, it emits the most recent
 * stored value. Does not emit when there are no collected values.
 * Uses queueMicrotask for deferral. Microtasks cannot be cancelled once
 * queued.
 */
export const defer = <T>(source: Stream<T>): Stream<T> => {
  let latest: T;
  const emit = createStream<T>();
  const task = () => {
    if (emit.state) emit(latest);
  };
  source.pipe(
    map((value) => {
      latest = value;
      addMicroTask(task);
    })
  );
  subscribeEnd(emit.end, source.end);
  return emit;
};
