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
