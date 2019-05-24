import { StreamState } from "../constants";
import { END, SKIP } from "../signal";
import { Stream } from "../types";

const { ACTIVE, CHANGING, PENDING } = StreamState;

export const isReady = (stream: Stream<any>): boolean => !--stream.waiting;

/** Mark a Stream as ACTIVE */
export const markActive = (stream: Stream<any>): void => {
  stream.state = ACTIVE;
};

/**
 * Mark all Stream Dependencies recursively. Goes from newest dependency to old,
 * skipping those that have been marked already.
 */
export const markDependencies = (stream: Stream<any>): void => {
  const { state, dependents } = stream;
  stream.state = CHANGING;
  for (let i = dependents.length; i--; ) {
    const [dep] = dependents[i];
    dep.waiting += state === PENDING ? 0 : 1;
    if (dep.state !== CHANGING) {
      markDependencies(dep);
    }
  }
};

/**
 * Checks the incoming value for END or SKIP signals, otherwise it updates the stream
 * value and returns true to initiate a broadcast.
 */
export const shouldApplyValue = <T>(stream: Stream<T>, value: T): boolean => {
  if (value === END) {
    stream.end(true);
  } else if (value !== SKIP) {
    stream.val = value;
    return true;
  }
  return false;
};
