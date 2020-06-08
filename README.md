# Rythe

[![Build Status](https://travis-ci.com/Bluefinger/rythe.svg?branch=master)](https://travis-ci.com/Bluefinger/rythe) ![](https://github.com/Bluefinger/rythe/workflows/Node%20CI/badge.svg) [![codecov](https://codecov.io/gh/Bluefinger/rythe/branch/master/graph/badge.svg)](https://codecov.io/gh/Bluefinger/rythe) [![npm version](https://badge.fury.io/js/rythe.svg)](https://badge.fury.io/js/rythe)

A tiny, heavily tree-shakeable Reactive Stream library

## Installation and Usage

### ES6 via NPM

```
npm install rythe
```

```js
import { createStream, filter, map } from "rythe";

const stream = createStream();

const mapped = stream.pipe(
  filter((value) => value % 2 !== 0),
  map((value) => value ** 3)
);

stream(5)(6); // mapped emits only 125, 6 is filtered out
```

Note: Tested to work with the latest version of Typescript (3.9). Only supports the latest typescript officially.

## Goals

- Provide a tree-shakeable FRP library for use with bundlers like Rollup
- Have good performance while providing similar ergonomics/API to libraries like Flyd, RxJS
- Make use of Typescript as the implementation language for the library for better type documentation and interfaces

## Documentation

Documentation can be read [here](documentation/index.md).
