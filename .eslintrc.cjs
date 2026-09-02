module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  ignorePatterns: [
    'dist',
    'scripts',
    '.eslintrc.cjs',
    'postcss.config.cjs',
    'tailwind.config.ts',
    'vite.config.ts',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react', '@typescript-eslint', 'jsx-a11y'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // any 型の使用を完全に禁止する
    '@typescript-eslint/no-explicit-any': 'error',
    // 未使用変数のチェック（_プレフィックスは許可）
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    // React のプロパティ型チェック（TypeScript で型チェックするため無効化）
    'react/prop-types': 'off',
    // JSX で React のインポートを不要にする（React 17+ の JSX Transform）
    'react/react-in-jsx-scope': 'off',
  },
};
