/**
 * @description Vault 2ペインレイアウトコンポーネント（Template）
 * サイドバー（フォルダツリー）+ メインペイン（タブ＋ペイン分割）の構成。
 * レスポンシブ対応: モバイルではハンバーガーメニューでサイドバーを切り替え。
 *
 * @returns {JSX.Element} Vault レイアウト要素
 *
 * @example
 * ```tsx
 * <Route element={<VaultLayout />}>
 *   <Route path="/vault/*" element={<VaultPage />} />
 * </Route>
 * ```
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, BookOpen } from 'lucide-react';

import { Sidebar } from '@/components/organisms/Sidebar';
import { PaneContainer } from '@/components/organisms/PaneContainer';
import { Button } from '@/components/atoms/Button';
import { useThemeStore } from '@/stores/themeStore';
import { useVaultStore } from '@/stores/vaultStore';
import { useTabStore } from '@/stores/tabStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useRef } from 'react';

export const VaultLayout = () => {
  // モバイルでのサイドバー表示状態
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // テーマ
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  // vault 情報
  const connection = useVaultStore((state) => state.connection);
  const disconnect = useVaultStore((state) => state.disconnect);

  // タブストア
  const openTab = useTabStore((state) => state.openTab);
  const getActiveFilePath = useTabStore((state) => state.getActiveFilePath);
  const rootPane = useTabStore((state) => state.rootPane);
  const activePaneId = useTabStore((state) => state.activePaneId);
  const restoreTree = useTabStore((state) => state.restoreTree);

  // アナリティクス
  const loadAnalytics = useAnalyticsStore((state) => state.loadAnalytics);
  const loadTopNotes = useAnalyticsStore((state) => state.loadTopNotes);
  const isEnabled = useAnalyticsStore((state) => state.isEnabled);

  // 共通設定
  const { loadSettings, isLoaded, openedTabs, saveOpenedTabs } = useSettingsStore();
  const repoKey = connection ? `${connection.owner}/${connection.repo}` : '';

  // ナビゲーション
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Vault 接続時に設定とアナリティクスデータを読み込む
  useEffect(() => {
    if (connection) {
      if (isEnabled) {
        void loadAnalytics(repoKey);
        void loadTopNotes(repoKey, 10);
      }
      void loadSettings(repoKey);
    }
  }, [connection, isEnabled, repoKey, loadAnalytics, loadTopNotes, loadSettings]);

  // 2. 設定のロード完了時にタブを復元し、必要に応じてURLのノートを開く
  const hasRestored = useRef(false);
  useEffect(() => {
    if (isLoaded && !hasRestored.current) {
      hasRestored.current = true;

      // サーバーからタブ状態の復元
      if (openedTabs && openedTabs.rootPane && openedTabs.activePaneId) {
        restoreTree(openedTabs.rootPane, openedTabs.activePaneId);
      }

      // URLに指定されたノートがあれば、さらにそれを開く（復元されたタブ群にマージされる）
      const pathMatch = location.pathname.match(/\/vault\/(.+)/);
      if (pathMatch && pathMatch[1]) {
        const notePath = decodeURIComponent(pathMatch[1]);
        const filePath = `${notePath}.md`;
        openTab(filePath);
      }
    }
  }, [isLoaded, openedTabs, restoreTree, openTab, location.pathname]);

  // 3. ペインツリーの状態が変わったら自動保存する
  useEffect(() => {
    if (isLoaded && hasRestored.current && connection) {
      saveOpenedTabs(repoKey, { rootPane, activePaneId });
    }
  }, [rootPane, activePaneId, isLoaded, connection, repoKey, saveOpenedTabs]);

  // アクティブタブのファイルパスが変わったらURLを同期する
  useEffect(() => {
    const activeFilePath = getActiveFilePath();
    if (activeFilePath) {
      const vaultPath = activeFilePath.replace(/\.(md|markdown)$/, '');
      const targetPath = `/vault/${vaultPath}`;
      if (decodeURIComponent(location.pathname) !== targetPath) {
        void navigate(targetPath, { replace: true });
      }
    }
  });

  // ファイル選択時のハンドラー（タブを開く）
  const handleSelectFile = (path: string) => {
    // Markdown ファイルの場合はタブで開く
    if (path.endsWith('.md') || path.endsWith('.markdown')) {
      openTab(path);
    }
  };

  // 切断してホームに戻る
  const handleDisconnect = () => {
    disconnect();
    void navigate('/');
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Vault 用ヘッダー */}
      <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between h-12 px-4">
          {/* 左側: サイドバートグル + ロゴ */}
          <div className="flex items-center gap-3">
            {/* モバイル用サイドバートグル */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="サイドバーを開く"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* ロゴ */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow duration-200">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white hidden sm:inline">
                Vault Viewer
              </span>
            </Link>

            {/* リポジトリ情報 */}
            {connection && (
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:inline">
                {connection.owner}/{connection.repo}
                <span className="ml-1 text-gray-400 dark:text-gray-500">
                  @ {connection.branch}
                </span>
              </span>
            )}
          </div>

          {/* 右側: アクションボタン */}
          <div className="flex items-center gap-1">
            {/* ダークモード切り替え */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              aria-label={
                isDarkMode
                  ? 'ライトモードに切り替え'
                  : 'ダークモードに切り替え'
              }
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* 切断ボタン */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              aria-label="切断してホームに戻る"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ: サイドバー + メインペイン */}
      <div className="flex flex-1 overflow-hidden">
        {/* サイドバー */}
        <Sidebar
          onSelectFile={handleSelectFile}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* メインペイン（タブ + ペイン分割） */}
        <main className="flex-1 overflow-hidden">
          <PaneContainer />
        </main>
      </div>
    </div>
  );
};

