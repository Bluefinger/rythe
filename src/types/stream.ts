import { StreamState, CLOSED } from "../constants";

export type StreamValue<T> = T extends Stream<infer V> ? V : never;

export type StreamArray<T> = T extends (infer U)[] ? StreamValue<U> : never;

export type StreamTuple<F extends Stream<any>[]> = {
  [K in keyof F]: StreamValue<F[K]>;
};

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
   * Semaphore for tracking when all the parent streams have resolved or changed so that
   * the current Stream can update. Streams with waiting set to `-1` update immediately,
   * regardless of the state of the parent streams.
   * @internal
   */
  waiting: number;
  /**
   * Current State of the Stream. Possible state values:
   * * CLOSED   -> 0: The Stream is closed. It may still receive values but won't notify any dependents.
   * * PENDING  -> 1: The Stream is pending an update. It has not received any values yet.
   * * ACTIVE   -> 2: The Stream has a value. No actions required to be taken.
   * * CHANGING -> 3: The Stream is about to change. It is about to receive a value and will update its dependencies.
   * * WAITING  -> 4: The Stream is marked to receive an update, but is waiting for all parent streams to resolve first.
   */
  state: StreamState;
  /**
   * The Stream's current value. Mutating this property won't cause the Stream to update its
   * dependencies.
   * @internal
   */
  val: T;
  /**
   * A Stream for ending/completing the parent Stream. Causes all parents/dependents
   * subscriptions to be erased from the Stream, and sets its state to CLOSED.
   */
  end: EndStream;
  /**
   * An Array containing tuple values of Dependent Streams and their value functions.
   * The value functions transform the parent Stream's value to the Dependent Stream's
   * value type.
   * @internal
   */
  dependents: DependentTuple<any, any>[];
  /**
   * The Parent Streams that the current Stream is subscribed to. If it not subscribed
   * to any other Streams, it is empty.
   * @internal
   */
  parents: Stream<any>[];

  /* eslint-disable prettier/prettier */
  pipe(): Stream<T>;
  pipe<A>(...operators: [OperatorFn<T, A>]): Stream<A>;
  pipe<A, B>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>]): Stream<B>;
  pipe<A, B, C>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>]): Stream<C>;
  pipe<A, B, C, D>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>]): Stream<D>;
  pipe<A, B, C, D, E>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>]): Stream<E>;
  pipe<A, B, C, D, E, F>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>]): Stream<F>;
  pipe<A, B, C, D, E, F, G>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>]): Stream<G>;
  pipe<A, B, C, D, E, F, G, H>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>, OperatorFn<G, H>]): Stream<H>;
  pipe<A, B, C, D, E, F, G, H, I>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>, OperatorFn<G, H>, OperatorFn<H, I>]): Stream<I>;
  pipe<A, B, C, D, E, F, G, H, I>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>, OperatorFn<G, H>, OperatorFn<H, I>, ...OperatorFn<any, any>[]]): Stream<any>;
  /* eslint-enable prettier/prettier */
  toJSON(): any;
}

export interface EndStream extends Stream<boolean> {
  /**
   * Returns the Stream's current value.
   */
  (): boolean;
  /**
   * Assigns a new value to the Stream and broadcasts it to all its dependencies.
   */
  (value: boolean): boolean;
}

export interface SinkStream extends Stream<void> {
  (): void;
  (value: any): void;
  state: CLOSED;
  val: void;
  end: Stream<any>;
}
