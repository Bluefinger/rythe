import sucrase from "@rollup/plugin-sucrase";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input: ["./src/index.ts"],
  plugins: [
    resolve({
      extensions: [".js", ".ts"]
    }),
    sucrase({
      transforms: ["typescript"]
    }),
    terser({
      output: {
        ecma: 5
      }
    })
  ],
  output: {
    file: "./dist/umd/rythe.min.js",
    format: "umd",
    name: "rythe",
    sourcemap: true
  }
};
