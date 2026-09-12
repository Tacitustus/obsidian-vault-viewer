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

import { useRef } from 'react';
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

export const TabBar = ({ paneId, tabs, activeTabId, onContextMenu }: TabBarProps) => {
  // タブストアからアクションを取得する
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const closeTab = useTabStore((state) => state.closeTab);
  const setActivePane = useTabStore((state) => state.setActivePane);
  const reorderTab = useTabStore((state) => state.reorderTab);

  // 長押し判定用タイマー
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ドラッグ開始
  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ tabId, sourcePaneId: paneId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // コンテナへのドラッグオーバー（末尾への追加用）
  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // コンテナへのドロップ（末尾へ追加）
  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json')) as {
        tabId?: string;
        sourcePaneId?: string;
      };
      if (data.tabId && data.sourcePaneId) {
        reorderTab(data.tabId, data.sourcePaneId, paneId, tabs.length);
      }
    } catch {
      // ignore
    }
  };

  // タブ上へのドロップ
  const handleTabDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation(); // コンテナのドロップイベントをトリガーしないようにする
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json')) as {
        tabId?: string;
        sourcePaneId?: string;
      };
      if (data.tabId && data.sourcePaneId) {
        reorderTab(data.tabId, data.sourcePaneId, paneId, targetIndex);
      }
    } catch {
      // ignore
    }
  };

  // タップ開始時のハンドラー（長押し判定用）
  const handleTouchStart = (e: React.TouchEvent, tabId: string) => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    touchTimerRef.current = setTimeout(() => {
      touchTimerRef.current = null;
      // 長押しと判定されたらコンテキストメニューを開く
      onContextMenu(
        {
          preventDefault: () => {},
          stopPropagation: () => {},
          clientX,
          clientY,
        } as unknown as React.MouseEvent,
        tabId,
      );
    }, 50); // 50msで長押し判定
  };

  // タップ終了・キャンセル時のハンドラー（長押しキャンセル用）
  const handleTouchEndOrMove = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  // タブが0件の場合は空のタブバー領域を表示する（ドロップ可能にするため）
  if (tabs.length === 0) {
    return (
      <div
        className="flex items-center bg-gray-50 dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-700/50 overflow-x-auto h-9"
        onDragOver={handleContainerDragOver}
        onDrop={handleContainerDrop}
      />
    );
  }

  return (
    <div
      className="flex items-center bg-gray-50 dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-700/50 overflow-x-auto scrollbar-thin"
      onDragOver={handleContainerDragOver}
      onDrop={handleContainerDrop}
    >
      {tabs.map((tab, index) => {
        // アクティブタブかどうかを判定する
        const isActive = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => handleTabDrop(e, index)}
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
            onTouchStart={(e) => handleTouchStart(e, tab.id)}
            onTouchEnd={handleTouchEndOrMove}
            onTouchCancel={handleTouchEndOrMove}
            onTouchMove={handleTouchEndOrMove}
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
