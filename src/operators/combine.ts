import { createStream, isStream } from "../stream";
import { StreamState } from "../constants";
import { Stream, DependentTuple } from "../types";

function applyDepTuple(
  this: DependentTuple<any, any>,
  source: Stream<any>
): void {
  if (!isStream(source)) {
    throw new Error("All sources must be a Stream function");
  }
  source.dependents.push(this);
  this[0].waiting += source.state === StreamState.PENDING ? 1 : 0;
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
