import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// GitHub Pages デプロイ時の base パス設定
// リポジトリ名に合わせて変更してください
// 例: https://username.github.io/repo-name/ → base: '/repo-name/'
// ルートドメイン（username.github.io）の場合は '/' のままで OK
const BASE_PATH = process.env.VITE_BASE_PATH || '/react-github-pages-template/';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: BASE_PATH,
  resolve: {
    alias: {
      // パスエイリアス: @/ → src/
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
