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

import { useState, useMemo, useEffect } from 'react';

import { useVaultStore } from '@/stores/vaultStore';
import { filterTree } from '@/lib/fileTreeParser';
import { fetchFileContent, decodeBase64Content } from '@/lib/githubApi';
import type { TreeNode } from '@/types/Vault';

export const useFileTree = () => {
  // ストアからネストツリーを取得する
  const nestedTree = useVaultStore((state) => state.nestedTree);
  const flatTree = useVaultStore((state) => state.flatTree);
  const connection = useVaultStore((state) => state.connection);

  // 検索クエリの状態を管理する
  const [searchQuery, setSearchQuery] = useState('');

  // フィルタ済みツリーの状態
  const [filteredTree, setFilteredTree] = useState<TreeNode[]>(nestedTree);

  // 検索クエリが変更されたら本文検索も含めてフィルタリングする
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTree(nestedTree);
      return;
    }

    let isCancelled = false;
    const lowerQuery = searchQuery.toLowerCase();

    // デバウンス処理
    const timer = setTimeout(async () => {
      // 1. ファイル名・パスによる同期フィルタリング
      const nameFiltered = filterTree(nestedTree, searchQuery);
      if (!connection) {
        if (!isCancelled) setFilteredTree(nameFiltered);
        return;
      }

      // 2. 本文検索のために全Markdownファイルを対象とする
      const mdFiles = flatTree.filter((item) => item.path.endsWith('.md') || item.path.endsWith('.markdown'));
      const contentMatchedPaths = new Set<string>();

      try {
        const fetchPromises = mdFiles.map(async (file) => {
          try {
            const content = await fetchFileContent(connection, file.path);
            const text = decodeBase64Content(content.content).toLowerCase();
            if (text.includes(lowerQuery)) {
              contentMatchedPaths.add(file.path);
            }
          } catch {
            // エラー時はスキップ
          }
        });
        
        await Promise.all(fetchPromises);
      } catch (error) {
        console.error(error);
      }

      if (isCancelled) return;

      // 3. 名前マッチと本文マッチを結合したフィルタリング
      const combinedFilter = (nodes: TreeNode[]): TreeNode[] => {
        const result: TreeNode[] = [];
        for (const node of nodes) {
          if (node.isDirectory) {
            const filteredChildren = combinedFilter(node.children);
            if (filteredChildren.length > 0) {
              result.push({
                ...node,
                children: filteredChildren,
              });
            }
          } else {
            if (
              node.name.toLowerCase().includes(lowerQuery) ||
              node.path.toLowerCase().includes(lowerQuery) ||
              contentMatchedPaths.has(node.path)
            ) {
              result.push(node);
            }
          }
        }
        return result;
      };

      setFilteredTree(combinedFilter(nestedTree));

    }, 500); // 500ms デバウンス

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [nestedTree, flatTree, searchQuery, connection]);

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
