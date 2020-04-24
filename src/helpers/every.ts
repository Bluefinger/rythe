import { createStream } from "../stream";
import { Stream } from "../types/stream";
import { addInterval, clearTimer } from "../utils/timers";
import { subscribeSink } from "../utils/subscriber";

export const every = (duration = 0): Stream<number> => {
  const stream = createStream<number>();
  addInterval(stream, duration);
  subscribeSink(stream.end, () => clearTimer(stream));
  return stream;
};
