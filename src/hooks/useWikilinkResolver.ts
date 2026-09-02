/**
 * @description Wikilink のファイルパス解決を行うカスタムフック
 * Vault 内のファイルツリーを使って、ノート名からファイルパスを特定する。
 *
 * 照合ルール（優先順）:
 * 1. 完全パス一致: target にスラッシュが含まれる場合、パス全体で照合
 * 2. ベース名一致: ファイル名（拡張子なし）を case-insensitive で比較
 * 3. 拡張子省略: `.md` を自動付与して再照合
 *
 * 同名ファイルが複数ある場合: 最も浅い階層（パスの `/` が最少）のファイルを優先する。
 * この挙動は Obsidian のデフォルト設定（「最短パス」）に準じた明示的なルールである。
 *
 * @returns ファイルパス解決関数と存在チェック関数
 *
 * @example
 * ```tsx
 * const { resolveWikilink, isExistingNote, resolveFilePath } = useWikilinkResolver();
 * const resolved = resolveWikilink('MyNote');
 * ```
 */

import { useCallback, useMemo } from 'react';

import { useVaultStore } from '@/stores/vaultStore';

import type { ResolvedLink } from '@/types/Vault';

export const useWikilinkResolver = () => {
  // ストアからファイルツリーを取得する
  const flatTree = useVaultStore((state) => state.flatTree);

  // 全ファイルパスをメモ化する
  const allPaths = useMemo(() => {
    return flatTree.map((item) => item.path);
  }, [flatTree]);

  /**
   * ターゲット名からファイルパスを解決する
   * 画像・添付ファイルを含む全ファイルを対象とする
   */
  const resolveFilePath = useCallback(
    (target: string): string | undefined => {
      // パスにスラッシュが含まれる場合は完全パス一致で照合する
      if (target.includes('/')) {
        // 完全一致を試みる
        const exactMatch = allPaths.find(
          (p) => p.toLowerCase() === target.toLowerCase(),
        );
        if (exactMatch) return exactMatch;
      }

      // ベース名（拡張子なし）で case-insensitive 照合する
      const targetLower = target.toLowerCase();

      // ターゲットに拡張子がある場合: ファイル名で完全一致
      if (target.includes('.')) {
        const matches = allPaths.filter((p) => {
          const fileName = p.split('/').pop() ?? '';
          return fileName.toLowerCase() === targetLower;
        });

        if (matches.length > 0) {
          // 同名ファイルが複数ある場合: 最も浅い階層を優先する
          // 明示的ルール: パスの `/` の数が最も少ないファイルを選択する
          return matches.sort(
            (a, b) =>
              (a.match(/\//g)?.length ?? 0) - (b.match(/\//g)?.length ?? 0),
          )[0];
        }
      }

      // 拡張子なしの場合: ファイル名のベース名（拡張子除去）で照合する
      const matches = allPaths.filter((p) => {
        const fileName = p.split('/').pop() ?? '';
        // 拡張子を除去したベース名を取得する
        const baseName = fileName.replace(/\.[^.]+$/, '');
        return baseName.toLowerCase() === targetLower;
      });

      if (matches.length > 0) {
        // Markdown ファイルを優先する
        const mdMatches = matches.filter(
          (p) => p.endsWith('.md') || p.endsWith('.markdown'),
        );
        const targetMatches = mdMatches.length > 0 ? mdMatches : matches;

        // 同名ファイルが複数ある場合: 最も浅い階層を優先する
        // 明示的ルール: パスの `/` の数が最も少ないファイルを選択する
        return targetMatches.sort(
          (a, b) =>
            (a.match(/\//g)?.length ?? 0) - (b.match(/\//g)?.length ?? 0),
        )[0];
      }

      return undefined;
    },
    [allPaths],
  );

  /**
   * wikilink を解決し、ResolvedLink を返す
   */
  const resolveWikilink = useCallback(
    (target: string, alias?: string, heading?: string): ResolvedLink => {
      const resolvedPath = resolveFilePath(target);

      return {
        isResolved: resolvedPath !== undefined,
        resolvedPath,
        target,
        alias,
        heading,
      };
    },
    [resolveFilePath],
  );

  /**
   * ターゲット名に対応するノートが存在するか判定する
   */
  const isExistingNote = useCallback(
    (target: string): boolean => {
      return resolveFilePath(target) !== undefined;
    },
    [resolveFilePath],
  );

  return {
    resolveWikilink,
    isExistingNote,
    resolveFilePath,
  };
};
