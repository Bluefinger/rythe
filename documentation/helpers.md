# Helpers

A helper function takes an otherwise non-Stream input and produces a Stream output. Whether passing in a Promise, Events, etc, the output will always be a Stream.

## Table of Contents:

- [every](#every)
- [fromDOMEvent](#fromDOMEvent)
- [fromNodeEvent](#fromNodeEvent)
- [fromPromise](#fromPromise)

# every

## `every(duration: number): Stream<number>`

The `every()` helper function creates a 'Stream' that emits on an interval. It takes a duration input in milliseconds and returns a `Stream<number>` output, emitting a timestamp of the interval execution.

`every()` is a self-correcting interval timer, so it will always try to execute at the exact given interval, while correcting for delays that might incur due to javascript's single threaded nature.

`every()` executes immediately once, and then at every n milliseconds as defined by the duration parameter.

```typescript
const stream = every(100); // will emit every 100 milliseconds

const output = stream.pipe(
  map(console.log), // will log the timestamp of the interval to the console
  scan(acc => ++acc, 0)
);

output(); // will emit 1
// 200 milliseconds later
setTimeout(output, 200); // will emit 3
```

# fromDOMEvent

## `fromDOMEvent(target: Node | NodeList | HTMLCollection, event: string, eventOptions?: boolean | AddEventListenerOptions): Stream<Event>`

`fromDOMEvent()` takes a target element or list of elements (either as a `NodeList` or `HTMLCollection`) and then subscribes to a specified event on the given elements. It then outputs a stream that emits the event that is emitted by those elements.

Additionally, options can be passed with the same signature as a `addEventListener` method, so with either a `boolean` value for passive event listeners, or with an `AddEventListenerOptions` object.

Closing the Stream will also unsubscribe the event handlers from the elements it is listening to.

```typescript
const element = document.createElement("div");
element.innerHTML =
  '<p class="words">things</p><p class="words">more things</p>';

// All three examples below will work
const single = fromDOMEvent(element, "click");
const children = fromDOMEvent(element.children, "click");
const queried = fromDOMEvent(element.queryAllSelector(".words"), "click");

single.pipe(map(({ x, y }) => [x, y])); // will emit the x/y coords of the click event as a tuple

single.end(true); // will also remove the click event handler from the element
```

# fromNodeEvent

## `fromNodeEvent(target: EventEmitter, event: string): Stream<any>`

`fromNodeEvent` accepts an EventEmitter type, or any object implementing the EventEmitter interface, and subscribes to a given event name. This is mostly for Node environments that use EventEmitter classes. It yields a `Stream<any>` type, due to the fact the EventEmitters can emit any data, and the stream will then emit on the event name only.

Closing the Stream will also remove the event handler from the EventEmitter.

```typescript
const emitter = new EventEmitter();
const stream = fromNodeEvent(emitter, "send");

events.listenerCount("send"); // returns 1
events.listenerCount("nosend"); // returns 0

emitter.emit("nosend", 12);
stream(); // returns undefined, didn't emit from the incorrect event type

emitter.emit("send", 16);
stream(); // returns 16, emitted from the subscribed event type

stream.end(true);
events.listenerCount("send"); // returns 0
emitter.emit("send", 24);
stream(); // returns 16, no longer subscribed to an event and thus receiving no updates
```

# fromPromise

## `fromPromise<T>(promise: Promise<T>): Stream<T>`

`fromPromise` takes a `Promise<T>` as input and yields a `Stream<T>` as output, emitting the value from the resolved promise. After the promise resolves and the resolved value is emitted by the `Stream<T>`, the stream then closes as there will be no further updates from the `Promise<T>`.

```typescript
const req = fetch("http://example.com/stuff.json");
const stream = fromPromise(req);

// when the fetch completes, the stream will emit a Fetch Response object.
// Then this gets piped through various maps to extract data from the response.
stream.pipe(
  map(response => response.json()),
  map(({ things }) => things)
);
```
