import { Stream, StreamFn, EndStream } from "../types/stream";
import { sink } from "../stream";

export const subscriber = <T, U>(
  stream: Stream<U>,
  parent: Stream<T>,
  subscribeFn: StreamFn<T, U>
): Stream<U> => {
  parent.dependents.push([stream, subscribeFn]);
  if (stream.state) stream.parents.push(parent);
  return stream;
};

export const subscribeEnd = (
  stream: EndStream,
  parent: EndStream,
  cleanupFn?: StreamFn<boolean, any>
): EndStream => {
  subscriber(sink, parent, stream);
  if (cleanupFn) subscriber(sink, stream, cleanupFn);
  return stream;
};
