import { createStream, isStream } from "../stream";
import { StreamState, StreamError } from "../constants";
import { Stream, DependentTuple } from "../types";

const { PENDING } = StreamState;

function applyDepTuple(
  this: DependentTuple<any, any>,
  source: Stream<any>
): void {
  const { dependents, state } = source;
  const [combinedStream] = this;
  if (!isStream(source)) {
    throw new Error(StreamError.SOURCE_ERROR);
  }
  dependents.push(this);
  combinedStream.waiting += state === PENDING ? 1 : 0;
}

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
  sources.forEach(applyDepTuple, depTuple);

  if (sources.length && !combinedStream.waiting) {
    combinedStream(combineFn(...sources));
  }

  return combinedStream;
}
