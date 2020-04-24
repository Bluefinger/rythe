import { createStream } from "../stream";
import { Stream } from "../types/stream";
import { EventEmitter } from "events";
import { subscribeSink } from "../utils/subscriber";

export const fromNodeEvent = <T extends any>(
  target: EventEmitter,
  event: string
): Stream<T> => {
  const eventStream = createStream<T>();

  target.on(event, eventStream);
  subscribeSink(eventStream.end, () => target.off(event, eventStream));

  return eventStream;
};
