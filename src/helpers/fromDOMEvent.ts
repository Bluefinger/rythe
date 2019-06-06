import { createStream } from "../stream";
import { Stream } from "../types";
import { map } from "../operators/map";

const applyEventStream = (
  stream: Stream<Event>,
  targets: NodeList | HTMLCollection,
  event: string,
  eventOptions?: boolean | AddEventListenerOptions
): void => {
  for (let i = targets.length; i--; ) {
    const target = targets[i];
    target.addEventListener(event, stream, eventOptions);
  }
};

const removeEventStream = (
  stream: Stream<Event>,
  targets: NodeList | HTMLCollection,
  event: string
): void => {
  for (let i = targets.length; i--; ) {
    const target = targets[i];
    target.removeEventListener(event, stream);
  }
};

const isNode = (node: Node | NodeList | HTMLCollection): node is Node =>
  (node as any).length === undefined;

export const fromDOMEvent = (
  target: Node | NodeList | HTMLCollection,
  event: string,
  eventOptions?: boolean | AddEventListenerOptions
): Stream<Event> => {
  const eventStream = createStream<Event>();
  let operator: () => void;

  if (!isNode(target)) {
    applyEventStream(eventStream, target, event, eventOptions);
    operator = (): void => removeEventStream(eventStream, target, event);
  } else {
    target.addEventListener(event, eventStream, eventOptions);
    operator = (): void => target.removeEventListener(event, eventStream);
  }

  map<boolean, void>(operator)(eventStream.end);
  return eventStream;
};
