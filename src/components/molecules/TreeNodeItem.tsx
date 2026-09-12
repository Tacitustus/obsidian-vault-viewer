/**
 * @description ファイルツリーの1ノードを表示するコンポーネント（Molecule）
 * ディレクトリの折り畳み/展開、ファイル選択をサポートする。
 *
 * @param {{ node: TreeNode; depth: number; selectedPath: string | null; onSelectFile: (path: string) => void }} props
 * @returns {JSX.Element} ツリーノード要素
 *
 * @example
 * ```tsx
 * <TreeNodeItem node={node} depth={0} selectedPath={currentPath} onSelectFile={handleSelect} />
 * ```
 */

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { FileIcon } from '@/components/molecules/FileIcon';

import type { TreeNode } from '@/types/Vault';

interface TreeNodeItemProps {
  /** ツリーノードデータ */
  node: TreeNode;
  /** ネストの深さ（インデント計算用） */
  depth: number;
  /** 現在選択されているファイルパス */
  selectedPath: string | null;
  /** ファイル選択時のコールバック */
  onSelectFile: (path: string) => void;
}

export const TreeNodeItem = ({ node, depth, selectedPath, onSelectFile }: TreeNodeItemProps) => {
  // ディレクトリの展開状態を管理する（デフォルトは最上位のみ展開）
  const [isExpanded, setIsExpanded] = useState(depth === 0);

  // ノードがアクティブ（選択中）かどうかを判定する
  const isSelected = selectedPath === node.path;

  // クリックハンドラー
  const handleClick = () => {
    if (node.isDirectory) {
      // ディレクトリの場合は展開/折り畳みを切り替える
      setIsExpanded((prev) => !prev);
    } else {
      // ファイルの場合は選択コールバックを呼ぶ
      onSelectFile(node.path);
    }
  };

  // キーボード操作ハンドラー
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div>
      {/* ノード本体 */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer text-sm transition-all duration-150 select-none ${
          isSelected
            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="treeitem"
        tabIndex={0}
        aria-expanded={node.isDirectory ? isExpanded : undefined}
        aria-selected={isSelected}
      >
        {/* ディレクトリの展開/折り畳みアイコン */}
        {node.isDirectory ? (
          <ChevronRight
            className={`w-3.5 h-3.5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        ) : (
          // ファイルの場合はスペーサーを挿入する（アイコン位置を揃えるため）
          <span className="w-3.5 flex-shrink-0" />
        )}

        {/* ファイル/ディレクトリアイコン */}
        <FileIcon fileType={node.fileType} isDirectory={node.isDirectory} isExpanded={isExpanded} />

        {/* ノード名 */}
        <span className="truncate">{node.name}</span>
      </div>

      {/* 子ノード（ディレクトリが展開されている場合のみ表示） */}
      {node.isDirectory && isExpanded && (
        <div role="group">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};
