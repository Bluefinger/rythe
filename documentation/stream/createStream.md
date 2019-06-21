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
