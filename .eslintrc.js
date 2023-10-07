module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true
    },
    parserOptions: {
        "ecmaVersion": 2017
    },
    globals: { process: true },
    plugins: ["prettier"],
    rules: {
      "prettier/prettier": "warn",
      "prefer-const": "warn",
      "no-use-before-define": "warn",
      "no-var": "warn",
      "no-throw-literal": "warn",
      "no-console": "off"
    },
    extends: ["prettier", "eslint:recommended"]
};
