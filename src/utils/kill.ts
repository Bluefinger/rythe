import { END } from "../signal";

/** Function that returns a kill signal. For use with Streams subscribed to .end */
export const kill = (): any => END;
