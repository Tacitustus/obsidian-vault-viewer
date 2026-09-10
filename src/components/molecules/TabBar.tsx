/**
 * @description タブバーコンポーネント（Molecule）
 * 各ペインの上部に表示されるタブ一覧。タブの切替、閉じる、右クリックメニューをサポート。
 *
 * @param {{ paneId: string; tabs: Tab[]; activeTabId: string | null; onContextMenu: (e: React.MouseEvent, tabId: string) => void }} props
 * @returns {JSX.Element} タブバー要素
 *
 * @example
 * ```tsx
 * <TabBar paneId="pane-1" tabs={tabs} activeTabId={activeId} onContextMenu={handleMenu} />
 * ```
 */

import { X, FileText } from 'lucide-react';

import { useTabStore } from '@/stores/tabStore';

import type { Tab } from '@/stores/tabStore';

interface TabBarProps {
  /** ペインID */
  paneId: string;
  /** タブ一覧 */
  tabs: Tab[];
  /** アクティブタブID */
  activeTabId: string | null;
  /** 右クリックメニュー表示コールバック */
  onContextMenu: (e: React.MouseEvent, tabId: string) => void;
}

export const TabBar = ({
  paneId,
  tabs,
  activeTabId,
  onContextMenu,
}: TabBarProps) => {
  // タブストアからアクションを取得する
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const closeTab = useTabStore((state) => state.closeTab);
  const setActivePane = useTabStore((state) => state.setActivePane);

  // タブクリック時のハンドラー
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId, paneId);
    setActivePane(paneId);
  };

  // タブを閉じるボタンのクリックハンドラー
  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    // 親要素のクリックイベントを防止する
    e.stopPropagation();
    closeTab(tabId, paneId);
  };

  // タブ中央クリック（ホイールクリック）で閉じる
  const handleMouseDown = (e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) {
      e.preventDefault();
      closeTab(tabId, paneId);
    }
  };

  // タブが0件の場合は何も表示しない
  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center bg-gray-50 dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-700/50 overflow-x-auto scrollbar-thin">
      {tabs.map((tab) => {
        // アクティブタブかどうかを判定する
        const isActive = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-r border-gray-200/30 dark:border-gray-700/30 cursor-pointer select-none transition-all duration-150 min-w-0 max-w-[180px] ${
              isActive
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-b-2 border-b-primary-500'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick(tab.id);
              }
            }}
            onMouseDown={(e) => handleMouseDown(e, tab.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              onContextMenu(e, tab.id);
            }}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
          >
            {/* ファイルアイコン */}
            <FileText className="w-3 h-3 flex-shrink-0 text-primary-400" />

            {/* タブタイトル */}
            <span className="truncate">{tab.title}</span>

            {/* 閉じるボタン */}
            <button
              className={`flex-shrink-0 p-0.5 rounded-sm transition-all duration-150 ${
                isActive
                  ? 'opacity-60 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={(e) => handleCloseTab(e, tab.id)}
              aria-label={`「${tab.title}」タブを閉じる`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
