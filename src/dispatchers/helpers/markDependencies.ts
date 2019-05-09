import { CellState } from "../../constants";
import { Cell } from "../../types";

/**
 * Mark all Cell Dependencies recursively. Goes from newest dependency to old,
 * skipping those that have been marked already.
 */
export const markDependencies = (cell: Cell<any>) => {
  const deps = cell.dependents;
  for (let i = deps.length; i--; ) {
    const dep = deps[i][0];
    if (dep.state !== CellState.CHANGING) {
      dep.state = CellState.CHANGING;
      if (dep.dependents.length) {
        markDependencies(dep);
      }
    }
  }
};
