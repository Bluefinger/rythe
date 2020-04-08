# Stream

The core of Rythe is the `Stream` function. This is the base building block for all the available operators and helper functions. It tracks its current state, with four possible states: `CLOSED`, `PENDING`, `ACTIVE` and `CHANGING`, and keeps track of any dependent streams and parent streams.

There are two types of streams, `Stream<T>` and `EndStream`.

## Table of Contents:

### Types

- [Stream](#streamt)
- [EndStream](#endstream)
- [SinkStream](#sinkstream)

### Functions

- [createStream](#createStream)
- [isStream](#isStream)

### Signals

- [Signals](signals.md)

# `Stream<T>`

`Stream<T>` is the main stream type, taking a value type and then pushing that value down to any subscribed dependents. Streams can either return the current value if not passed anything as an argument(`<T>(): T`), or it will return itself if passed an argument(`<T>(value: T): Stream<T>`). This allows multiple updates to be done in a curried fashion.

```typescript
const stream = createStream<number>();

// Updates in curried style
stream(4)(5)(6); // returns Stream<number>

stream(); // returns 6
```

Streams expose two methods, `.end()` and `.pipe()`, and are able to be serialised into JSON and as a String.

### `.end(value?: Boolean): Boolean`

`.end()` is another Stream, but of a type `EndStream`, used for closing its parent `Stream<T>`.

### `.pipe(...fns: OperatorFn<T, U>[]): Stream<U>`

`.pipe()` is a method to chain multiple operators to produce a new `Stream<T>` with the value as the result of each operator. It takes the parent `Stream<T>` and then _pipes_ it through each operator function, creating a new `Stream<T>` with each operation. It then yields a finished stream that produces a value as a product of all the operators every time the parent stream emits a value.

```typescript
const stream = createStream<number>();

const piped = stream.pipe(
  map(value => value * 2)
  scan((sum, value) => sum + value, 0)
);

stream(5)(6);
piped(); // returns the value 22
```

### JSON and String serialisation

Streams can be serialised into JSON or into Strings, as they implement their own `.toJSON()` and `.toString()` methods.

```typescript
const stream = createStream<number>(5);

JSON.stringify({ a: stream }); // returns '{"a":5}'
stream.toString(); // returns 'streamFn{5}'
```

# `EndStream`

`Stream<T>` can be ended using either an `END` signal, or by passing `true` into its `.end` method. `.end` is an `EndStream` which is a specific type of `Stream`.

The only real difference between `Stream` and `EndStream` is that `EndStream` is effectively always `Stream<boolean>`, and it'll never return itself even if you pass a value into it. `EndStream` is intended as a one-shot update (`<boolean>(value?: boolean): boolean`), focused on only closing streams and not anything else. But this then allows `EndStream`s to be chained as map functions, so one `END` operation can close multiple streams in a terse manner, even when those `EndStream`s might have their own dependents.

```typescript
const stream = createStream<number>();
const other = createStream<string>();
const things = createStream<string>();

stream.end.pipe(map(other.end), map(things.end));
```

A `Stream<T>` that has been ended/closed can still have its own value updated. However, a closed `Stream<T>` will not emit that value to any other streams. `EndStream` will not update its own value however, as it is representative of its parent `Stream<T>`'s closed state. Once closed, `EndStream` will always yield `true`.

# `SinkStream`

The `sink` stream serves as a drain for certain emit cases, such as subscribing a chain of `EndStream`s. To prevent the need to create extra streams, it is used to receive emits that trigger actions, but should not have further side-effects or dependencies. A `SinkStream` is effectively a type `Stream<void>`, but it will always return `undefined` when called with or without passing a value into it. It is always `CLOSED`, and its state cannot be modified. The `.end` property of a `SinkStream` will always return `undefined` and doesn't do anything.

It is not intended for external use, and remains as an implmentation detail.

```typescript
sink(); // => returns undefined
sink(5); // => returns undefined
sink.val === 5; // returns false. val is undefined
```

# createStream

## `createStream<T>(initialValue?: T): Stream<T>`

`createStream()` is a factory function which produces new `Stream<T>`s. These can be initialised with or without an initial value. If a `Stream<T>` is initialised with a value, then any time another stream subscribes to that initialised stream through an operator function, it'll immediately be updated with the resulting value from the operator.

```typescript
const stream = createStream<number>(5); // initialised with the value 5

const piped = stream.pipe(
  map(value => value * 2)
  scan((sum, value) => sum + value, 0)
);

stream(6);
piped(); // also returns the value 22
```

# isStream

## `isStream(value: any): Boolean`

`isStream()` is a helper function used to determine whether the value it is passed is a stream or not. Both `Stream<T>` and `EndStream` will yield `true`, and everything else that hasn't been created with `createStream()` will yield `false`.

```typescript
const stream = createStream<number>();

isStream(stream); // returns true
isStream(stream.end); // returns true
isStream({}); // returns false
isStream(() => {}); // returns false
```
