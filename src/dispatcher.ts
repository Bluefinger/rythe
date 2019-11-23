import { ACTIVE, CHANGING, PENDING } from "./constants";
import { Stream, Dispatcher, StreamState } from "./types";
import { END, SKIP } from "./signal";
import {
  addQueueItem,
  nextQueueItem,
  canExecute,
  startExecuting,
  stopExecuting
} from "./queue";

const incrementWait = <T>(
  stream: Stream<T>,
  parentState: StreamState
): void => {
  if (!(stream.immediate || parentState === PENDING)) {
    stream.waiting += 1;
  }
};

const isReady = <T>(stream: Stream<T>): boolean =>
  !(stream.waiting && --stream.waiting);

const markAsActive = <T>(stream: Stream<T>): void => {
  stream.state = ACTIVE;
  stream.updating = false;
};

/**
 * Mark all Stream Dependencies recursively. Goes from newest dependency to old,
 * skipping those that have been marked already.
 */
const markAsChanging = <T>(stream: Stream<T>): void => {
  const { state, dependents } = stream;
  stream.state = CHANGING;
  for (let i = dependents.length; i--; ) {
    const [dep] = dependents[i];
    if (dep.parents.length > 1) {
      incrementWait(dep, state);
    }
    if (dep.state !== CHANGING) {
      markAsChanging(dep);
    }
  }
};

const isUpdating = <T>(value: T) => value !== SKIP;

const pushUpdate = <T>(stream: Stream<T>, value: T): void => {
  markAsActive(stream);
  const { dependents } = stream;
  const updating = isUpdating(value);
  for (let i = dependents.length; i--; ) {
    const [dep, fn] = dependents[i];
    if (isReady(dep)) {
      const newValue = updating || dep.updating ? fn(value) : SKIP;
      switch (newValue) {
        case SKIP:
          pushUpdate(dep, SKIP);
          break;
        case END:
          pushUpdate(dep, SKIP);
          dep.end(true);
          break;
        default:
          dep.val = newValue;
          pushUpdate(dep, newValue);
      }
    } else if (updating) {
      dep.updating = true;
    }
  }
};

const shouldAddToQueue = (dep: Stream<any>) => {
  if (dep.state !== CHANGING) {
    if (dep.dependents.length) {
      addQueueItem(dep);
      dep.state = CHANGING;
    } else {
      markAsActive(dep);
    }
  }
};

const flatUpdate = <T>(stream: Stream<T>) => {
  const { dependents, val, state } = stream;
  markAsActive(stream);
  const updating = val !== SKIP;
  for (let i = dependents.length; i--; ) {
    const [dep, fn] = dependents[i];
    if (!dep.immediate && dep.waiting && state === PENDING) {
      dep.waiting--;
    }
    if (!dep.waiting) {
      const newValue = updating ? fn(val) : SKIP;
      switch (newValue) {
        case SKIP:
          break;
        case END:
          dep.end(true);
          break;
        default:
          dep.val = newValue;
          shouldAddToQueue(dep);
      }
    }
  }
};

export const dispatcher: Dispatcher = <T>(
  stream: Stream<T>,
  value: T
): void => {
  switch (value) {
    case END:
      stream.end(true);
    case SKIP:
      break;
    default:
      stream.val = value;
      if (stream.state) {
        startExecuting();
        addQueueItem(stream);
        while (canExecute()) {
          const queued = nextQueueItem();
          flatUpdate(queued);
        }
        stopExecuting();
      }
  }
};

/**
 * Dispatch Function for propagating Stream values across all dependencies.
 * Uses a recursive broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const rdispatcher: Dispatcher = <T>(
  stream: Stream<T>,
  value: T
): void => {
  switch (value) {
    case END:
      stream.end(true);
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
