/**
 * Const enums get "consumed" at compile time. So to still expose the types/values
 * without creating enum objects, this file represents the workaround to get the
 * benefits of inlined values with the strict typing of enums, while still exposing
 * the interfaces externally. As object lookups are relatively "expensive" compared
 * to inlined values, this is also a small optimisation for efficient updates to
 * stream state.
 */

/** Stream is closed. Will no longer emit values. */
type CLOSED = 0;
/** Stream is pending. Waiting to receive its first value. */
type PENDING = 1;
/** Stream is active. Has received a value and ready to emit. */
type ACTIVE = 2;
/** Stream is changing. Has been marked to receive a new value. */
type CHANGING = 3;
/** Stream is marked for an imminent update, but waiting on all parents to resolve */
type WAITING = 4;

const CLOSED = 0;
const PENDING = 1;
const ACTIVE = 2;
const CHANGING = 3;
const WAITING = 4;

/**
 * Stream State. Comes with 5 possible states:
 * * CLOSED - 0
 * * PENDING - 1
 * * ACTIVE - 2
 * * CHANGING - 3
 * * UPDATING - 4
 */
export type StreamState = CLOSED | PENDING | ACTIVE | CHANGING | WAITING;
export { CLOSED, PENDING, ACTIVE, CHANGING, WAITING };
