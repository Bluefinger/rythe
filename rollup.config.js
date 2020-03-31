import sucrase from "@rollup/plugin-sucrase";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

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

export default {
  input: ["./src/index.ts"],
  plugins: [
    resolve({
      extensions: [".js", ".ts"],
    }),
    sucrase({
      transforms: ["typescript"],
    }),
  ],
  output: [
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
  ],
};
