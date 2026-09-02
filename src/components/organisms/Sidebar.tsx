/**
 * @description サイドバーコンポーネント（Organism）
 * フォルダツリーと検索ボックスを含むサイドバー。
 * モバイルではスライドインメニューとして表示する。
 *
 * @param {{ selectedPath: string | null; onSelectFile: (path: string) => void; isOpen: boolean; onClose: () => void }} props
 * @returns {JSX.Element} サイドバー要素
 *
 * @example
 * ```tsx
 * <Sidebar selectedPath={currentPath} onSelectFile={handleSelect} isOpen={isSidebarOpen} onClose={closeSidebar} />
 * ```
 */

import { Search, X } from 'lucide-react';

import { useFileTree } from '@/hooks/useFileTree';
import { TreeNodeItem } from '@/components/molecules/TreeNodeItem';

interface SidebarProps {
  /** 現在選択されているファイルパス */
  selectedPath: string | null;
  /** ファイル選択時のコールバック */
  onSelectFile: (path: string) => void;
  /** モバイルでのサイドバー表示状態 */
  isOpen: boolean;
  /** サイドバーを閉じるコールバック */
  onClose: () => void;
}

export const Sidebar = ({
  selectedPath,
  onSelectFile,
  isOpen,
  onClose,
}: SidebarProps) => {
  // ファイルツリーフックから検索機能とフィルタ済みツリーを取得する
  const { filteredTree, searchQuery, setSearchQuery } = useFileTree();

  // ファイル選択時にモバイルではサイドバーを閉じる
  const handleSelectFile = (path: string) => {
    onSelectFile(path);
    onClose();
  };

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
        <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
          {/* モバイル用の閉じるボタン */}
          <div className="flex items-center justify-between mb-2 lg:hidden">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              ファイルツリー
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="サイドバーを閉じる"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* 検索入力フィールド */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="ファイルを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              id="sidebar-search"
            />
          </div>
        </div>

        {/* ツリー表示エリア */}
        <div className="flex-1 overflow-y-auto p-2" role="tree" aria-label="ファイルツリー">
          {filteredTree.length === 0 ? (
            // 検索結果が0件の場合
            <div className="flex flex-col items-center justify-center py-8 text-center">
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
                selectedPath={selectedPath}
                onSelectFile={handleSelectFile}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
};
