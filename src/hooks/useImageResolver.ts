/**
 * @description 画像URLの解決を行うカスタムフック
 * 公開リポジトリでは raw.githubusercontent.com の生URLを使用し、
 * プライベートリポジトリ（PAT指定時）では Contents API 経由で base64 を取得して data: URL に変換する。
 *
 * @returns 画像URL解決関数
 *
 * @example
 * ```tsx
 * const { resolveImageUrl } = useImageResolver();
 * const url = await resolveImageUrl('images/photo.png');
 * ```
 */

import { useCallback } from 'react';

import { useVaultStore } from '@/stores/vaultStore';
import { buildRawImageUrl, fetchFileContent, buildBase64ImageUrl } from '@/lib/githubApi';
import { useWikilinkResolver } from '@/hooks/useWikilinkResolver';

export const useImageResolver = () => {
  // ストアから接続情報を取得する
  const connection = useVaultStore((state) => state.connection);

  // ファイルパス解決にwikilinkリゾルバを使用する
  const { resolveFilePath } = useWikilinkResolver();

  /**
   * 画像ファイルのURLを解決する
   * wikilink形式のターゲット名を受け取り、表示可能なURLを返す
   */
  const resolveImageUrl = useCallback(
    async (target: string): Promise<string> => {
      if (!connection) {
        return '';
      }

      // ファイルパスを解決する
      const resolvedPath = resolveFilePath(target);
      const filePath = resolvedPath ?? target;

      // PAT が指定されている場合はプライベートリポジトリの可能性がある
      // Contents API 経由で base64 データを取得する
      if (connection.token) {
        try {
          const fileContent = await fetchFileContent(connection, filePath);
          return buildBase64ImageUrl(fileContent);
        } catch {
          // フォールバック: raw URLを返す
          return buildRawImageUrl(connection, filePath);
        }
      }

      // 公開リポジトリの場合は raw.githubusercontent.com の生URLを使用する
      return buildRawImageUrl(connection, filePath);
    },
    [connection, resolveFilePath],
  );

  /**
   * 標準Markdown形式の画像パスをURLに変換する
   * 相対パスの場合はリポジトリのパスとして解決する
   */
  const resolveMarkdownImageUrl = useCallback(
    (src: string, currentNotePath?: string): string => {
      if (!connection) {
        return src;
      }

      // 外部URL（http/https）の場合はそのまま返す
      if (src.startsWith('http://') || src.startsWith('https://')) {
        return src;
      }

      // 相対パスの場合、現在のノートのディレクトリを基準にパスを解決する
      let resolvedPath = src;
      if (currentNotePath && !src.startsWith('/')) {
        const currentDir = currentNotePath.split('/').slice(0, -1).join('/');
        resolvedPath = currentDir ? `${currentDir}/${src}` : src;
      }

      // raw.githubusercontent.com の URL を返す（公開リポジトリ）
      // PAT 指定時は fetch 時に認証するため、ここでは raw URL を返す
      return buildRawImageUrl(connection, resolvedPath);
    },
    [connection],
  );

  return {
    resolveImageUrl,
    resolveMarkdownImageUrl,
  };
};
