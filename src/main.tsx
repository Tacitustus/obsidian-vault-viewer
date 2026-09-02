import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from '@/App';

// グローバルスタイルの読み込み
import '@/styles/index.css';

// ルート要素を取得してReactアプリケーションをマウントする
const rootElement = document.getElementById('root');

// ルート要素が存在しない場合はエラーをスローする
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a <div id="root"> in index.html.');
}

// React 18 の createRoot を使用してアプリケーションを描画する
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
