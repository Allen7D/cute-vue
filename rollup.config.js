import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json";

export default {
  input: "./src/index.ts",
  output: [
    // commonjs 规范
    {
      format: "cjs",
      file: pkg.main,
    },
    // esm 规范
    {
      format: "es",
      file: pkg.module,
    },
  ],
  plugins: [typescript()],
};
