import { createStream, isStream } from "./stream";
import {
  after,
  combine,
  dropRepeats,
  dropWith,
  during,
  endsWith,
  filter,
  lift,
  map,
  merge,
  scan,
  skip,
  take,
  flattenPromise
} from "./operators/index";
import { END, SKIP } from "./signal";
import { every, fromDOMEvent, fromNodeEvent, fromPromise } from "./helpers";

export {
  createStream,
  isStream,
  after,
  combine,
  dropRepeats,
  dropWith,
  during,
  endsWith,
  filter,
  lift,
  scan,
  map,
  merge,
  skip,
  take,
  flattenPromise,
  END,
  SKIP,
  every,
  fromDOMEvent,
  fromNodeEvent,
  fromPromise
};
