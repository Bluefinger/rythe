import { StreamState } from "../constants";
import { Stream } from "../types";

const { ACTIVE, CHANGING, PENDING } = StreamState;

const shouldIncrementWait = (
  immediate: true | undefined,
  state: StreamState
): boolean => !(immediate || state === PENDING);

export const isReady = (stream: Stream<any>): boolean =>
  !(stream.waiting && --stream.waiting);

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
    if (dep.parents.length > 1 && shouldIncrementWait(dep.immediate, state)) {
      dep.waiting += 1;
    }
    if (dep.state !== CHANGING) {
      markAsChanging(dep);
    }
  }
};
