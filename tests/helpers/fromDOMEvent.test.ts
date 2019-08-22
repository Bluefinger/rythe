import { fromDOMEvent } from "../../src/helpers";
import { isStream } from "../../src/stream";
import { ACTIVE, CLOSED, PENDING } from "../../src/constants";
import { test } from "../testHarness";
import { JSDOM } from "jsdom";

const { document, Event } = new JSDOM().window;

test("fromDOMEvent - should return a stream", assert => {
  const element = document.createElement("div");
  const s = fromDOMEvent(element, "click");
  assert.equal(isStream(s), true, "returns a valid Stream function");
  assert.equal(s.state, PENDING, "defaults to PENDING state");
});

test("fromDOMEvent - should resolve events from a single DOM Element", assert => {
  const element = document.createElement("div");
  const s = fromDOMEvent(element, "click");
  const clickEvent = new Event("click");
  element.dispatchEvent(clickEvent);
  assert.equal(s(), clickEvent, "emits received Event object");
  assert.equal(s().type, "click", "emitted event is a click");
  assert.equal(
    s().target,
    element,
    "event comes from the element the Stream watches"
  );
  assert.equal(s.state, ACTIVE, "updates to ACTIVE state after emitting");
});

test("fromDOMEvent - should resolve events from many DOM elements", assert => {
  const element = document.createElement("div");
  element.innerHTML = "<div></div><div></div>";
  const elements = element.children;
  const s = fromDOMEvent(elements, "click");
  const clickEvent = new Event("click");
  element.children[1].dispatchEvent(clickEvent);
  assert.equal(s(), clickEvent, "emits received Event object");
  assert.equal(
    s().target,
    element.children[1],
    "event comes from one of the elements the Stream watches"
  );
});

test("fromDOMEvent - should remove its event listener from a single DOM element on END", assert => {
  const element = document.createElement("div");
  const s = fromDOMEvent(element, "click");

  s.end(true);

  const clickEvent = new Event("click");
  element.dispatchEvent(clickEvent);

  assert.equal(
    s(),
    undefined,
    "doesn't listen to events from one element after being closed"
  );
  assert.equal(s.state, CLOSED, "has state set to CLOSED correctly");
});

test("fromDOMEvent - should remove its event listener from many DOM elements on END", assert => {
  const element = document.createElement("div");
  element.innerHTML = "<div></div><div></div>";
  const elements = element.children;
  const s = fromDOMEvent(elements, "click");

  s.end(true);

  const clickEvent = new Event("click");
  element.children[1].dispatchEvent(clickEvent);
  assert.equal(
    s(),
    undefined,
    "doesn't listen to events from many elements after being closed"
  );
  assert.equal(s.state, CLOSED, "has state set to CLOSED correctly");
});
