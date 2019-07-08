import { createStream, isStream } from "../src/stream";
import { ACTIVE, CLOSED, PENDING } from "../src/constants";
import { END } from "../src/signal";
import { Stream } from "../src/types";

describe("Rythe", () => {
  describe("Stream", () => {
    it("can act as a getter and setter", () => {
      const a = createStream<number>(5);
      expect(a()).toBe(5);
      expect(a(6)).toBe(a);
      expect(a()).toBe(6);
    });
    it("it returns undefined by default", () => {
      const a = createStream<number>();
      expect(a()).toBeUndefined();
    });
    it("it can be updated with an explicit undefined", () => {
      const a = createStream<number | undefined>(5);
      expect(a()).toBe(5);
      a(undefined);
      expect(a()).toBe(undefined);
    });
    it("it can be updated with an explicit null", () => {
      const a = createStream<number | null>(5);
      expect(a()).toBe(5);
      a(null);
      expect(a()).toBe(null);
    });
    it("it starts with pending state value and updates to active value", () => {
      const a = createStream<number>();
      expect(a()).toBeUndefined();
      expect(a.state).toBe(PENDING);
      a(5);
      expect(a()).toBe(5);
      expect(a.state).toBe(ACTIVE);
    });
    it("it can be ended by passing true to .end", () => {
      const a = createStream<number>(5);
      expect(a()).toBe(5);
      expect(a.end()).toBe(false);
      a.end(true);
      expect(a()).toBe(5);
      expect(a.end()).toBe(true);
      expect(a.state).toBe(CLOSED);

      // The Stream can still be updated, but it will remain closed and won't push to any dependents
      a(6);
      expect(a()).toBe(6);
      expect(a.state).toBe(CLOSED);
    });
    it("it can be ended with END signal", () => {
      const a = createStream<number>(5);
      expect(a()).toBe(5);
      expect(a.end.val).toBe(false);
      a(END);
      expect(a()).toBe(5);
      expect(a.end.val).toBe(true);
      expect(a.state).toBe(CLOSED);
    });
    it("won't end if passed anything that isn't a boolean true value into .end", () => {
      const a = createStream<number>(5);
      expect(a()).toBe(5);
      expect(a.end.val).toBe(false);
      expect(a.state).toBe(ACTIVE);
      a.end(false);
      expect(a.state).toBe(ACTIVE);
      a.end(END);
      expect(a.state).toBe(ACTIVE);
      a.end(true);
      expect(a.state).toBe(CLOSED);
    });
    it("is pipeable", () => {
      const a = createStream<number>();
      expect(isStream(a.pipe())).toBe(true);
      expect(a.pipe()).toBe(a);
    });
  });
  describe("toJSON", () => {
    it("can serialise into a JSON string", () => {
      const a = createStream<number>(2);
      const b = createStream<string>("foo");
      const c = createStream<Stream<number>>(a);
      const d = createStream<any>({ e: true });
      const e = createStream<any>();
      const f = createStream<any>(null);
      const json = JSON.stringify({ a, b, c, d, e, f });
      expect(json).toBe('{"a":2,"b":"foo","c":2,"d":{"e":true},"f":null}');
    });
  });
  describe("toString", () => {
    it("can serialise into a plain string", () => {
      const a = createStream<number>(2);
      const b = createStream<string>("foo");
      const c = createStream<Stream<number>>(a);
      expect(a.toString()).toBe("streamFn{2}");
      expect(b.toString()).toBe("streamFn{foo}");
      expect(c.toString()).toBe("streamFn{streamFn{2}}");
    });
  });
});
