import { createStream, isStream } from "../stream";
import { StreamState, StreamError } from "../constants";
import { Stream } from "../types";
import { subscriber } from "../utils/subscriber";

const { PENDING } = StreamState;

/**
 * Combines many Stream sources into a single output.
 */
export function combine<T extends Stream<any>[], U>(
  combineFn: (...sources: T) => U,
  ...sources: T
): Stream<U> {
  const combinedStream = createStream<U>();
  const subscribeFn = (): U => combineFn(...sources);

  // Many Parents to One Stream Subscription
  for (let i = sources.length; i--; ) {
    const source = sources[i];
    if (!isStream(source)) {
      throw new Error(StreamError.SOURCE_ERROR);
    }
    subscriber(combinedStream, source, subscribeFn);
    combinedStream.waiting += source.state === PENDING ? 1 : 0;
  }

  if (sources.length && !combinedStream.waiting) {
    combinedStream(combineFn(...sources));
  }

  return combinedStream;
}
