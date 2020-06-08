import { createStream } from "../stream";
import { Stream } from "../types/stream";
import { subscribeSink } from "../utils/subscriber";

const applyEventStream = <E extends Event>(
  stream: Stream<E>,
  targets: NodeList | HTMLCollection,
  event: string,
  eventOptions?: boolean | AddEventListenerOptions
): void => {
  for (let i = targets.length; i--; ) {
    const target = targets[i];
    target.addEventListener(event, stream, eventOptions);
  }
};

const removeEventStream = <E extends Event>(
  stream: Stream<E>,
  targets: NodeList | HTMLCollection,
  event: string
): void => {
  for (let i = targets.length; i--; ) {
    const target = targets[i];
    target.removeEventListener(event, stream);
  }
};

const isNode = (node: Node | NodeList | HTMLCollection): node is Node =>
  (node as NodeList | HTMLCollection).length === undefined;

export const fromDOMEvent = <E extends Event>(
  target: Node | NodeList | HTMLCollection,
  event: string,
  eventOptions?: boolean | AddEventListenerOptions
): Stream<E> => {
  const eventStream = createStream<E>();
  let operator: () => void;

  if (isNode(target)) {
    target.addEventListener(event, eventStream, eventOptions);
    operator = (): void => target.removeEventListener(event, eventStream);
  } else {
    applyEventStream(eventStream, target, event, eventOptions);
    operator = (): void => removeEventStream(eventStream, target, event);
  }
  subscribeSink(eventStream.end, operator);
  return eventStream;
};
