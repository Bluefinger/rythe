import { createStream, isStream } from "../stream";
import { StreamState } from "../constants";
import { SKIP } from "../signal";
import { Stream, DependentTuple } from "../types";

const areStreamsReady = <T>(source: Stream<T>): boolean =>
  source.state === StreamState.ACTIVE || source.state === StreamState.CLOSED;

function applyDepTuple<T, U>(
  this: DependentTuple<T, U>,
  source: Stream<T>
): void {
  source.dependents.push(this);
}

/**
 * Combines many Stream sources into a single output.
 */
export function combine<T extends Stream<any>[], U>(
  combineFn: (...sources: T) => U,
  sources: T
): Stream<U> {
  if (!sources.every(isStream)) {
    throw new Error("All sources must be a Stream object");
  }
  const combinedStream = createStream<U>();
  combinedStream.parents = sources;
  const depTuple: DependentTuple<any, U> = [
    combinedStream,
    (): U => (sources.every(areStreamsReady) ? combineFn(...sources) : SKIP)
  ];

  // Many Parents to One Stream Subscription
  sources.forEach(applyDepTuple, depTuple);

  if (sources.length && sources.every(areStreamsReady)) {
    combinedStream(combineFn(...sources));
  }

  return combinedStream;
}
