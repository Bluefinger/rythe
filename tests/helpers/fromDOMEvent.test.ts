/**
 * @jest-environment jsdom
 */
import { fromDOMEvent } from "rythe/helpers";
import { isStream } from "rythe/stream";
import { ACTIVE, CLOSED, PENDING } from "rythe/constants";

describe("fromDOMEvent", () => {
  it("should return a stream", () => {
    const element = document.createElement("div");
    const s = fromDOMEvent(element, "click");
    expect(isStream(s)).toBe(true);
    expect(s.state).toBe(PENDING);
  });
  it("should resolve events from a single DOM element", () => {
    const element = document.createElement("div");
    const s = fromDOMEvent(element, "click");
    const clickEvent = new Event("click");
    element.dispatchEvent(clickEvent);

    expect(s()).toBe(clickEvent);
    expect(s().type).toBe("click");
    expect(s().target).toBe(element);
    expect(s.state).toBe(ACTIVE);
  });
  it("should resolve events from many DOM elements", () => {
    const element = document.createElement("div");
    element.innerHTML = "<div></div><div></div>";
    const elements = element.children;
    const s = fromDOMEvent(elements, "click");
    const clickEvent = new Event("click");
    element.children[1].dispatchEvent(clickEvent);

    expect(s()).toBe(clickEvent);
    expect(s().target).toBe(element.children[1]);
    expect(s.state).toBe(ACTIVE);
  });
  it("should remove its event listener from a single DOM element on END", () => {
    const element = document.createElement("div");
    const s = fromDOMEvent(element, "click");

    s.end(true);

    const clickEvent = new Event("click");
    element.dispatchEvent(clickEvent);

    expect(s()).toBeUndefined();
    expect(s.state).toBe(CLOSED);
  });
  it("should remove its event listener from many DOM elements on END", () => {
    const element = document.createElement("div");
    element.innerHTML = "<div></div><div></div>";
    const elements = element.children;
    const s = fromDOMEvent(elements, "click");

    s.end(true);

    const clickEvent = new Event("click");
    element.children[1].dispatchEvent(clickEvent);

    expect(s()).toBeUndefined();
    expect(s.state).toBe(CLOSED);
  });
});
