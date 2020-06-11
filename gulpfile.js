const { series, parallel } = require("gulp");
const { rollup, watch: rollupWatch } = require("rollup");
const del = require("del");
const { terser } = require("rollup-plugin-terser");
const sucrase = require("@rollup/plugin-sucrase");
const madge = require("madge");
const log = require("fancy-log");
const {
  createChildTask,
  readCache,
  saveCache,
} = require("./scripts/gulputils");

const childTasks = {
  watch: () =>
    createChildTask("tsc --build tests/tsconfig.json --pretty --watch"),
  generateTypes: () =>
    createChildTask("tsc --build config/tsconfig.typings.json --pretty"),
  checkTypes: () => createChildTask("tsc --build tests/tsconfig.json --pretty"),
  linting: () => createChildTask('eslint "./+(src|tests|perf)/**/*.{ts,js}"'),
  documentation: () =>
    createChildTask('prettier --check "./documentation/**/*.md"'),
  unitTests: () => createChildTask("nyc npm run test:tape"),
};

const beautified = [
  terser({
    ecma: 2017,
    compress: false,
    mangle: false,
    output: {
      indent_level: 2,
      quote_style: 3,
      beautify: true,
    },
  }),
];

const compressed = [
  terser({
    ecma: 2017,
    compress: {
      passes: 3,
    },
  }),
];

const inputOptions = {
  input: ["./src/index.ts"],
  plugins: [
    sucrase({
      transforms: ["typescript"],
    }),
  ],
};

const outputOptions = [
  {
    file: "./dist/esm/index.js",
    format: "esm",
    sourcemap: true,
    plugins: beautified,
  },
  {
    file: "./dist/cjs/index.js",
    format: "cjs",
    sourcemap: true,
    plugins: beautified,
  },
  {
    file: "./dist/umd/rythe.min.js",
    format: "umd",
    name: "rythe",
    sourcemap: true,
    plugins: compressed,
  },
];

const watchOptions = {
  ...inputOptions,
  output: outputOptions,
  watch: {
    buildDelay: 100,
    exclude: "node_modules/**",
    skipWrite: true,
  },
};

let cache;

const loadCache = async () => {
  cache = await readCache();
};

const clean = () => del(["./{dist,types}/*"]);

const generateBundle = async () => {
  inputOptions.cache = cache;
  const bundle = await rollup(inputOptions);
  const writing = outputOptions.map(bundle.write);
  await Promise.all([saveCache(bundle.cache), ...writing]);
};

const watchSources = () => {
  watchOptions.cache = cache;
  const bundle = rollupWatch(watchOptions);
  bundle.on("event", (event) => {
    if (event.code === "BUNDLE_END") {
      log(`Bundle generated in ${event.duration} ms. Updating build cache...`);
      saveCache(event.result.cache).catch(log.error);
    }
  });
  childTasks.watch();
};

const dependencies = async () => {
  const res = await madge("./src/index.ts", {
    tsConfig: "./tsconfig.json",
  });
  const circular = res.circular();
  if (circular.length) {
    log.error(`Circular dependencies:\n${circular.join("\n")}`);
    throw new Error("Dependency check failed!");
  } else {
    log("Dependency check passed! No circular dependencies.");
  }
};

const setup = parallel(clean, loadCache);
const build = parallel(generateBundle, childTasks.generateTypes);

exports.clean = clean;
exports.build = series(loadCache, build);
exports.prepare = series(setup, build);
exports.watch = series(loadCache, watchSources);
exports.test = parallel(
  dependencies,
  childTasks.documentation,
  childTasks.linting,
  childTasks.unitTests,
  childTasks.checkTypes
);
