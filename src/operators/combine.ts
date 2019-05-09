import { createCell, isCell } from "../cell";
import { CellState } from "../constants";
import { SKIP } from "../signal";
import { Cell, DependentTuple } from "../types";

const areCellsReady = (source: Cell<any>) =>
  source.state === CellState.ACTIVE || source.state === CellState.CLOSED;

function applyDepTuple(this: DependentTuple<any, any>, source: Cell<any>) {
  source.dependents.push(this);
}

export function combine<A, U>(
  combineFn: (...sources: [Cell<A>]) => U,
  sources: [Cell<A>]
): Cell<U>;
export function combine<A, B, U>(
  combineFn: (...sources: [Cell<A>, Cell<B>]) => U,
  sources: [Cell<A>, Cell<B>]
): Cell<U>;
export function combine<A, B, C, U>(
  combineFn: (...sources: [Cell<A>, Cell<B>, Cell<C>]) => U,
  sources: [Cell<A>, Cell<B>, Cell<C>]
): Cell<U>;
export function combine<A, B, C, D, U>(
  combineFn: (...sources: [Cell<A>, Cell<B>, Cell<C>, Cell<D>]) => U,
  sources: [Cell<A>, Cell<B>, Cell<C>, Cell<D>]
): Cell<U>;
export function combine<A, B, C, D, E, U>(
  combineFn: (...sources: [Cell<A>, Cell<B>, Cell<C>, Cell<D>, Cell<E>]) => U,
  sources: [Cell<A>, Cell<B>, Cell<C>, Cell<D>, Cell<E>]
): Cell<U>;
export function combine<A, B, C, D, E, F, U>(
  combineFn: (
    ...sources: [Cell<A>, Cell<B>, Cell<C>, Cell<D>, Cell<E>, Cell<F>]
  ) => U,
  sources: [Cell<A>, Cell<B>, Cell<C>, Cell<D>, Cell<E>, Cell<F>]
): Cell<U>;
export function combine<A, B, C, D, E, F, G, U>(
  combineFn: (
    ...sources: [Cell<A>, Cell<B>, Cell<C>, Cell<D>, Cell<E>, Cell<F>, Cell<G>]
  ) => U,
  sources: [Cell<A>, Cell<B>, Cell<C>, Cell<D>, Cell<E>, Cell<F>, Cell<G>]
): Cell<U>;
export function combine<A, U>(
  combineFn: (...sources: Array<Cell<A>>) => U,
  sources: Array<Cell<A>>
): Cell<U>;
export function combine<U>(
  combineFn: (...sources: Array<Cell<any>>) => U,
  sources: Array<Cell<any>>
): Cell<U>;

/**
 * Combines many Cell sources into a single output.
 */
export function combine(
  combineFn: (...sources: Array<Cell<any>>) => any,
  sources: Array<Cell<any>>
): Cell<any> {
  if (!sources.every(isCell)) {
    throw new Error("All sources must be a Cell object");
  }
  const combinedCell = createCell<any>();
  combinedCell.parents = sources;
  const depTuple: DependentTuple<any, any> = [
    combinedCell,
    () => (sources.every(areCellsReady) ? combineFn(...sources) : SKIP)
  ];

  // Many Parents to One Cell Subscription
  sources.forEach(applyDepTuple, depTuple);

  if (sources.length && sources.every(areCellsReady)) {
    combinedCell(combineFn(...sources));
  }

  return combinedCell;
}
