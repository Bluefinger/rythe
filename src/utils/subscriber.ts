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

export const subscribeSink = <T>(
  stream: Stream<T>,
  subscribeFn: StreamFn<T, any>
) => subscriber(sink, stream, subscribeFn);

export const subscribeEnd = (
  stream: EndStream,
  parent: EndStream,
  cleanupFn?: StreamFn<boolean, any>
): EndStream => {
  subscribeSink(parent, stream);
  if (cleanupFn) subscribeSink(stream, cleanupFn);
  return stream;
};
