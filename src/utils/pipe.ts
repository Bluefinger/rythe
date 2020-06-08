import { Stream, OperatorFn } from "../types/stream";
import { PIPE_ERROR } from "../errors";
import { SingleFn, First, Last } from "../types/utils";

const pipeFn = <T, U>(
  stream: Stream<any>,
  operatorFn: OperatorFn<T, U>
): Stream<U> => operatorFn(stream);

export const pipeFromArray = <Fns extends SingleFn[]>(
  operators: Fns
): SingleFn<any, any> => {
  if (!operators.length) {
    throw new Error(PIPE_ERROR);
  }
  if (operators.length === 1) {
    return operators[0];
  }
  return (source: First<Parameters<First<Fns>>>): ReturnType<Last<Fns>> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    operators.reduce(pipeFn, source);
};

/* eslint-disable prettier/prettier */
export function pipe(): never;
export function pipe<T>(...operators: [OperatorFn<T, T>]): OperatorFn<T, T>;
export function pipe<T, A>(...operators: [OperatorFn<T, A>]): OperatorFn<T, A>;
export function pipe<T, A, B>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>]): OperatorFn<T, B>;
export function pipe<T, A, B, C>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>]): OperatorFn<T, C>;
export function pipe<T, A, B, C, D>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>]): OperatorFn<T, D>;
export function pipe<T, A, B, C, D, E>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>]): OperatorFn<T, E>;
export function pipe<T, A, B, C, D, E, F>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>]): OperatorFn<T, F>;
export function pipe<T, A, B, C, D, E, F, G>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>]): OperatorFn<T, G>;
export function pipe<T, A, B, C, D, E, F, G, H>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>, OperatorFn<G, H>]): OperatorFn<T, H>;
export function pipe<T, A, B, C, D, E, F, G, H, I>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>, OperatorFn<G, H>, OperatorFn<H, I>]): OperatorFn<T, I>;
export function pipe<T, A, B, C, D, E, F, G, H, I>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>, OperatorFn<G, H>, OperatorFn<H, I>, ...OperatorFn<any, any>[]]): OperatorFn<T, any>;
/* eslint-enable prettier/prettier */

export function pipe(
  ...operators: OperatorFn<any, any>[]
): OperatorFn<any, any> {
  return pipeFromArray(operators);
}
