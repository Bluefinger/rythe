import { Stream } from "./stream";

/**
 * Signature definition for a Dispatcher function. Must receive a Stream and a value.
 * @internal
 */
export type Dispatcher = <T>(stream: Stream<T>, value: T) => void;

/**
 * Close Function interface. Returns itself to allow terse multilple invocations.
 * @internal
 */
export interface Closer {
  <T>(stream: Stream<T>): this;
}
