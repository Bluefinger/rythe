import { Stream, OperatorFn } from "../types";
import { StreamError } from "../constants";

const pipeFn = <T, U>(
  stream: Stream<any>,
  operatorFn: OperatorFn<T, U>
): Stream<U> => operatorFn(stream);

export const pipeFromArray = (
  operators: OperatorFn<any, any>[]
): OperatorFn<any, any> => {
  if (!operators.length) {
    throw new Error(StreamError.PIPE_ERROR);
  }
  if (operators.length === 1) {
    return operators[0];
  }
  return (source: Stream<any>): Stream<any> => operators.reduce(pipeFn, source);
};

export function pipe(): never;
export function pipe<T, A>(fn1: OperatorFn<T, A>): OperatorFn<T, A>;
export function pipe<T, A, B>(
  fn1: OperatorFn<T, A>,
  fn2: OperatorFn<A, B>
): OperatorFn<T, B>;
export function pipe<T, A, B, C>(
  fn1: OperatorFn<T, A>,
  fn2: OperatorFn<A, B>,
  fn3: OperatorFn<B, C>
): OperatorFn<T, C>;
export function pipe<T, A, B, C, D>(
  fn1: OperatorFn<T, A>,
  fn2: OperatorFn<A, B>,
  fn3: OperatorFn<B, C>,
  fn4: OperatorFn<C, D>
): OperatorFn<T, D>;
export function pipe<T, A, B, C, D, E>(
  fn1: OperatorFn<T, A>,
  fn2: OperatorFn<A, B>,
  fn3: OperatorFn<B, C>,
  fn4: OperatorFn<C, D>,
  fn5: OperatorFn<D, E>
): OperatorFn<T, E>;
export function pipe<T, A, B, C, D, E, F>(
  fn1: OperatorFn<T, A>,
  fn2: OperatorFn<A, B>,
  fn3: OperatorFn<B, C>,
  fn4: OperatorFn<C, D>,
  fn5: OperatorFn<D, E>,
  fn6: OperatorFn<E, F>
): OperatorFn<T, F>;
export function pipe<T, A, B, C, D, E, F, G>(
  fn1: OperatorFn<T, A>,
  fn2: OperatorFn<A, B>,
  fn3: OperatorFn<B, C>,
  fn4: OperatorFn<C, D>,
  fn5: OperatorFn<D, E>,
  fn6: OperatorFn<E, F>,
  fn7: OperatorFn<F, G>
): OperatorFn<T, G>;
export function pipe<T, A, B, C, D, E, F, G, H>(
  fn1: OperatorFn<T, A>,
  fn2: OperatorFn<A, B>,
  fn3: OperatorFn<B, C>,
  fn4: OperatorFn<C, D>,
  fn5: OperatorFn<D, E>,
  fn6: OperatorFn<E, F>,
  fn7: OperatorFn<F, G>,
  fn8: OperatorFn<G, H>
): OperatorFn<T, H>;
export function pipe<T, A, B, C, D, E, F, G, H, I>(
  fn1: OperatorFn<T, A>,
  fn2: OperatorFn<A, B>,
  fn3: OperatorFn<B, C>,
  fn4: OperatorFn<C, D>,
  fn5: OperatorFn<D, E>,
  fn6: OperatorFn<E, F>,
  fn7: OperatorFn<F, G>,
  fn8: OperatorFn<G, H>,
  fn9: OperatorFn<H, I>
): OperatorFn<T, I>;
export function pipe<T, A, B, C, D, E, F, G, H, I>(
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
): OperatorFn<T, {}>;

export function pipe(
  ...operators: OperatorFn<any, any>[]
): OperatorFn<any, any> {
  return pipeFromArray(operators);
}
