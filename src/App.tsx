import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { DefaultLayout } from '@/components/templates/DefaultLayout';
import { HomePage } from '@/components/pages/HomePage';

/**
 * @description アプリケーションのルートコンポーネント
 * React Router を使用したルーティングとレイアウトの管理を行う
 * @returns {JSX.Element} アプリケーションのルート要素
 */
export const App = () => {
  // GitHub Pages のベースパスを取得する（vite.config.ts の base 設定と同期）
  const basename = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* DefaultLayout でラップされたルート群 */}
        <Route element={<DefaultLayout />}>
          {/* ホームページ */}
          <Route path="/" element={<HomePage />} />
          {/* 新しいページはここに追加する */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
