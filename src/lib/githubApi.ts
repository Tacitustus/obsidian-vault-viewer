/**
 * @description GitHub REST API のラッパーモジュール
 * GitHub API とのすべての通信をここに集約し、UI コンポーネントが直接 fetch を呼ばない設計にする。
 * 将来の編集機能（PUT /contents/{path}）追加時もこのモジュールに関数を追加するだけで済む。
 */

import { fileContentCache, fileTreeCache } from '@/lib/cache';

import type {
  ApiError,
  GitHubFileContent,
  GitHubTreeResponse,
  VaultConnection,
} from '@/types/Vault';
import { GitHubApiError as GitHubApiErrorClass } from '@/types/Vault';

/** GitHub API のベース URL */
const GITHUB_API_BASE = 'https://api.github.com';

/**
 * @description GitHub API リクエスト用のヘッダーを構築する
 * @param {string} token - Personal Access Token（未指定の場合は認証なし）
 * @returns {HeadersInit} リクエストヘッダー
 */
const buildHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  // トークンが指定されている場合のみ認証ヘッダーを付与する
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * @description HTTP レスポンスからエラー情報を構築する
 * @param {Response} response - fetch レスポンス
 * @returns {ApiError} 構造化されたエラー情報
 */
const buildApiError = (response: Response): ApiError => {
  // レート制限超過の場合
  if (response.status === 403 || response.status === 429) {
    return {
      type: 'rate_limit',
      message:
        'GitHub API のレート制限に達しました。Personal Access Token を設定するか、しばらく待ってから再試行してください。',
      status: response.status,
    };
  }

  // リソースが見つからない場合
  if (response.status === 404) {
    return {
      type: 'not_found',
      message:
        '指定されたリポジトリまたはファイルが見つかりませんでした。owner / repo / branch を確認してください。',
      status: response.status,
    };
  }

  // 認証エラーの場合
  if (response.status === 401) {
    return {
      type: 'unauthorized',
      message: '認証に失敗しました。Personal Access Token を確認してください。',
      status: response.status,
    };
  }

  // その他のエラー
  return {
    type: 'unknown',
    message: `GitHub API エラーが発生しました（ステータスコード: ${String(response.status)}）`,
    status: response.status,
  };
};

/**
 * @description リポジトリ全体のファイルツリーを取得する
 * `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1` を呼び出し、
 * リポジトリ内の全ファイルパス一覧を取得する。
 *
 * @param {VaultConnection} connection - vault 接続情報
 * @returns {Promise<GitHubTreeResponse>} ファイルツリーレスポンス
 * @throws {ApiError} API エラー発生時
 */
export const fetchTree = async (connection: VaultConnection): Promise<GitHubTreeResponse> => {
  // キャッシュキーを生成する
  const cacheKey = `${connection.owner}/${connection.repo}/${connection.branch}`;

  // キャッシュにデータがある場合はそれを返す
  const cached = fileTreeCache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as GitHubTreeResponse;
  }

  // GitHub API にリクエストを送信する
  const url = `${GITHUB_API_BASE}/repos/${connection.owner}/${connection.repo}/git/trees/${connection.branch}?recursive=1`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: buildHeaders(connection.token),
    });
  } catch {
    // ネットワークエラーの場合
    throw new GitHubApiErrorClass({
      type: 'network',
      message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
    });
  }

  // レスポンスが正常でない場合はエラーをスローする
  if (!response.ok) {
    throw new GitHubApiErrorClass(buildApiError(response));
  }

  // レスポンスを JSON としてパースする
  const data = (await response.json()) as GitHubTreeResponse;

  // キャッシュに保存する
  fileTreeCache.set(cacheKey, JSON.stringify(data));

  return data;
};

/**
 * @description 個別ファイルの内容を取得する
 * `GET /repos/{owner}/{repo}/contents/{path}?ref={branch}` を呼び出し、
 * ファイルの base64 エンコードされた内容を取得する。
 *
 * @param {VaultConnection} connection - vault 接続情報
 * @param {string} filePath - ファイルパス
 * @returns {Promise<GitHubFileContent>} ファイルコンテンツレスポンス
 * @throws {ApiError} API エラー発生時
 */
export const fetchFileContent = async (
  connection: VaultConnection,
  filePath: string,
): Promise<GitHubFileContent> => {
  // キャッシュキーを生成する
  const cacheKey = `${connection.owner}/${connection.repo}/${connection.branch}/${filePath}`;

  // キャッシュにデータがある場合はそれを返す
  const cached = fileContentCache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as GitHubFileContent;
  }

  // GitHub API にリクエストを送信する
  const url = `${GITHUB_API_BASE}/repos/${connection.owner}/${connection.repo}/contents/${filePath}?ref=${connection.branch}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: buildHeaders(connection.token),
    });
  } catch {
    // ネットワークエラーの場合
    throw new GitHubApiErrorClass({
      type: 'network',
      message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
    });
  }

  // レスポンスが正常でない場合はエラーをスローする
  if (!response.ok) {
    throw new GitHubApiErrorClass(buildApiError(response));
  }

  // レスポンスを JSON としてパースする
  const data = (await response.json()) as GitHubFileContent;

  // キャッシュに保存する
  fileContentCache.set(cacheKey, JSON.stringify(data));

  return data;
};

/**
 * @description base64 エンコードされたファイル内容をデコードする
 * GitHub Contents API は base64 でファイル内容を返すため、テキストに変換する。
 *
 * @param {string} base64Content - base64 エンコードされた文字列
 * @returns {string} デコードされたテキスト
 */
export const decodeBase64Content = (base64Content: string): string => {
  // base64 文字列内の改行を除去してからデコードする
  const cleaned = base64Content.replace(/\n/g, '');
  // バイナリ文字列にデコードする
  const binaryString = atob(cleaned);
  // UTF-8 バイト列に変換する
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  // UTF-8 テキストとしてデコードする
  return new TextDecoder('utf-8').decode(bytes);
};

/**
 * @description 画像ファイルの表示用URLを生成する
 * 公開リポジトリでは raw.githubusercontent.com の生URL を使用し、
 * プライベートリポジトリ（PAT指定時）ではContents APIのbase64を使用する。
 *
 * @param {VaultConnection} connection - vault 接続情報
 * @param {string} filePath - ファイルパス
 * @returns {string} 画像の表示用URL（公開リポジトリの場合）
 */
export const buildRawImageUrl = (connection: VaultConnection, filePath: string): string => {
  return `https://raw.githubusercontent.com/${connection.owner}/${connection.repo}/${connection.branch}/${filePath}`;
};

/**
 * @description 画像ファイルの base64 データURL を生成する
 * プライベートリポジトリ向け。Contents API から取得した base64 データを data: URL に変換する。
 *
 * @param {GitHubFileContent} fileContent - GitHub Contents API レスポンス
 * @returns {string} data: URL 形式の画像データ
 */
export const buildBase64ImageUrl = (fileContent: GitHubFileContent): string => {
  // ファイル名から MIME タイプを推定する
  const extension = fileContent.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
  };
  const mimeType = mimeTypes[extension] ?? 'application/octet-stream';

  // base64 内の改行を除去して data: URL を構築する
  const cleanedContent = fileContent.content.replace(/\n/g, '');
  return `data:${mimeType};base64,${cleanedContent}`;
};
