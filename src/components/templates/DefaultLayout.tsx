import { Outlet } from 'react-router-dom';
import { Heart } from 'lucide-react';

import { Header } from '@/components/organisms/Header';

/**
 * @description デフォルトレイアウトコンポーネント（Template）
 * Header + メインコンテンツ + Footer の基本レイアウトを提供する。
 * React Router の Outlet を使用して子ルートのコンテンツを描画する。
 *
 * @returns {JSX.Element} デフォルトレイアウト要素
 *
 * @example
 * ```tsx
 * // React Router で使用する
 * <Route element={<DefaultLayout />}>
 *   <Route path="/" element={<HomePage />} />
 * </Route>
 * ```
 */
export const DefaultLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツエリア */}
      <main className="flex-1">
        {/* 子ルートのコンテンツを描画する */}
        <Outlet />
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* コピーライト */}
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> using React + Vite +
              TailwindCSS
            </p>

            {/* フッターリンク */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
