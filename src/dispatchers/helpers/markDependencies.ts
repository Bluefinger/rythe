import { StreamState } from "../../constants";
import { Stream } from "../../types";

/**
 * Mark all Stream Dependencies recursively. Goes from newest dependency to old,
 * skipping those that have been marked already.
 */
export const markDependencies = (stream: Stream<any>): void => {
  stream.state = StreamState.CHANGING;
  const deps = stream.dependents;
  for (let i = deps.length; i--; ) {
    const dep = deps[i][0];
    if (dep.state !== StreamState.CHANGING) {
      markDependencies(dep);
    }
  }
};
