import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // This object allows you to add custom rules or override existing ones
    // on top of the inherited configurations.
    rules: {
      // Disable the rule that prevents using the 'any' type.
      "@typescript-eslint/no-explicit-any": "off",

      // Disable the rule that checks for unused variables.
      // Note: This rule comes from @typescript-eslint, but it's an extension of the core ESLint rule.
      "@typescript-eslint/no-unused-vars": "off",

      // Disable the rule that prevents unescaped characters in JSX.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;