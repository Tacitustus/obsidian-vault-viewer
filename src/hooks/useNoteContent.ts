/**
 * @description 個別ノートの取得とパースを行うカスタムフック
 * GitHub Contents API からノートを取得し、フロントマター解析・タグ抽出を行う。
 * キャッシュにより同一セッション内で同じファイルを再取得しない。
 *
 * @param {string | null} filePath - 取得するファイルのパス（null の場合は取得しない）
 * @returns パース済みノートデータ、ローディング状態、エラー情報
 *
 * @example
 * ```tsx
 * const { parsedNote, isLoading, error } = useNoteContent('notes/hello.md');
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

import { useVaultStore } from '@/stores/vaultStore';
import { fetchFileContent, decodeBase64Content } from '@/lib/githubApi';
import { parseNote } from '@/lib/markdownParser';

import type { ApiError, ParsedNote } from '@/types/Vault';

export const useNoteContent = (filePath: string | null) => {
  // ストアから接続情報を取得する
  const connection = useVaultStore((state) => state.connection);

  // ノートの状態を管理する
  const [parsedNote, setParsedNote] = useState<ParsedNote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // ノートを取得してパースする
  const loadNote = useCallback(async () => {
    // ファイルパスまたは接続情報が無い場合は何もしない
    if (!filePath || !connection) {
      setParsedNote(null);
      return;
    }

    // ローディング開始
    setIsLoading(true);
    setError(null);

    try {
      // GitHub API からファイルコンテンツを取得する
      const fileContent = await fetchFileContent(connection, filePath);

      // base64 デコードする
      const rawMarkdown = decodeBase64Content(fileContent.content);

      // フロントマター解析・タグ抽出を行う
      const note = parseNote(rawMarkdown);

      setParsedNote(note);
    } catch (err: unknown) {
      // エラーを設定する
      const apiError: ApiError =
        typeof err === 'object' &&
        err !== null &&
        'type' in err &&
        'message' in err
          ? (err as ApiError)
          : {
              type: 'unknown',
              message: 'ノートの取得に失敗しました。',
            };

      setError(apiError);
      setParsedNote(null);
    } finally {
      setIsLoading(false);
    }
  }, [filePath, connection]);

  // ファイルパスが変わったらノートを再取得する
  useEffect(() => {
    void loadNote();
  }, [loadNote]);

  return {
    parsedNote,
    isLoading,
    error,
    reload: loadNote,
  };
};
