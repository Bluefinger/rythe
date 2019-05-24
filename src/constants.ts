/**
 * Stream State enum. Comes with 4 possible states:
 * 0. CLOSED
 * 1. PENDING
 * 2. ACTIVE
 * 3. CHANGING
 */
export enum StreamState {
  CLOSED,
  PENDING,
  ACTIVE,
  CHANGING
}

export enum StreamError {
  SOURCE_ERROR = "Source(s) must be a Stream function",
  PIPE_ERROR = "Can't pipe with no functions"
}
