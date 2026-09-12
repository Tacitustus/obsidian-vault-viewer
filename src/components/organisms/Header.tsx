import { Link } from 'react-router-dom';
import { Sun, Moon, BookOpen } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { useThemeStore } from '@/stores/themeStore';

/**
 * @description ヘッダーコンポーネント（Organism）
 * 接続設定画面用のシンプルなヘッダー。ロゴとダークモード切り替えボタンのみ。
 *
 * @returns {JSX.Element} ヘッダーコンポーネント
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export const Header = () => {
  // テーマストアからダークモードの状態と切り替え関数を取得する
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ・サイト名 */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow duration-200">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Vault Viewer</span>
          </Link>

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
          </div>
        </div>
      </div>
    </header>
  );
};
