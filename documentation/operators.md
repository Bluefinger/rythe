# Operators

An Operator takes an input stream or streams and outputs a new stream, often applying some transform from input to output. Examples of an operator include `map()`, which applies a function on a single input stream to produce output stream with the mapped value.

## Table of Contents:

- [after](#after)
- [combine](#combine)
- [dropRepeats](#droprepeats)
- [dropWith](#dropwith)
- [during](#during)
- [endsWith](#endswith)
- [filter](#filter)
- [flattenPromise](#flattenpromise)
- [lift](#lift)
- [map](#map)
- [merge](#merge)
- [scan](#scan)
- [scanMerge](#scanmerge)
- [skip](#skip)
- [take](#take)
- [zip](#zip)

# after

## `after<T>(duration: number): OperatorFn<T, T[]>`

`after()` is an operator that buffers incoming values, before emitting an array of all the stored values after a period of time with no updates has elapsed. `after` only stores incoming values that arrive within its duration window; once emitted, it'll then start buffering new values and not emit the old values again.

```typescript
const a = createStream<number>();
const buffer = after(100)(a);

a(4)(5);
setTimeout(a, 50, 6);

setTimeout(() => {
  buffer(); // emits [4, 5, 6]
  a(7);
}, 150);

setTimeout(() => {
  buffer(); // emits [7]
}, 250);
```

# combine

## `combine<T extends Stream<any>[], U>(combineFn: (...sources: T) => U, ...sources: T): Stream<U>`

`combine()` is an operator that takes a single function and applies it to multiple input streams to produce a single `Stream<U>`. All the values passed into the combine function are raw `Stream`s.

`combine()` only emits once _all_ input streams are no longer `PENDING` and have values. `combine()` will only emit once no matter how many input streams are updating at once. Input streams that are closed will still have their values pulled by the `combine()` stream, though any changes to the closed Streams will not emit any updates to dependent streams.

```typescript
const a = createStream<number>();
const b = createStream<number>();

// Both inputs are Stream<number>, but the output is Stream<string>
const combined = combine((sA, sB) => sA + sB + "", a, b);

a(5)(6); // Updates twice, but combined() will not emit as long as the other input is still PENDING
b(6); // now combined will emit "12" with both a and b being ACTIVE

combined(); // returns "12"
```

`combine()` however is not _pipeable_, as it assumes a many-to-one relationship, whereas piping in Rythe is one-to-one.

# dropRepeats

## `dropRepeats<T>(source: Stream<T>): Stream<T>`

`dropRepeats` prevents the emission of the same value consecutively. Only values that do not equal the previously emitted value are allowed to be emitted, otherwise they are skipped until a value that is not the same is received. `dropRepeats` uses direct strict equality (`===`) checks between previous and next values to decide whether to `SKIP` or emit.

```typescript
const a = createStream<number>();

const store = a.pipe(
  dropRepeats,
  scan((acc, value) => acc.concat(value), [])
);

a(1)(1)(2)(3)(3);
store(); // returns [1, 2, 3], as the second 1 and 3 were skipped
```

# dropWith

## `dropWith<T>(predicate: (prev: T | undefined, next: T) => boolean): OperatorFn<T, T>`

`dropWith` takes a predicate function and applies it to incoming values so to compare them with whatever the previous value was. If the result of the function is `true`, then the previous and next value are considered the same and thus is skipped. It'll only emit when the next value is not the same as the previous one.

```typescript
const a = createStream<any>();

const store = a.pipe(
  dropWith((prev, next) => prev & (prev.b !== next.b)),
  scan((acc, value) => acc.concat(value), [])
);

a({ b: 1 })({ b: 1 })({ b: 2 })({ b: 3 })({ b: 3 });
store(); // returns [{ b: 1 }, { b: 2 }, { b: 3 }], as the second { b: 1 } and { b: 3 } were skipped
```

# during

## `during<T>(duration: number): OperatorFn<T, T[]>`

`during` is a time-slicing operator. It buffers all values during a set interval into an array, and then once the duration passes, emits a copied array with the collected values and resets the internal array. If it does not receive any values within its interval period, then it does not emit.

```typescript
const a = createStream<number>();

const timed = during(100)(a);

a(1)(2)(4);
during(); // returns undefined as it doesn't emit immediately upon receiving values

setTimeout(() => {
  during(); // returns [1, 2, 4] after its interval period has elapsed.
}, 100);

setTimeout(a, 120, 5);
setTimeout(a, 170, 6);
setTimeout(() => {
  during(); // returns [5, 6]
}, 200);
```

# endsWith

## `endsWith<T>(end: Stream<any>): OperatorFn<any, T>`

`endsWith` takes two streams, one as the input Stream, and the second as an end Stream. The end Stream is provided first, then the `OperatorFn` then applies the operator to an input Stream. When the end Stream receives any update, it will close the output Stream. Any emitted values from the input Stream are passed through.

```typescript
const a = createStream<number>();
const kill = createStream<number>();

const output = endsWith(kill)(a);

a(1)(2);
output(); // returns 2

kill(1); // emit from kill Stream
a(3);
output(); // returns 2 as output is now closed
```

# filter

## `filter<T>(predicate: (value: T) => boolean): OperatorFn<T, T>`

`filter` is an operator that takes a predicate function and then applies that to a single stream. Any value that is false according to the predicate function is filtered and does not emit to any dependents. Only values that pass the predicate get emitted.

```typescript
const a = createStream<number>();

// Check for even numbers
const filtered = a.pipe(filter(value => value % 2 === 0));

// Push three different values to any dependents
a(5)(4)(7);
filtered(); // emits 4, as 5 and 7 were filtered out
```

# flattenPromise

## `flattenPromise<T>(source: Stream<Promise<T>>, errorHandler: (reason: any) => void = noop): Stream<T>`

`flattenPromise` receives a Stream that emits a `Promise` and returns a Stream of the yielded value from said `Promise`. While it is _pipeable_, while not used in a pipes, it can be provided an optional errorHandler to catch and handle rejected Promises. Otherwise, rejected Promises will be silently ignored and no values will be emitted.

```typescript
const url = createStream<string>();

const result = url.pipe(
  map(s => fetch(s)),
  flattenPromise,
  map(response => response.json())
);

url("/endpoint/data.json");
result(); // will return a value once the Promise resolves
```

# lift

## `lift<T extends Stream<any>[], U>(liftFn: (...values: StreamValuesAsTuple<T>) => U, ...sources: T): Stream<U>`

`lift` is a simpler form of `combine`, in which the lift function provided yields the values directly as parameters from the Streams provided as sources. `lift` only emits once all source Streams are active.

```typescript
const a = createStream<number>();
const b = createStream<number>();

const c = lift((vA, vB) => vA + vB, a, b);

a(3);
b(6);

c(); // returns 9
```

# map

## `map<T, U>(mapFn: (value: T) => U, ignoreInitial?: SKIP): OperatorFn<T, U>`

`map()` is a basic operator that takes an input `Stream<T>` and returns an output `Stream<U>`, using a function to apply the transform. Much like a `.map()` method for arrays, it maps one value to another but across emitted values from one stream to another.

```typescript
const stream = createStream<number>();

// Input stream is Stream<number>, output is Stream<string>
const output = map(value => value + "")(stream);

stream(5);
output(); // returns "5"
```

`map()` is _pipeable_, so it can be used in `.pipe()`.

```typescript
const stream = createStream<number>();

const output = stream.pipe(map(value => value + ""));
```

`map()` can be used without being piped immediately, so one defined map operation can be used for multiple different streams.

```typescript
const a = createStream<number>();
const b = createStream<number>();

const mapping = map<number, string>(value => value + "");

const stringA = mapping(a);
const stringB = mapping(b);
```

# merge

## `merge<T extends Stream<any>[]>(...sources: T): Stream<StreamValuesAsArray<T>>`

`merge` takes multiple source Streams and returns a single Stream that emits the value of whichever of the source Streams had emitted. The output Stream will be a combined type of all the different types of the source Streams, representing the potential values that the output Stream can emit.

```typescript
const a = createStream<number>();
const b = createStream<string>();

const merged = merge(a, b); // merged is of type Stream<string | number>

a(4);
merged(); // returns 4

b("thing");
merged(); // returns "thing"
```

# scan

## `scan<T>(scanFn: (acc: T, newValue: T) => T, initial: T): OperatorFn<T, T>`

`scan` accumulates all values it receives and then emits the accumulated result. It also accepts arrays as an accumulator, or can be accumulated into a different type to the incoming value (such as an object).

```typescript
const a = createStream<number>();

// Accumulate into a number
const num = scan((acc, value) => acc + value, 0)(a);
// Accumulate using an array
const arr = scan((acc, value) => acc.concat(value), [])(a);
// Accumulate using an object
const obj = scan(
  (acc, value) => {
    acc.val += value;
    return acc;
  },
  { val: 0 }
)(a);

a(2)(4);

num(); // returns 6
arr(); // returns [2, 4]
obj(); // returns { val: 6 }
```

#scanMerge

## `scanMerge<T, U>(initialValue: U, ...pairs: [Stream<T>, (acc: U, value: T) => U][]): Stream<U>`

`scanMerge` takes an initial value and an array of Stream/accumulator function pairs and combines them into a single accumulated result. It accumulate into a single value, an array, or into a different value type (such as an object).

```typescript
const add = createStream<number>();
const sub = createStream<number>();
const merged = scanMerge(
  0,
  [add, (acc, val) => acc + val],
  [sub, (acc, val) => acc - val]
);

add(2)(3);
sub(1);
merged(); // will return 4
```

`scanMerge` does _not_ scan values immediately if the source streams already have values. It will only accumulate upon receiving new values after it has subscribed to the streams. Ending one input stream will close the `scanMerge` stream immediately.

# skip

## `skip<T>(amount: number): OperatorFn<T, T>`

`skip` takes an integer value and then skips the given amount of times with received values, and only begins emitting _after_ going over the amount of skipped inputs.

```typescript
const a = createStream<number>();

// Skip twice before emitting
const skipped = skip(2)(a);

a(1)(2);
skipped(); // returns undefined, skipped over the last two emits

a(3);
skipped(); // returns 3
```

# take

## `take<T>(amount: number): OperatorFn<T, T>`

`take` takes an integer value and then emits upto the given amount of times with received values, closing itself once it receives more values than the given amount.

```typescript
const a = createStream<number>();

// Take twice before closing
const taken = take(2)(a);

a(1)(2);
taken(); // returns 2, having emitted twice

a(3);
taken(); // returns 2, taken is now closed
```

# zip

## `zip<T extends Stream<any>[]>(...sources: T): Stream<StreamValuesAsTuple<T>>`

`zip` takes a range of input streams and yields a stream containing an array of values from the input streams. The array values are lined up with each other, if a `zip` with two input streams receives `[1,2,3]` in one stream and `["a","b"]` in the other, it will emit `[1, "a"]` and `[2, "b"]` respectively.

```typescript
const a = createStream<number>();
const b = createStream<string>();
const z = zip(a, b);
expect(isStream(z)).toBe(true);
a(5)(4)(3);
b("c");
z(); // will return [5, "c"]
b("d");
z(); // will return [4, "d"]
```

If an input stream to a `zip` closes, `zip` will continue to be active until that input stream's buffer is empty. Only then will `zip` close.

```typescript
const a = createStream<number>();
const b = createStream<string>();
const z = zip(a, b);
expect(isStream(z)).toBe(true);
a(5)(4)(END);
b("c");
z(); // will return [5, "c"]
z.end(); // will return false
b("d");
z(); // will return [4, "d"]
z.end(); // will return true. Won't push any more updates
```
