import { createStream } from "rythe/stream";
import { ACTIVE, CLOSED } from "rythe/constants";
import { endsWith } from "rythe/operators";

describe("endsWith", () => {
  it("subscribes an existing Stream to another", () => {
    const a = createStream<number>();
    const b = createStream<string>();
    expect(a.dependents.length).toBe(0);
    expect(a.parents).toEqual([]);
    endsWith<string>(a)(b);
  });
  it("subscribed Streams get ended by updates from the parent Stream", () => {
    const a = createStream<number>();
    const killer = createStream<string>();
    endsWith<string>(killer)(a);
    a(5)(6);
    expect(a.state).toBe(ACTIVE);
    killer("Do it!");
    expect(a.state).toBe(CLOSED);
  });
});
