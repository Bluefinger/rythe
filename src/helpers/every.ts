import { createStream } from "../stream";
import { Stream } from "../types";
import { map } from "../operators";
import { addInterval, clearTimer } from "../utils/timers";

export const every = (duration = 0): Stream<number> => {
  const stream = createStream<number>();
  addInterval(stream, duration);
  map<boolean, void>(() => clearTimer(stream))(stream.end);
  return stream;
};
