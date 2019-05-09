import { CellState } from "./constants";
import { SKIP } from "./signal";

export type OperatorFn<T, U> = (source: Cell<T>) => Cell<U>;

/**
 * A transformation function. Takes an input value and yields an output value.
 * Used for converting a parent Cell's value into a dependent Cell's value.
 */
export type CellFn<T, U> = (source: T) => U;

/**
 * Tuple for storing a dependent Cell and its value function.
 * The tuple cannot be mutated once set.
 */
export type DependentTuple<T, U> = readonly [Cell<U>, CellFn<T, U>];

/**
 * Cell Stream object. Receives values and pushes them to its dependencies,
 * or returns it's current value. Keeps track of its own state and can be
 * terminated or serialised into JSON.
 */
export interface Cell<T> {
  /**
   * Returns the Cell's current value.
   */
  (): T;
  /**
   * Assigns a new value to the Cell and broadcasts it to all its dependencies.
   */
  (value: T): this;
  /**
   * Current State of the Cell. Possible state values:
   * 0. CLOSED: The Cell is closed. It won't notify any dependents nor be updated by any parents.
   * 1. PENDING: The Cell is pending an update. It has not received any values yet.
   * 2. ACTIVE: The Cell has a value. No actions required to be taken.
   * 3. CHANGING: The Cell is about to change. It is about to receive a value and will update its dependencies.
   */
  state: CellState;
  /**
   * The Cell's current value. Mutating this property won't cause the Cell to update its
   * dependencies.
   */
  val: T;
  /**
   * A Cell for ending/completing the parent Cell. Causes all parents/dependents
   * subscriptions to be erased from the Cell, and sets its state to CLOSED.
   */
  end: Cell<boolean>;
  /**
   * An Array containing tuple values of Dependent Cells and their value functions.
   * The value functions transform the parent Cell's value to the Dependent Cell's
   * value type.
   */
  dependents: Array<DependentTuple<any, any>>;
  /**
   * The Parent Cell or Cells that the current Cell is subscribed to. If it not subscribed
   * to any other cells, it is null.
   */
  parents: Array<Cell<any>> | Cell<any> | null;
  /**
   * Map operator. Takes the current Cell and applies a function to yield a
   * new Cell of the map function's output type. Can ignore the initial value
   * from the source Cell.
   */
  map<U>(fn: (current: T) => U, ignoreInitial?: SKIP): Cell<U>;

  pipe(): Cell<T>;
  pipe<A>(fn1: OperatorFn<T, A>): Cell<A>;
  pipe<A, B>(fn1: OperatorFn<T, A>, fn2: OperatorFn<A, B>): OperatorFn<T, B>;
  pipe<A, B, C>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>
  ): Cell<C>;
  pipe<A, B, C, D>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>
  ): Cell<D>;
  pipe<A, B, C, D, E>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>,
    fn5: OperatorFn<D, E>
  ): Cell<E>;
  pipe<A, B, C, D, E, F>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>,
    fn5: OperatorFn<D, E>,
    fn6: OperatorFn<E, F>
  ): Cell<F>;
  pipe<A, B, C, D, E, F, G>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>,
    fn5: OperatorFn<D, E>,
    fn6: OperatorFn<E, F>,
    fn7: OperatorFn<F, G>
  ): Cell<G>;
  pipe<A, B, C, D, E, F, G, H>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>,
    fn5: OperatorFn<D, E>,
    fn6: OperatorFn<E, F>,
    fn7: OperatorFn<F, G>,
    fn8: OperatorFn<G, H>
  ): Cell<H>;
  pipe<A, B, C, D, E, F, G, H, I>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>,
    fn5: OperatorFn<D, E>,
    fn6: OperatorFn<E, F>,
    fn7: OperatorFn<F, G>,
    fn8: OperatorFn<G, H>,
    fn9: OperatorFn<H, I>
  ): Cell<I>;
  pipe<A, B, C, D, E, F, G, H, I>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>,
    fn5: OperatorFn<D, E>,
    fn6: OperatorFn<E, F>,
    fn7: OperatorFn<F, G>,
    fn8: OperatorFn<G, H>,
    fn9: OperatorFn<H, I>,
    ...fns: Array<OperatorFn<any, any>>
  ): Cell<any>;
  pipe<U>(...operators: Array<OperatorFn<any, any>>): Cell<U>;
  toJSON(): any;
}

/**
 * Signature definition for a Dispatcher function. Must receive a Cell and a value.
 */
export type Dispatcher = <T>(cell: Cell<T>, value: T) => void;
