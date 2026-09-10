/**
 * @description Vault 全体からタグを収集し、タグ → ファイルパスのインデックスを構築するフック
 * フロントマターと本文中の #tag 記法の両方からタグを抽出する。
 * 検索やタグフィルタリングで使用する。
 *
 * @returns タグインデックス情報
 *
 * @example
 * ```tsx
 * const { allTags, getFilesByTag, isLoading } = useTagIndex();
 * ```
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

import { useVaultStore } from '@/stores/vaultStore';
import { fetchFileContent, decodeBase64Content } from '@/lib/githubApi';
import { parseNote } from '@/lib/markdownParser';

/**
 * @description タグインデックスの戻り値型
 */
interface TagIndexResult {
  /** タグ名 → 該当ファイルパス一覧のマップ */
  tagMap: Map<string, string[]>;
  /** 全タグ名の配列（出現回数降順でソート済み） */
  allTags: string[];
  /** タグごとの出現回数マップ */
  tagCounts: Map<string, number>;
  /** 特定タグでフィルタしたファイルパス一覧を取得する */
  getFilesByTag: (tag: string) => string[];
  /** ローディング状態 */
  isLoading: boolean;
  /** インデックスが構築済みかどうか */
  isReady: boolean;
}

export const useTagIndex = (): TagIndexResult => {
  // ストアからファイルツリーと接続情報を取得する
  const flatTree = useVaultStore((state) => state.flatTree);
  const connection = useVaultStore((state) => state.connection);

  // タグ → ファイルパスのマップ
  const [tagMap, setTagMap] = useState<Map<string, string[]>>(new Map());
  // ローディング状態
  const [isLoading, setIsLoading] = useState(false);
  // インデックス構築完了フラグ
  const [isReady, setIsReady] = useState(false);

  // Markdown ファイルのパス一覧を抽出する
  const mdFiles = useMemo(() => {
    return flatTree.filter(
      (item) => item.path.endsWith('.md') || item.path.endsWith('.markdown'),
    );
  }, [flatTree]);

  // タグインデックスを構築する
  useEffect(() => {
    if (mdFiles.length === 0 || !connection) {
      setTagMap(new Map());
      setIsReady(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    const buildIndex = async () => {
      const newTagMap = new Map<string, string[]>();

      // 全 Markdown ファイルを走査してタグを収集する
      // バッチ処理でAPIコールを分散する
      const batchSize = 10;
      for (let i = 0; i < mdFiles.length; i += batchSize) {
        if (isCancelled) return;

        const batch = mdFiles.slice(i, i + batchSize);
        const fetchPromises = batch.map(async (file) => {
          try {
            // ファイルコンテンツを取得する（キャッシュが効く）
            const content = await fetchFileContent(connection, file.path);
            const rawMarkdown = decodeBase64Content(content.content);

            // ノートをパースしてタグを抽出する
            const parsed = parseNote(rawMarkdown);

            // タグごとにファイルパスを登録する
            for (const tag of parsed.tags) {
              const existing = newTagMap.get(tag) ?? [];
              if (!existing.includes(file.path)) {
                existing.push(file.path);
                newTagMap.set(tag, existing);
              }
            }
          } catch {
            // 個別ファイルのエラーはスキップする
          }
        });

        await Promise.all(fetchPromises);
      }

      if (!isCancelled) {
        setTagMap(newTagMap);
        setIsLoading(false);
        setIsReady(true);
      }
    };

    void buildIndex();

    return () => {
      isCancelled = true;
    };
  }, [mdFiles, connection]);

  // 全タグ名の配列（出現回数降順でソート済み）
  const allTags = useMemo(() => {
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([tag]) => tag);
  }, [tagMap]);

  // タグごとの出現回数マップ
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    tagMap.forEach((files, tag) => {
      counts.set(tag, files.length);
    });
    return counts;
  }, [tagMap]);

  // 特定タグでフィルタしたファイルパス一覧を取得する
  const getFilesByTag = useCallback(
    (tag: string): string[] => {
      return tagMap.get(tag) ?? [];
    },
    [tagMap],
  );

  return {
    tagMap,
    allTags,
    tagCounts,
    getFilesByTag,
    isLoading,
    isReady,
  };
};
