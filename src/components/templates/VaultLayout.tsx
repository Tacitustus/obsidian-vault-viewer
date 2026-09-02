/**
 * @description Vault 2ペインレイアウトコンポーネント（Template）
 * サイドバー（フォルダツリー）+ メインペイン（ノート表示）の2ペイン構成。
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

import { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, BookOpen } from 'lucide-react';

import { Sidebar } from '@/components/organisms/Sidebar';
import { Button } from '@/components/atoms/Button';
import { useThemeStore } from '@/stores/themeStore';
import { useVaultStore } from '@/stores/vaultStore';

export const VaultLayout = () => {
  // モバイルでのサイドバー表示状態
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 選択中のファイルパス（URL から取得するのではなく、ここで管理する場合もある）
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // テーマ
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  // vault 情報
  const connection = useVaultStore((state) => state.connection);
  const disconnect = useVaultStore((state) => state.disconnect);

  // ナビゲーション
  const navigate = useNavigate();

  // ファイル選択時のハンドラー
  const handleSelectFile = (path: string) => {
    setSelectedPath(path);
    // Markdown ファイルの場合は URL を更新する
    if (path.endsWith('.md') || path.endsWith('.markdown')) {
      const vaultPath = path.replace(/\.(md|markdown)$/, '');
      void navigate(`/vault/${vaultPath}`);
    }
  };

  // 切断してホームに戻る
  const handleDisconnect = () => {
    disconnect();
    void navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
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
          selectedPath={selectedPath}
          onSelectFile={handleSelectFile}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* メインペイン */}
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ selectedPath, onSelectFile: handleSelectFile }} />
        </main>
      </div>
    </div>
  );
};
