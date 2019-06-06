import { createStream } from "../stream";
import { Stream } from "../types";
import { map } from "rythe/operators";

const timer = (stream: Stream<number>, duration: number, tick: number) => {
  const now = Date.now();
  stream(now);
  const target = tick + duration;
  const delta = target - now;
  return setTimeout(timer, delta, stream, duration, target);
};

export const every = (duration = 0): Stream<number> => {
  const stream = createStream<number>();
  const interval = timer(stream, duration, Date.now());
  map<boolean, void>(() => clearTimeout(interval))(stream.end);
  return stream;
};
