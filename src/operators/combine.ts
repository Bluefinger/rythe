import { createStream, isStream } from "../stream";
import { StreamState, StreamError } from "../constants";
import { Stream, DependentTuple } from "../types";

const { PENDING } = StreamState;

/**
 * Combines many Stream sources into a single output.
 */
export function combine<T extends Stream<any>[], U>(
  combineFn: (...sources: T) => U,
  sources: T
): Stream<U> {
  const combinedStream = createStream<U>();
  combinedStream.parents = sources;
  const depTuple: DependentTuple<any, U> = [
    combinedStream,
    (): U => combineFn(...sources)
  ];

  // Many Parents to One Stream Subscription
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const { dependents, state } = source;
    if (!isStream(source)) {
      throw new Error(StreamError.SOURCE_ERROR);
    }
    dependents.push(depTuple);
    combinedStream.waiting += state === PENDING ? 1 : 0;
  }

  if (sources.length && !combinedStream.waiting) {
    combinedStream(combineFn(...sources));
  }

  return combinedStream;
}
