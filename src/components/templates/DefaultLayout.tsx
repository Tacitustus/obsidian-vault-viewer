import { Outlet } from 'react-router-dom';

import { Header } from '@/components/organisms/Header';

/**
 * @description デフォルトレイアウトコンポーネント（Template）
 * 接続設定画面用のレイアウト。Header + メインコンテンツの基本構成。
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
    </div>
  );
};
