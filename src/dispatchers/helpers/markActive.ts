import { StreamState } from "../../constants";
import { Stream } from "../../types";

/** Mark a Stream as ACTIVE */
export const markActive = (stream: Stream<any>): void => {
  stream.state = StreamState.ACTIVE;
};
