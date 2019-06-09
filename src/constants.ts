/**
 * Stream State enum. Comes with 4 possible states:
 * 0. CLOSED
 * 1. PENDING
 * 2. ACTIVE
 * 3. CHANGING
 */
export enum StreamState {
  /** Stream is closed. Will no longer emit values. */
  CLOSED,
  /** Stream is pending. Waiting to receive its first value. */
  PENDING,
  /** Stream is active. Has received a value and ready to emit. */
  ACTIVE,
  /** Stream is changing. Has been marked to receive a new value. */
  CHANGING
}

export const StreamError = {
  SOURCE_ERROR: "Source(s) must be a Stream function",
  PIPE_ERROR: "Can't pipe with no functions",
  INVALID_ARGUMENTS: "Invalid arguments provided."
} as const;
