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
