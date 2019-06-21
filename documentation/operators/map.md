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
