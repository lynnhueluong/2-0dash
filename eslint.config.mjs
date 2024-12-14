import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    plugins: {
      next: nextPlugin,
      react: reactPlugin,
      'react-hooks': hooksPlugin,
    },
    env: {
      browser: true,
      node: true,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'no-undef': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];