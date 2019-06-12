import { createStream } from "../stream";
import { Stream } from "../types";
import { map } from "../operators";
import { timers } from "../utils/timers";

export const every = (duration = 0): Stream<number> => {
  const stream = createStream<number>();
  timers.interval(stream, duration, Date.now());
  map<boolean, void>(() => timers.clear(stream))(stream.end);
  return stream;
};
