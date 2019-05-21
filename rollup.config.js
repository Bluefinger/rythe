import typescript from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";

export default {
  input: ["./src/index.ts"],
  plugins: [
    typescript({
      tsconfig: "./config/tsconfig.umd.json"
    }),
    babel({
      extensions: [".ts", ".js"]
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
