/**
 * @description ファイルツリーの検索・フィルタを行うカスタムフック
 * vaultStore のネストツリーに対して検索クエリを適用し、
 * フィルタ済みのツリーを返す。
 *
 * @returns ネストツリー、フィルタ済みツリー、検索クエリ操作関数
 *
 * @example
 * ```tsx
 * const { filteredTree, searchQuery, setSearchQuery } = useFileTree();
 * ```
 */

import { useState, useMemo } from 'react';

import { useVaultStore } from '@/stores/vaultStore';
import { filterTree } from '@/lib/fileTreeParser';

export const useFileTree = () => {
  // ストアからネストツリーを取得する
  const nestedTree = useVaultStore((state) => state.nestedTree);
  const flatTree = useVaultStore((state) => state.flatTree);

  // 検索クエリの状態を管理する
  const [searchQuery, setSearchQuery] = useState('');

  // 検索クエリでフィルタしたツリーをメモ化する
  const filteredTree = useMemo(() => {
    return filterTree(nestedTree, searchQuery);
  }, [nestedTree, searchQuery]);

  // 全 Markdown ファイルのパス一覧を取得する（リンク解決用）
  const allMarkdownPaths = useMemo(() => {
    return flatTree
      .filter((item) => item.path.endsWith('.md') || item.path.endsWith('.markdown'))
      .map((item) => item.path);
  }, [flatTree]);

  // 全ファイルのパス一覧を取得する（画像解決用）
  const allFilePaths = useMemo(() => {
    return flatTree.map((item) => item.path);
  }, [flatTree]);

  return {
    nestedTree,
    filteredTree,
    searchQuery,
    setSearchQuery,
    allMarkdownPaths,
    allFilePaths,
  };
};
