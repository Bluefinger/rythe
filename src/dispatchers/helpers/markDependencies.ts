import { StreamState } from "../../constants";
import { Stream } from "../../types";

/**
 * Mark all Stream Dependencies recursively. Goes from newest dependency to old,
 * skipping those that have been marked already.
 */
export const markDependencies = (stream: Stream<any>): void => {
  const { state, dependents } = stream;
  const wasPending = state === StreamState.PENDING;
  stream.state = StreamState.CHANGING;
  for (let i = dependents.length; i--; ) {
    const dep = dependents[i][0];
    dep.waiting += wasPending ? 0 : 1;
    if (dep.state !== StreamState.CHANGING) {
      markDependencies(dep);
    }
  }
};
