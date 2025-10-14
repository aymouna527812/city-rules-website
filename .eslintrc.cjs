/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2023: true,
    node: true,
  },
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:tailwindcss/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import", "tailwindcss"],
  settings: {
    next: {
      rootDir: ["./"],
    },
    "import/resolver": {
      typescript: true,
    },
  },
  rules: {
    "import/order": "off",
    "import/no-anonymous-default-export": "off",
    "tailwindcss/no-custom-classname": "off",
    "tailwindcss/enforces-shorthand": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^ignored" },
    ],
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx"],
      env: {
        vitest: true,
        node: true,
      },
    },
    {
      files: ["scripts/**/*.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      files: ["tailwind.config.ts"],
      rules: {
        "@typescript-eslint/no-require-imports": "off",
      },
    },
  ],
  ignorePatterns: [
    ".next/",
    "dist/",
    "build/",
    "node_modules/",
    "pnpm-lock.yaml",
    "next-env.d.ts",
  ],
};
