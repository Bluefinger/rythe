import { StreamState } from "./constants";

export type OperatorFn<T, U> = (source: Stream<T>) => Stream<U>;

/**
 * A transformation function. Takes an input value and yields an output value.
 * Used for converting a parent Stream's value into a dependent Stream's value.
 */
export type StreamFn<T, U> = (source: T) => U;

/**
 * Tuple for storing a dependent Stream and its value function.
 * The tuple cannot be mutated once set.
 */
export type DependentTuple<T, U> = readonly [Stream<U>, StreamFn<T, U>];

/**
 * Stream Stream object. Receives values and pushes them to its dependencies,
 * or returns it's current value. Keeps track of its own state and can be
 * terminated or serialised into JSON.
 */
export interface Stream<T> {
  /**
   * Returns the Stream's current value.
   */
  (): T;
  /**
   * Assigns a new value to the Stream and broadcasts it to all its dependencies.
   */
  (value: T): this;
  /**
   * Semphore for tracking when all the parent streams have resolved or changed so that
   * the current Stream can update.
   */
  waiting: number;
  /**
   * Current State of the Stream. Possible state values:
   * 0. CLOSED: The Stream is closed. It won't notify any dependents nor be updated by any parents.
   * 1. PENDING: The Stream is pending an update. It has not received any values yet.
   * 2. ACTIVE: The Stream has a value. No actions required to be taken.
   * 3. CHANGING: The Stream is about to change. It is about to receive a value and will update its dependencies.
   */
  state: StreamState;
  /**
   * The Stream's current value. Mutating this property won't cause the Stream to update its
   * dependencies.
   */
  val: T;
  /**
   * A Stream for ending/completing the parent Stream. Causes all parents/dependents
   * subscriptions to be erased from the Stream, and sets its state to CLOSED.
   */
  end: Stream<boolean>;
  /**
   * An Array containing tuple values of Dependent Streams and their value functions.
   * The value functions transform the parent Stream's value to the Dependent Stream's
   * value type.
   */
  dependents: DependentTuple<any, any>[];
  /**
   * The Parent Stream or Streams that the current Stream is subscribed to. If it not subscribed
   * to any other Streams, it is null.
   */
  parents: Stream<any>[] | Stream<any> | null;

  pipe(): Stream<T>;
  pipe<A>(fn1: OperatorFn<T, A>): Stream<A>;
  pipe<A, B>(fn1: OperatorFn<T, A>, fn2: OperatorFn<A, B>): Stream<B>;
  pipe<A, B, C>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>
  ): Stream<C>;
  pipe<A, B, C, D>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>
  ): Stream<D>;
  pipe<A, B, C, D, E>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>,
    fn5: OperatorFn<D, E>
  ): Stream<E>;
  pipe<A, B, C, D, E, F>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>,
    fn5: OperatorFn<D, E>,
    fn6: OperatorFn<E, F>
  ): Stream<F>;
  pipe<A, B, C, D, E, F, G>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>,
    fn5: OperatorFn<D, E>,
    fn6: OperatorFn<E, F>,
    fn7: OperatorFn<F, G>
  ): Stream<G>;
  pipe<A, B, C, D, E, F, G, H>(
    fn1: OperatorFn<T, A>,
    fn2: OperatorFn<A, B>,
    fn3: OperatorFn<B, C>,
    fn4: OperatorFn<C, D>,
    fn5: OperatorFn<D, E>,
    fn6: OperatorFn<E, F>,
    fn7: OperatorFn<F, G>,
    fn8: OperatorFn<G, H>
  ): Stream<H>;
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
  ): Stream<I>;
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
    ...fns: OperatorFn<any, any>[]
  ): Stream<any>;
  pipe<U>(...operators: OperatorFn<any, any>[]): Stream<U>;
  toJSON(): any;
}

/**
 * Signature definition for a Dispatcher function. Must receive a Stream and a value.
 * @internal
 */
export type Dispatcher = <T>(stream: Stream<T>, value: T) => void;

/**
 * Close Function interface. Returns itself to allow terse multilple invocations.
 */
export interface Closer {
  <T>(stream: Stream<T>): this;
}
