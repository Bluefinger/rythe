# Rythe
[![Build Status](https://travis-ci.com/Bluefinger/rythe.svg?branch=master)](https://travis-ci.com/Bluefinger/rythe) [![codecov](https://codecov.io/gh/Bluefinger/rythe/branch/master/graph/badge.svg)](https://codecov.io/gh/Bluefinger/rythe) [![npm version](https://badge.fury.io/js/rythe.svg)](https://badge.fury.io/js/rythe)

A tiny, heavily tree-shakeable Reactive Stream library

## HEAVY WORK IN PROGRESS
Do not use for production. You have been warned.

## Installation and Usage

### ES6 via NPM

```
npm install rythe
```

```js
import { createStream } from "rythe";
import { filter, map } from "rythe/operators";

const stream = createStream();

const mapped = stream.pipe(
  filter(value => value % 2 !== 0),
  map(value => value ** 3)
);

stream(5)(6); // mapped emits only 125, 6 is filtered out
```

## Goals
* Provide a tree-shakeable FRP library for use with bundlers like Rollup
* Have better performance while providing similar ergonomics/API to libraries like Flyd, RxJS
* Make use of Typescript as the implementation language for the library for better type documentation and interfaces

## Documentation

Coming Soon.
