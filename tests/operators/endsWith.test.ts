import { createStream } from "../../src/stream";
import { ACTIVE, CLOSED, PENDING } from "../../src/constants";
import { endsWith } from "../../src/operators";
import { test } from "../testHarness";

test("endsWith - subscribes an existing Stream to another", assert => {
  const a = createStream<number>();
  const b = createStream<string>();
  endsWith<string>(a)(b);
  assert.equal(a.dependents[0][0], b, "parent stream has dependents");
  assert.deepEqual(
    b.parents,
    [a],
    "dependent stream is subscribed to parent stream"
  );
});

test("endsWith - subscribed Streams get ended by updates from the parent Stream", assert => {
  const a = createStream<number>();
  const killer = createStream<string>();
  endsWith<string>(killer)(a);
  a(5)(6);
  assert.equal(a.state, ACTIVE, "dependent stream is ACTIVE");
  assert.equal(
    killer.state,
    PENDING,
    "parent stream hasn't received updates yet"
  );
  killer("Do it!");
  assert.equal(killer.state, ACTIVE, "parent stream has received an update");
  assert.equal(
    a.state,
    CLOSED,
    "dependent stream has been closed as a result of parent stream updating"
  );
});
