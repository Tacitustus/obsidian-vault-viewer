import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { DefaultLayout } from '@/components/templates/DefaultLayout';
import { VaultLayout } from '@/components/templates/VaultLayout';
import { HomePage } from '@/components/pages/HomePage';

/**
 * @description アプリケーションのルートコンポーネント
 * React Router を使用したルーティングとレイアウトの管理を行う。
 * - `/` → 接続設定画面（DefaultLayout）
 * - `/vault/*` → Vault ビューア（VaultLayout: サイドバー＋タブ＋ペイン分割）
 * @returns {JSX.Element} アプリケーションのルート要素
 */
export const App = () => {
  // GitHub Pages のベースパスを取得する（vite.config.ts の base 設定と同期）
  const basename = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* 接続設定画面: DefaultLayout でラップ */}
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Vault ビューア: VaultLayout がタブ・ペイン分割を内部管理 */}
        <Route path="/vault/*" element={<VaultLayout />} />
      </Routes>
    </BrowserRouter>
  );
};

