import { createStream } from "../stream";
import { Stream } from "../types/stream";
import { map } from "../operators/map";
import { EventEmitter } from "events";

export const fromNodeEvent = <T extends any>(
  target: EventEmitter,
  event: string
): Stream<T> => {
  const eventStream = createStream<T>();

  target.on(event, eventStream);
  map<boolean, any>(() => target.off(event, eventStream))(eventStream.end);

  return eventStream;
};
