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
