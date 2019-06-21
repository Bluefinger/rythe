# Stream

The core of Rythe is the `Stream` function. This is the base building block for all the available operators and helper functions. It tracks its current state, with four possible states: `CLOSED`, `PENDING`, `ACTIVE` and `CHANGING`, and keeps track of any dependent streams and parent streams.

There are two types of streams, `Stream<T>` and `EndStream`.

## Table of Contents:

### Types

- [Stream](stream.md)
- [EndStream](endstream.md)

### Functions

- [createStream](createStream.md)
- [isStream](isStream.md)

### Signals

- [Signals](signals.md)
