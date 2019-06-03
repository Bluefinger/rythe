import { Stream, DependentTuple, Dispatcher } from "../types";
import { isReady, markActive, markAsChanging } from "./dispatcherHelpers";
import { END, SKIP } from "../signal";

const pushUpdate = <T>(stream: Stream<T>, updating: boolean): void => {
  markActive(stream);
  const { dependents, val } = stream;
  if (dependents.length) {
    // Recursive, so it has to rely on hoisting.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    updateDependencies(val, dependents, updating);
  }
};

const updateDependencies = <T>(
  value: T,
  deps: DependentTuple<T, any>[],
  updating: boolean
): void => {
  for (let i = deps.length; i--; ) {
    const [dep, fn] = deps[i];
    if (isReady(dep)) {
      const newValue = updating || dep.updating ? fn(value) : SKIP;
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
      dep.updating = 0;
    } else if (updating) {
      dep.updating += 1;
    }
  }
};

/**
 * Dispatch Function for propagating Stream values across all dependencies.
 * Uses a recursive broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const recursiveDispatcher: Dispatcher = <T>(
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
