import { StreamState } from "../constants";
import { Stream } from "../types";

const { ACTIVE, CHANGING, PENDING } = StreamState;

export const isReady = (stream: Stream<any>): boolean =>
  !stream.waiting || !(stream.waiting -= 1);

/** Mark a Stream as ACTIVE */
export const markActive = (stream: Stream<any>): void => {
  stream.state = ACTIVE;
};

/**
 * Mark all Stream Dependencies recursively. Goes from newest dependency to old,
 * skipping those that have been marked already.
 */
export const markAsChanging = (stream: Stream<any>): void => {
  const { state, dependents } = stream;
  stream.state = CHANGING;
  for (let i = dependents.length; i--; ) {
    const [dep] = dependents[i];
    if (state !== PENDING) dep.waiting += 1;
    if (dep.state !== CHANGING) {
      markAsChanging(dep);
    }
  }
};
