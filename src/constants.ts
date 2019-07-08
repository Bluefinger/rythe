/** Stream is closed. Will no longer emit values. */
export const CLOSED = 0;
/** Stream is pending. Waiting to receive its first value. */
export const PENDING = 1;
/** Stream is active. Has received a value and ready to emit. */
export const ACTIVE = 2;
/** Stream is changing. Has been marked to receive a new value. */
export const CHANGING = 3;
