import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { useThemeStore } from '@/stores/themeStore';

/**
 * @description ナビゲーションリンクの型定義
 */
interface NavLink {
  /** リンクのラベル */
  label: string;
  /** リンク先のパス */
  path: string;
}

/**
 * @description ナビゲーションリンク一覧
 * 新しいページを追加する際はここにリンクを追加する
 */
const NAV_LINKS: NavLink[] = [
  { label: 'ホーム', path: '/' },
  // 新しいリンクはここに追加する
];

/**
 * @description ヘッダーコンポーネント（Organism）
 * ナビゲーションバー、ダークモード切り替え、モバイルメニューを含むヘッダー。
 * グラスモーフィズムを適用したモダンなデザイン。
 *
 * @returns {JSX.Element} ヘッダーコンポーネント
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export const Header = () => {
  // モバイルメニューの開閉状態を管理する
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 現在のルートパスを取得する
  const location = useLocation();

  // テーマストアからダークモードの状態と切り替え関数を取得する
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  /**
   * モバイルメニューの開閉を切り替える
   */
  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  /**
   * ナビゲーションリンクがアクティブかどうかを判定する
   */
  const isActiveLink = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ・サイト名 */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow duration-200">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Template</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center gap-1" aria-label="メインナビゲーション">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 右側のアクションエリア */}
          <div className="flex items-center gap-2">
            {/* ダークモード切り替えボタン */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* モバイルメニュー切り替えボタン */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={handleToggleMobileMenu}
              aria-label="メニューを開く"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* モバイルナビゲーション */}
        {isMobileMenuOpen && (
          <nav
            className="md:hidden py-4 border-t border-gray-200/50 dark:border-gray-700/50 animate-slide-down"
            aria-label="モバイルナビゲーション"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveLink(link.path)
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
