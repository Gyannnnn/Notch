const js = require("@eslint/js");
const babelParser = require("@babel/eslint-parser");
const reactHooks = require("eslint-plugin-react-hooks");

/**
 * Parsing goes through Babel rather than @typescript-eslint. The latter loads
 * ts-api-utils, which cannot read the TypeScript 7 pinned at the repo root and
 * throws on startup. Types are covered by `npm run check-types` (the client's
 * own TypeScript 6); what lint adds here is hooks and correctness rules.
 */
module.exports = [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: {
      parser: babelParser,
      ecmaVersion: 2023,
      sourceType: "module",
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
  { ignores: ["dist/**", ".expo/**", "node_modules/**"] },
];
