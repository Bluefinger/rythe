export type END = any;
export type SKIP = any;

const { create, freeze } = Object;

/**
 * NO OP. Also known as SKIP. Used to signal when a Cell should skip broadcasting to its dependencies.
 */
export const SKIP: SKIP = freeze(create(null));
/**
 * END. Used for signalling a Cell to close itself when passed as a parameter.
 */
export const END: END = freeze(create(null));
