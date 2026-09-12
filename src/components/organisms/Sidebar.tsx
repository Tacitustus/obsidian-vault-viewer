/**
 * @description サイドバーコンポーネント（Organism）
 * フォルダツリー、検索ボックス（モード切替・タグ検索対応）、アナリティクスを含むサイドバー。
 * モバイルではスライドインメニューとして表示する。
 *
 * @param {{ onSelectFile: (path: string) => void; isOpen: boolean; onClose: () => void }} props
 * @returns {JSX.Element} サイドバー要素
 *
 * @example
 * ```tsx
 * <Sidebar onSelectFile={handleSelect} isOpen={isSidebarOpen} onClose={closeSidebar} />
 * ```
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Tag, Settings } from 'lucide-react';

import { useFileTree } from '@/hooks/useFileTree';
import { useSearchStore } from '@/stores/searchStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useVaultStore } from '@/stores/vaultStore';
import { TreeNodeItem } from '@/components/molecules/TreeNodeItem';
import { SearchResultItem } from '@/components/molecules/SearchResultItem';
import { SearchOptions } from '@/components/molecules/SearchOptions';
import { TagSearchPanel } from '@/components/molecules/TagSearchPanel';
import { AnalyticsDashboard } from '@/components/organisms/AnalyticsDashboard';
import { FolderSelector } from '@/components/molecules/FolderSelector';

interface SidebarProps {
  /** ファイル選択時のコールバック */
  onSelectFile: (path: string) => void;
  /** モバイルでのサイドバー表示状態 */
  isOpen: boolean;
  /** サイドバーを閉じるコールバック */
  onClose: () => void;
}

export const Sidebar = ({ onSelectFile, isOpen, onClose }: SidebarProps) => {
  // ファイルツリーフックから検索機能とフィルタ済みツリーを取得する
  const { filteredTree, searchQuery, setSearchQuery, searchResults } = useFileTree();

  // 検索ストアから状態を取得する
  const searchMode = useSearchStore((state) => state.searchMode);
  const selectedTag = useSearchStore((state) => state.selectedTag);
  const setSearchFocused = useSearchStore((state) => state.setSearchFocused);

  // 設定ストアとVaultストア
  const repoKey = useVaultStore((state) => {
    const conn = state.connection;
    return conn ? `${conn.owner}/${conn.repo}` : '';
  });
  const fullNestedTree = useVaultStore((state) => state.nestedTree);
  const sidebarFolders = useSettingsStore((state) => state.sidebarFolders);
  const setSidebarFolders = useSettingsStore((state) => state.setSidebarFolders);

  // UI表示状態
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 検索入力フィールドの ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 検索窓の外側クリックで検索オプションを閉じる
  const searchContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchOptions(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSearchFocused]);

  // ファイル選択時にモバイルではサイドバーを閉じる
  const handleSelectFile = useCallback(
    (path: string) => {
      onSelectFile(path);
      onClose();
    },
    [onSelectFile, onClose],
  );

  // 検索窓フォーカス時のハンドラー
  const handleSearchFocus = () => {
    setSearchFocused(true);
    if (!searchQuery.trim()) {
      setShowSearchOptions(true);
    }
  };

  // 検索モードのアイコンを取得する
  const getSearchModeIcon = () => {
    switch (searchMode) {
      case 'search':
        return <Search className="w-4 h-4 text-blue-400" />;
      case 'tag':
        return <Tag className="w-4 h-4 text-purple-400" />;
    }
  };

  // 検索モードのプレースホルダーを取得する
  const getSearchPlaceholder = () => {
    switch (searchMode) {
      case 'search':
        return 'ファイルや内容で検索...';
      case 'tag':
        return 'タグを選択...';
    }
  };

  // タグ検索モードかつタグ選択済みか
  const isTagSearchActive = searchMode === 'tag';

  return (
    <>
      {/* モバイル用オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* サイドバー本体 */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-72 lg:w-64 xl:w-72 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-700/50 transition-transform duration-300 lg:transition-none lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col h-full`}
        aria-label="ファイルツリーサイドバー"
      >
        {/* サイドバーヘッダー: 検索バー */}
        <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50 flex flex-col gap-2">
          {/* ヘッダー領域 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden lg:inline-block">
              ファイルツリー
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 lg:hidden">
              ファイルツリー
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings((prev) => !prev)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showSettings
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                }`}
                aria-label="サイドバー設定"
                title="表示フォルダの絞り込み"
              >
                <Settings className="w-4 h-4" />
              </button>
              {/* モバイル用の閉じるボタン */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden text-gray-500"
                aria-label="サイドバーを閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* フォルダ絞り込みパネル */}
          {showSettings && (
            <div className="p-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50 mb-1">
              <div className="text-[10px] font-medium text-gray-500 mb-1 px-1">
                表示するフォルダを絞り込む
              </div>
              <FolderSelector
                folderPaths={(() => {
                  const folders: string[] = [];
                  const collect = (nodes: typeof fullNestedTree, prefix: string = '') => {
                    for (const node of nodes) {
                      if (node.isDirectory) {
                        const path = prefix ? `${prefix}/${node.name}` : node.name;
                        folders.push(path);
                        collect(node.children, path);
                      }
                    }
                  };
                  collect(fullNestedTree);
                  return folders;
                })()}
                selectedFolders={sidebarFolders}
                onChange={(folders) => setSidebarFolders(repoKey, folders)}
                compact={true}
              />
            </div>
          )}

          {/* 検索入力フィールド */}
          <div className="relative" ref={searchContainerRef}>
            {/* モードアイコン（クリックでモード切替メニュー表示） */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
              onClick={() => setShowSearchOptions((prev) => !prev)}
              title="検索モードを切り替え"
            >
              {getSearchModeIcon()}
            </button>

            <input
              ref={searchInputRef}
              type="text"
              placeholder={getSearchPlaceholder()}
              value={isTagSearchActive && selectedTag ? `#${selectedTag}` : searchQuery}
              onChange={(e) => {
                if (!isTagSearchActive) {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim().length > 0) {
                    setShowSearchOptions(false);
                  } else if (useSearchStore.getState().isSearchFocused) {
                    setShowSearchOptions(true);
                  }
                }
              }}
              onFocus={handleSearchFocus}
              readOnly={isTagSearchActive}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-transparent focus:border-primary-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                isTagSearchActive
                  ? 'bg-purple-50 dark:bg-purple-900/10 cursor-pointer'
                  : 'bg-gray-100 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800'
              }`}
              id="sidebar-search"
            />

            {/* 検索クリアボタン */}
            {(searchQuery || selectedTag) && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setSearchQuery('');
                  useSearchStore.getState().resetSearch();
                  searchInputRef.current?.focus();
                }}
                aria-label="検索をクリア"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}

            {/* 検索オプションパネル */}
            {showSearchOptions && !isTagSearchActive && (
              <SearchOptions onClose={() => setShowSearchOptions(false)} />
            )}
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="flex-1 overflow-y-auto">
          {/* タグ検索モード: タグ検索パネルを表示 */}
          {isTagSearchActive ? (
            <TagSearchPanel onSelectFile={handleSelectFile} />
          ) : searchQuery.trim().length > 0 ? (
            /* 検索結果リスト（コンテンツ検索モード or 混合検索結果がある場合） */
            <div className="p-2">
              {searchResults.length > 0 ? (
                <>
                  {/* 検索結果ヘッダー */}
                  <div className="px-2 py-1 mb-1">
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      検索結果 ({searchResults.length}件)
                    </span>
                  </div>
                  {searchResults.map((result) => (
                    <SearchResultItem
                      key={result.filePath}
                      result={result}
                      onSelectFile={handleSelectFile}
                      searchQuery={searchQuery}
                    />
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    一致するファイルが見つかりません
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* 通常のツリー表示 */
            <div className="p-2" role="tree" aria-label="ファイルツリー">
              {filteredTree.length === 0 ? (
                // 検索結果が0件の場合
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? '一致するファイルが見つかりません' : 'ファイルがありません'}
                  </p>
                </div>
              ) : (
                // ツリーノードを再帰的にレンダリングする
                filteredTree.map((node) => (
                  <TreeNodeItem
                    key={node.path}
                    node={node}
                    depth={0}
                    selectedPath={null}
                    onSelectFile={handleSelectFile}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* アナリティクスダッシュボード */}
        <AnalyticsDashboard onSelectFile={handleSelectFile} />
      </aside>
    </>
  );
};
