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
