import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    plugins: ["typescript", "react"],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "typescript/no-explicit-any": "error",
      "typescript/no-inferrable-types": "error",
      "no-param-reassign": "error",
      "default-param-last": "error",
      "no-else-return": "error",
      "react/self-closing-comp": "error",
      "react/rules-of-hooks": "error",
      "react/exhaustive-deps": "warn",
    },
    options: { typeAware: true, typeCheck: true },
  },
});
