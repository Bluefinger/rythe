export type END = unknown;
export type SKIP = unknown;

const { create, freeze } = Object;

/**
 * NO OP. Also known as SKIP. Used to signal when a Stream should skip broadcasting to its dependencies.
 */
export const SKIP = freeze(create(null)) as SKIP;
/**
 * END. Used for signalling a Stream to close itself when passed as a parameter.
 */
export const END: END = freeze(create(null)) as END;

export const emitSKIP = <T>(): T => SKIP as T;
export const emitEND = <T>(): T => END as T;
