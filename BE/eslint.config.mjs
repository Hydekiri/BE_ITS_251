// eslint.config.mjs
const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

const compat = new FlatCompat({ /* supports shareable configs */ });

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: {
        project: ['./tsconfig.json'],     
        tsconfigRootDir: __dirname,       
        sourceType: 'module',
        ecmaVersion: 2023,
      },
      globals: {
        ...require('globals').node,
        ...require('globals').jest,
      },
    },
  },

  tsPlugin.configs ? tsPlugin.configs.recommended : {},
  tsPlugin.configs ? tsPlugin.configs.recommendedTypeChecked : {},

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',       
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
];
