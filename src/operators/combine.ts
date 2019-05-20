import { createCell, isCell } from "../cell";
import { CellState } from "../constants";
import { SKIP } from "../signal";
import { Cell, DependentTuple } from "../types";

const areCellsReady = <T>(source: Cell<T>): boolean =>
  source.state === CellState.ACTIVE || source.state === CellState.CLOSED;

function applyDepTuple<T, U>(
  this: DependentTuple<T, U>,
  source: Cell<T>
): void {
  source.dependents.push(this);
}

/**
 * Combines many Cell sources into a single output.
 */
export function combine<T extends Cell<any>[], U>(
  combineFn: (...sources: T) => U,
  sources: T
): Cell<U> {
  if (!sources.every(isCell)) {
    throw new Error("All sources must be a Cell object");
  }
  const combinedCell = createCell<U>();
  combinedCell.parents = sources;
  const depTuple: DependentTuple<any, U> = [
    combinedCell,
    (): U => (sources.every(areCellsReady) ? combineFn(...sources) : SKIP)
  ];

  // Many Parents to One Cell Subscription
  sources.forEach(applyDepTuple, depTuple);

  if (sources.length && sources.every(areCellsReady)) {
    combinedCell(combineFn(...sources));
  }

  return combinedCell;
}
