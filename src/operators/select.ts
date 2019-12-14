import { map } from "./map";
import { SKIP } from "../signal";
import { OperatorFn } from "../types/stream";

export function select<T extends any>(): OperatorFn<T, T>;
export function select<T extends any, K extends keyof T>(
  ...keys: [K]
): OperatorFn<T, NonNullable<T[K]>>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof T[K1]
>(...keys: [K1, K2]): OperatorFn<T, NonNullable<T[K1][K2]>>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof NonNullable<T[K1]>,
  K3 extends keyof NonNullable<NonNullable<T[K1]>[K2]>
>(
  ...keys: [K1, K2, K3]
): OperatorFn<T, NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof NonNullable<T[K1]>,
  K3 extends keyof NonNullable<NonNullable<T[K1]>[K2]>,
  K4 extends keyof NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>
>(
  ...keys: [K1, K2, K3, K4]
): OperatorFn<
  T,
  NonNullable<NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>[K4]>
>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof NonNullable<T[K1]>,
  K3 extends keyof NonNullable<NonNullable<T[K1]>[K2]>,
  K4 extends keyof NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>,
  K5 extends keyof NonNullable<
    NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>[K4]
  >
>(
  ...keys: [K1, K2, K3, K4, K5]
): OperatorFn<
  T,
  NonNullable<
    NonNullable<NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>[K4]>[K5]
  >
>;
export function select<
  T extends any = any,
  K extends (string | number | symbol)[] = []
>(...keys: K): OperatorFn<T, any>;

export function select<
  T extends any = any,
  K extends (string | number | symbol)[] = []
>(...keys: K) {
  return map<T>(obj => {
    let val: any = obj;
    for (let i = 0; i < keys.length; i++) {
      val = val[keys[i]] ?? SKIP;
      if (val === SKIP) break;
    }
    return val;
  });
}
