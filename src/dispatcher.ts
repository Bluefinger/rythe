import { StreamState } from "./constants";
import { Stream, Dispatcher } from "./types";
import { END, SKIP } from "./signal";

const { ACTIVE, CHANGING, PENDING } = StreamState;

const shouldIncrementWait = (
  immediate: true | undefined,
  state: StreamState
): boolean => !(immediate || state === PENDING);

const isReady = (stream: Stream<any>): boolean =>
  !(stream.waiting && --stream.waiting);

/** Mark a Stream as ACTIVE */
const markAsActive = (stream: Stream<any>): void => {
  stream.state = ACTIVE;
};

/**
 * Mark all Stream Dependencies recursively. Goes from newest dependency to old,
 * skipping those that have been marked already.
 */
const markAsChanging = (stream: Stream<any>): void => {
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

const pushUpdate = <T>(stream: Stream<T>, updating: boolean): void => {
  markAsActive(stream);
  const { dependents, val } = stream;
  for (let i = dependents.length; i--; ) {
    const [dep, fn] = dependents[i];
    if (isReady(dep)) {
      const newValue = updating || dep.updating ? fn(val) : SKIP;
      switch (newValue) {
        case SKIP:
          pushUpdate(dep, false);
          break;
        case END:
          pushUpdate(dep, false);
          dep.end(true);
          break;
        default:
          dep.val = newValue;
          pushUpdate(dep, true);
      }
      dep.updating = false;
    } else if (updating) {
      dep.updating = true;
    }
  }
};

/**
 * Dispatch Function for propagating Stream values across all dependencies.
 * Uses a recursive broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const dispatcher: Dispatcher = <T>(
  stream: Stream<T>,
  value: T
): void => {
  switch (value) {
    case SKIP:
      break;
    case END:
      stream.end(true);
      break;
    default:
      stream.val = value;
      if (stream.state) {
        markAsChanging(stream);
        pushUpdate(stream, true);
      }
  }
};
