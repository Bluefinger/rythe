import { CellState } from "../../constants";
import { Cell } from "../../types";

/**
 * Mark all Cell Dependencies recursively. Goes from newest dependency to old,
 * skipping those that have been marked already.
 */
export const markDependencies = (cell: Cell<any>) => {
  cell.state = CellState.CHANGING;
  const deps = cell.dependents;
  for (let i = deps.length; i--; ) {
    const dep = deps[i][0];
    if (dep.state !== CellState.CHANGING) {
      markDependencies(dep);
    }
  }
};
