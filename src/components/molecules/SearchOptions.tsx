/**
 * @description 検索オプションパネルコンポーネント（Molecule）
 * 検索窓にフォーカスしたときに表示される検索モード切替パネル。
 * ファイル名検索・本文検索・タグ検索の3モードを提供する。
 *
 * @param {{ onClose: () => void }} props
 * @returns {JSX.Element} 検索オプションパネル要素
 *
 * @example
 * ```tsx
 * <SearchOptions onClose={() => setShowOptions(false)} />
 * ```
 */

import { FileText, AlignLeft, Tag } from 'lucide-react';

import { useSearchStore } from '@/stores/searchStore';

import type { SearchMode } from '@/stores/searchStore';

interface SearchOptionsProps {
  /** パネルを閉じるコールバック */
  onClose: () => void;
}

/**
 * @description 検索モードオプションの定義
 */
interface SearchModeOption {
  /** モードのキー */
  mode: SearchMode;
  /** 表示ラベル */
  label: string;
  /** 説明文 */
  description: string;
  /** アイコン */
  icon: React.ReactNode;
}

/** 検索モードオプション一覧 */
const SEARCH_MODE_OPTIONS: SearchModeOption[] = [
  {
    mode: 'filename',
    label: 'ファイル名検索',
    description: 'ファイル名・パスで検索',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    mode: 'content',
    label: '本文検索',
    description: 'ノートの内容で検索',
    icon: <AlignLeft className="w-4 h-4" />,
  },
  {
    mode: 'tag',
    label: 'タグ検索',
    description: 'タグから絞り込み',
    icon: <Tag className="w-4 h-4" />,
  },
];

export const SearchOptions = ({ onClose }: SearchOptionsProps) => {
  // 検索ストアから状態とアクションを取得する
  const searchMode = useSearchStore((state) => state.searchMode);
  const setSearchMode = useSearchStore((state) => state.setSearchMode);

  // モード選択ハンドラー
  const handleSelectMode = (mode: SearchMode) => {
    setSearchMode(mode);
    // タグ検索以外の場合はパネルを閉じる
    if (mode !== 'tag') {
      onClose();
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden animate-slide-down">
      {/* ヘッダー */}
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700/50">
        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          検索モード
        </span>
      </div>

      {/* オプション一覧 */}
      <div className="py-1">
        {SEARCH_MODE_OPTIONS.map((option) => {
          // 現在選択中のモードかどうか
          const isActive = searchMode === option.mode;

          return (
            <button
              key={option.mode}
              className={`flex items-center gap-3 w-full px-3 py-2 text-left transition-colors duration-150 ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
              onClick={() => handleSelectMode(option.mode)}
              role="menuitem"
            >
              {/* アイコン */}
              <span className={`flex-shrink-0 ${
                isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {option.icon}
              </span>

              {/* ラベルと説明 */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium">{option.label}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {option.description}
                </span>
              </div>

              {/* アクティブインジケーター */}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
