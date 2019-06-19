# Rythe Documentation

## Table of Contents:

- [Stream](stream.md)
- [Signals](signals.md)
- [Operators](operators/index.md)
- [Helpers](helpers/index.md)

## Concepts

Rythe is a functional reactive stream library. It takes the step further from the likes of RxJS in that instead of using an Observable object with methods exposed to push values as a stream, it uses a function to do so, in the same vein as libraries like Flyd.

Rythe focuses mostly on providing a tree-shakeable library with a small core. The primary importance of being able to only pay for what you use is highly beneficial in bandwidth limited environments (browsers). Secondly, good performance is the next goal of Rythe in order to ensure that the library incurs minimal overhead in its usage. It achieves this through focusing on atomic updates, so to actively prevent intermediate states being emitted to any subscribed functions or streams. This then helps to prevent re-renders in UI libraries or unwanted execution on code that interfaces/interacts with Rythe.

Rythe is written in Typescript as a specific design choice. The ability to define interfaces, call signatures, and type-check at compile time is invaluable for building a library that is robust and well-tested. It lends well for documentation and for IDEs that support type definition files.

### Aside

[The name 'Rythe' is an English name for a small stream or a creek in a salt water habour](https://en.wikipedia.org/wiki/Rythe). Given the emphasis on being small and a name for a Stream, it felt very appropriate and also distinct.
