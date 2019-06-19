# Signals

Signals are special values that can be passed into `Stream<T>` functions to action a number of specific behaviours. They are used to construct operators which require conditional emits or require closing on a specific condition. Currently there are two types of signal: `SKIP` and `END`.

## `SKIP`

`SKIP` is used to stop further emitting of values. As a chain of subscribed Streams update with their product values, if one product yields a `SKIP` value, that `Stream<T>` will not update and all dependent Streams will reset back to not be expecting further updates.

```typescript
const stream = createStream<number>();

const piped = stream.pipe(
   // if the number is odd, it will emit the value, else it will emit SKIP
  filter(value => value % 2 !== 0),
  // Receives the value from the above filter
  map(value => value * 2)
);

// The value SKIP will not do anything if passed in, the Stream will not update nor emit to its dependents
stream(SKIP)(5)(6);
piped(); // returns the value 10, as 6 was skipped and thus the piped() stream didn't update
```

## `END`

`END` is used to close a `Stream<T>` directly, instead of using the `.end` property. This allows for terse chaining and then ending of a stream, or to create operators that close its output stream based on a value or condition.

```typescript
const stream = createStream<number>();

const piped = stream.pipe(
  map(value => value * 2)
);

// The value END will close the Stream, preventing further updates from being emitted to dependents
stream(5)(END)(6);
piped(); // returns the value 10, the parent stream closed and thus piped didn't update
```
