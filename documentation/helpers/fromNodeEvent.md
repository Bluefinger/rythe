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
