import { ACTIVE, CHANGING, PENDING, WAITING, StreamState } from "./constants";
import { Stream, DependentTuple } from "./types/stream";
import { Dispatcher } from "./types/internal";
import { END, SKIP, emitSKIP } from "./signal";

const isReady = <T>(stream: Stream<T>): boolean =>
  !(stream.waiting > 0 && --stream.waiting);

const isImmediateStream = (waiting: number): boolean => waiting < 0;

const isStreamUpdating = <T>(value: T) => value !== SKIP;

const markAsActive = <T>(stream: Stream<T>): void => {
  stream.state = ACTIVE;
};

const markAsWaiting = <T>(stream: Stream<T>): void => {
  stream.state = WAITING;
};

const canDepUpdate = (
  parentUpdating: boolean,
  depState: StreamState
): boolean => parentUpdating || depState === WAITING;

/**
 * Mark all Stream Dependencies recursively. Goes from newest dependency to old,
 * skipping those that have been marked already.
 */
const markAsChanging = <T>(stream: Stream<T>): void => {
  const { state: previousState, dependents } = stream;
  stream.state = CHANGING;
  for (let i = dependents.length; i--; ) {
    const [dep] = dependents[i];
    if (
      dep.parents.length > 1 &&
      !(isImmediateStream(stream.waiting) || previousState === PENDING)
    ) {
      dep.waiting += 1;
    }
    if (dep.state < CHANGING) {
      markAsChanging(dep);
    }
  }
};

const pushUpdate = <T>(stream: Stream<T>, value: T): void => {
  markAsActive(stream);
  const { dependents } = stream;
  const updating = isStreamUpdating(value);
  for (let i = dependents.length; i--; ) {
    updateDep(dependents[i], value, updating);
  }
};

const updateDep = <T, U>(
  [dep, fn]: DependentTuple<T, U>,
  value: T,
  updating: boolean
) => {
  if (isReady(dep)) {
    const newValue: U = canDepUpdate(updating, dep.state)
      ? fn(value)
      : emitSKIP();
    switch (newValue) {
      case SKIP:
        pushUpdate(dep, emitSKIP());
        break;
      case END:
        pushUpdate(dep, emitSKIP());
        dep.end(true);
        break;
      default:
        dep.val = newValue;
        pushUpdate(dep, newValue);
    }
  } else if (updating) {
    markAsWaiting(dep);
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
    case END:
      stream.end(true);
    // fallthrough
    case SKIP:
      break;
    default:
      stream.val = value;
      if (stream.state) {
        markAsChanging(stream);
        pushUpdate(stream, value);
      }
  }
};
