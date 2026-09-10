/**
 * @description ファイルツリーの検索・フィルタを行うカスタムフック
 * vaultStore のネストツリーに対して検索クエリを適用し、
 * フィルタ済みのツリーを返す。検索結果にはマッチ種別とスニペットを含める。
 *
 * @returns ネストツリー、フィルタ済みツリー、検索結果、検索クエリ操作関数
 *
 * @example
 * ```tsx
 * const { filteredTree, searchResults, searchQuery, setSearchQuery } = useFileTree();
 * ```
 */

import { useState, useMemo, useEffect } from 'react';

import { useVaultStore } from '@/stores/vaultStore';
import { filterTree } from '@/lib/fileTreeParser';
import { fetchFileContent, decodeBase64Content } from '@/lib/githubApi';
import type { TreeNode } from '@/types/Vault';

/**
 * @description 検索結果のマッチ種別
 */
export type SearchMatchType = 'filename' | 'content';

/**
 * @description 検索結果アイテムの型定義
 */
export interface SearchResult {
  /** マッチしたノード */
  node: TreeNode;
  /** マッチ種別（ファイル名 / コンテンツ） */
  matchType: SearchMatchType;
  /** 本文マッチ時のコンテキスト付きスニペット */
  snippet?: string;
  /** ファイルパス */
  filePath: string;
}

/**
 * @description 本文中のマッチ箇所からスニペットを生成する
 * @param {string} text - 本文テキスト
 * @param {string} query - 検索クエリ（小文字）
 * @returns {string} コンテキスト付きスニペット
 */
const generateSnippet = (text: string, query: string): string => {
  // マッチ箇所を検索する
  const lowerText = text.toLowerCase();
  const matchIndex = lowerText.indexOf(query);

  if (matchIndex === -1) return '';

  // マッチ箇所の前後50文字をコンテキストとして取得する
  const contextLength = 50;
  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(text.length, matchIndex + query.length + contextLength);

  // スニペットを構築する
  let snippet = '';
  if (start > 0) snippet += '...';
  snippet += text.slice(start, end);
  if (end < text.length) snippet += '...';

  return snippet;
};

export const useFileTree = () => {
  // ストアからネストツリーを取得する
  const nestedTree = useVaultStore((state) => state.nestedTree);
  const flatTree = useVaultStore((state) => state.flatTree);
  const connection = useVaultStore((state) => state.connection);

  // 検索クエリの状態を管理する
  const [searchQuery, setSearchQuery] = useState('');

  // フィルタ済みツリーの状態
  const [filteredTree, setFilteredTree] = useState<TreeNode[]>(nestedTree);

  // 検索結果（マッチ種別・スニペット付き）
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // 検索クエリが変更されたら本文検索も含めてフィルタリングする
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTree(nestedTree);
      setSearchResults([]);
      return;
    }

    let isCancelled = false;
    const lowerQuery = searchQuery.toLowerCase();

    // デバウンス処理
    const timer = setTimeout(async () => {
      // 1. ファイル名・パスによる同期フィルタリング
      const nameFiltered = filterTree(nestedTree, searchQuery);

      // ファイル名マッチの検索結果を生成する
      const nameResults: SearchResult[] = [];
      const collectNameMatches = (nodes: TreeNode[]) => {
        for (const node of nodes) {
          if (node.isDirectory) {
            collectNameMatches(node.children);
          } else if (
            node.name.toLowerCase().includes(lowerQuery) ||
            node.path.toLowerCase().includes(lowerQuery)
          ) {
            nameResults.push({
              node,
              matchType: 'filename',
              filePath: node.path,
            });
          }
        }
      };
      collectNameMatches(nestedTree);

      if (!connection) {
        if (!isCancelled) {
          setFilteredTree(nameFiltered);
          setSearchResults(nameResults);
        }
        return;
      }

      // 2. 本文検索のために全Markdownファイルを対象とする
      const mdFiles = flatTree.filter((item) => item.path.endsWith('.md') || item.path.endsWith('.markdown'));
      const contentMatchedPaths = new Set<string>();
      // ファイルパス → スニペットのマップ
      const snippetMap = new Map<string, string>();

      try {
        const fetchPromises = mdFiles.map(async (file) => {
          try {
            const content = await fetchFileContent(connection, file.path);
            const text = decodeBase64Content(content.content);
            if (text.toLowerCase().includes(lowerQuery)) {
              contentMatchedPaths.add(file.path);
              // スニペットを生成する
              const snippet = generateSnippet(text, lowerQuery);
              snippetMap.set(file.path, snippet);
            }
          } catch {
            // エラー時はスキップ
          }
        });
        
        await Promise.all(fetchPromises);
      } catch (error: unknown) {
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

      // 4. コンテンツマッチの検索結果を生成する
      const contentResults: SearchResult[] = [];
      contentMatchedPaths.forEach((filePath) => {
        // ファイル名でも既にマッチしている場合はスキップする
        const alreadyInNameResults = nameResults.some((r) => r.filePath === filePath);
        if (!alreadyInNameResults) {
          // 該当するTreeNodeを探す
          const findNode = (nodes: TreeNode[]): TreeNode | undefined => {
            for (const node of nodes) {
              if (node.path === filePath) return node;
              if (node.isDirectory) {
                const found = findNode(node.children);
                if (found) return found;
              }
            }
            return undefined;
          };
          const node = findNode(nestedTree);
          if (node) {
            contentResults.push({
              node,
              matchType: 'content',
              snippet: snippetMap.get(filePath),
              filePath,
            });
          }
        }
      });

      // 検索結果を統合する（ファイル名マッチが先、コンテンツマッチが後）
      const allResults = [...nameResults, ...contentResults];

      setFilteredTree(combinedFilter(nestedTree));
      setSearchResults(allResults);

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
    searchResults,
    allMarkdownPaths,
    allFilePaths,
  };
};
