export type Tail<T extends any[]> = ((...t: T) => any) extends (
  _: any,
  ...tail: infer U
) => any
  ? U
  : [];
export type Length<T extends any[]> = T["length"];
export type First<T extends any[]> = T[0];
export type Last<T extends any[]> = T[Length<Tail<T>>];
export type SingleFn<P extends any = any, R extends any = any> = (arg: P) => R;
export type Pos<I extends any[]> = Length<I>;
export type Prepend<E, T extends any[]> = ((
  head: E,
  ...args: T
) => any) extends (...args: infer U) => any
  ? U
  : T;
export type Next<I extends any[]> = Prepend<any, I>;
export type Prev<I extends any[]> = Tail<I>;
export type Cast<T, U> = T extends U ? T : U;

export type Iterator<
  Index extends number = 0,
  From extends any[] = [],
  I extends any[] = []
> = {
  0: Iterator<Index, Next<From>, Next<I>>;
  1: From;
}[Pos<I> extends Index ? 1 : 0];

type IteratorOfMap = {
  _: never;
  "0": Iterator<0>;
  "1": Next<IteratorOfMap["0"]>; // Take previous and add
  "2": Next<IteratorOfMap["1"]>;
  "3": Next<IteratorOfMap["2"]>;
  "4": Next<IteratorOfMap["3"]>;
  "5": Next<IteratorOfMap["4"]>;
  "6": Next<IteratorOfMap["5"]>;
  "7": Next<IteratorOfMap["6"]>;
  "8": Next<IteratorOfMap["7"]>;
  "9": Next<IteratorOfMap["8"]>;

  "10": Next<IteratorOfMap["9"]>;
  "11": Next<IteratorOfMap["10"]>;
  "12": Next<IteratorOfMap["11"]>;
  "13": Next<IteratorOfMap["12"]>;
  "14": Next<IteratorOfMap["13"]>;
  "15": Next<IteratorOfMap["14"]>;
  "16": Next<IteratorOfMap["15"]>;
  "17": Next<IteratorOfMap["16"]>;
  "18": Next<IteratorOfMap["17"]>;
  "19": Next<IteratorOfMap["18"]>;

  "20": Next<IteratorOfMap["19"]>;
  "21": Next<IteratorOfMap["20"]>;
  "22": Next<IteratorOfMap["21"]>;
  "23": Next<IteratorOfMap["22"]>;
  "24": Next<IteratorOfMap["23"]>;
  "25": Next<IteratorOfMap["24"]>;
  "26": Next<IteratorOfMap["25"]>;
  "27": Next<IteratorOfMap["26"]>;
  "28": Next<IteratorOfMap["27"]>;
  "29": Next<IteratorOfMap["28"]>;

  "30": Next<IteratorOfMap["29"]>;
  "31": Next<IteratorOfMap["30"]>;
  "32": Next<IteratorOfMap["31"]>;
  "33": Next<IteratorOfMap["32"]>;
  "34": Next<IteratorOfMap["33"]>;
  "35": Next<IteratorOfMap["34"]>;
  "36": Next<IteratorOfMap["35"]>;
  "37": Next<IteratorOfMap["36"]>;
  "38": Next<IteratorOfMap["37"]>;
  "39": Next<IteratorOfMap["38"]>; // [any x 38]

  "40": Next<IteratorOfMap["39"]>;
  "41": Next<IteratorOfMap["40"]>;
  "42": Next<IteratorOfMap["41"]>;
  "43": Next<IteratorOfMap["42"]>;
  "44": Next<IteratorOfMap["43"]>;
  "45": Next<IteratorOfMap["44"]>;
  "46": Next<IteratorOfMap["45"]>;
  "47": Next<IteratorOfMap["46"]>;
  "48": Next<IteratorOfMap["47"]>;
  "49": Next<IteratorOfMap["48"]>; // [any x 49]
};

export type Key = string | number | symbol;

export type IteratorOf<
  Index extends Key
> = IteratorOfMap[Index extends keyof IteratorOfMap ? Index : "_"];

export type Piper<Fns extends SingleFn[]> = {
  [K in keyof Fns]: PipeFn<Fns, K>;
};

export type PipeFn<Fns extends SingleFn[], K extends keyof Fns> = K extends 0
  ? Fns[K]
  : (
      arg: ReturnType<Fns[Pos<Prev<IteratorOf<K>>>]>
    ) => ReturnType<Fns[Pos<IteratorOf<K>>]>;

export type DeepSearch<T extends any, K extends Key[]> = {
  next: First<K> extends keyof T
    ? DeepSearch<NonNullable<T[First<K>]>, Tail<K>>
    : never;
  done: T;
}[Length<K> extends 0 ? "done" : "next"];
