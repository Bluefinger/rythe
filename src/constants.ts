export type StreamState = 0 | 1 | 2 | 3;

/**
 * Stream State enum. Comes with 4 possible states:
 * 0. CLOSED
 * 1. PENDING
 * 2. ACTIVE
 * 3. CHANGING
 */
export const StreamState = {
  /** Stream is closed. Will no longer emit values. */
  CLOSED: 0,
  /** Stream is pending. Waiting to receive its first value. */
  PENDING: 1,
  /** Stream is active. Has received a value and ready to emit. */
  ACTIVE: 2,
  /** Stream is changing. Has been marked to receive a new value. */
  CHANGING: 3
} as const;

export const StreamError = {
  SOURCE_ERROR: "Source(s) must be a Stream function",
  PIPE_ERROR: "Can't pipe with no functions",
  INVALID_ARGUMENTS: "Invalid arguments provided."
} as const;
