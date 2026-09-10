/**
 * @description Obsidian Vault Viewer で使用する型定義
 * GitHub API レスポンス、ファイルツリー、ノートコンテンツ、リンク解決に関する型を定義する
 */

// ============================================================
// GitHub API レスポンス型
// ============================================================

/**
 * @description GitHub Git Trees API のレスポンスに含まれる個別アイテム
 */
export interface GitHubTreeItem {
  /** ファイルまたはディレクトリのパス */
  path: string;
  /** アイテムの種類（'blob' = ファイル, 'tree' = ディレクトリ） */
  mode: string;
  /** アイテムの種類 */
  type: 'blob' | 'tree';
  /** SHA ハッシュ */
  sha: string;
  /** ファイルサイズ（バイト）。ディレクトリの場合は undefined */
  size?: number;
  /** API の URL */
  url: string;
}

/**
 * @description GitHub Git Trees API のレスポンス全体
 */
export interface GitHubTreeResponse {
  /** ツリーの SHA */
  sha: string;
  /** ツリーのアイテム一覧 */
  tree: GitHubTreeItem[];
  /** ツリーが切り詰められたかどうか（ファイル数が多すぎる場合） */
  truncated: boolean;
  /** API の URL */
  url: string;
}

/**
 * @description GitHub Contents API のレスポンス（個別ファイル）
 */
export interface GitHubFileContent {
  /** ファイル名 */
  name: string;
  /** ファイルパス */
  path: string;
  /** SHA ハッシュ */
  sha: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** API の URL */
  url: string;
  /** HTML 表示用 URL */
  html_url: string;
  /** Git blob URL */
  git_url: string;
  /** ダウンロード URL */
  download_url: string | null;
  /** コンテンツの種類 */
  type: 'file';
  /** base64 エンコードされたファイル内容 */
  content: string;
  /** エンコーディング形式 */
  encoding: 'base64';
}

// ============================================================
// ファイルツリー構造
// ============================================================

/**
 * @description ファイルの種別を表す列挙型
 */
export type FileType = 'markdown' | 'image' | 'pdf' | 'other';

/**
 * @description ネスト構造のファイルツリーノード
 */
export interface TreeNode {
  /** ノード名（ファイル名 or ディレクトリ名） */
  name: string;
  /** リポジトリルートからの相対パス */
  path: string;
  /** ディレクトリかどうか */
  isDirectory: boolean;
  /** ファイルの種別（ディレクトリの場合は undefined） */
  fileType?: FileType;
  /** 子ノード（ディレクトリの場合のみ） */
  children: TreeNode[];
}

// ============================================================
// アプリケーション設定型（Supabase vault_settings）
// ============================================================

import type { PaneSnapshot } from '@/stores/tabStore';

/**
 * @description Vaultごとの共有設定（Supabaseの vault_settings テーブルに対応）
 */
export interface VaultSettings {
  /** リポジトリキー（"owner/repo"） */
  repo_key: string;
  /** サイドバーで表示を許可するフォルダパスの配列（空の場合はすべて表示） */
  sidebar_folders: string[];
  /** 開いているタブ（ペイン構造全体）のJSONスナップショット */
  opened_tabs: PaneSnapshot | null;
  /** 最終更新日時 */
  updated_at?: string;
}

// ============================================================
// Vault 接続設定
// ============================================================

/**
 * @description Vault への接続情報
 */
export interface VaultConnection {
  /** リポジトリオーナー名 */
  owner: string;
  /** リポジトリ名 */
  repo: string;
  /** ブランチ名 */
  branch: string;
  /** Personal Access Token（オプション） */
  token?: string;
}

// ============================================================
// ノートコンテンツ
// ============================================================

/**
 * @description YAML フロントマターのデータ構造
 * キーは文字列、値は様々な型を取り得る
 */
export type FrontmatterData = Record<string, unknown>;

/**
 * @description パース済みのノートコンテンツ
 */
export interface ParsedNote {
  /** Markdown 本文（フロントマター除去済み） */
  body: string;
  /** パース済みフロントマター */
  frontmatter: FrontmatterData;
  /** 本文中から抽出されたタグ一覧 */
  tags: string[];
}

// ============================================================
// Wikilink 解決
// ============================================================

/**
 * @description Wikilink の解決結果
 */
export interface ResolvedLink {
  /** 解決成功かどうか */
  isResolved: boolean;
  /** 解決されたファイルパス（未解決の場合は undefined） */
  resolvedPath?: string;
  /** 元のターゲット文字列 */
  target: string;
  /** エイリアス（表示名、指定がない場合は undefined） */
  alias?: string;
  /** 見出し参照（`#heading` 部分、あれば） */
  heading?: string;
}

/**
 * @description Embed の種別
 */
export type EmbedType = 'note' | 'image' | 'pdf' | 'other';

/**
 * @description Embed の解決結果
 */
export interface ResolvedEmbed {
  /** 解決成功かどうか */
  isResolved: boolean;
  /** 解決されたファイルパス（未解決の場合は undefined） */
  resolvedPath?: string;
  /** 元のターゲット文字列 */
  target: string;
  /** Embed の種別 */
  embedType: EmbedType;
  /** 画像の幅指定（ピクセル、あれば） */
  width?: number;
}

// ============================================================
// API エラー
// ============================================================

/**
 * @description GitHub API エラーの種別
 */
export type ApiErrorType =
  | 'rate_limit'
  | 'not_found'
  | 'unauthorized'
  | 'network'
  | 'unknown';

/**
 * @description GitHub API エラー情報
 */
export interface ApiError {
  /** エラー種別 */
  type: ApiErrorType;
  /** ユーザー向けメッセージ */
  message: string;
  /** HTTP ステータスコード（ネットワークエラー時は undefined） */
  status?: number;
}

/**
 * @description 例外としてスローするためのエラークラス
 */
export class GitHubApiError extends Error implements ApiError {
  public type: ApiErrorType;
  public status?: number;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'GitHubApiError';
    this.type = error.type;
    this.status = error.status;
  }
}

// ============================================================
// ストア状態
// ============================================================

/**
 * @description Vault ストアの状態
 */
export interface VaultState {
  /** 接続情報 */
  connection: VaultConnection | null;
  /** ファイルツリー（フラットなパス一覧） */
  flatTree: GitHubTreeItem[];
  /** ネスト構造のファイルツリー */
  nestedTree: TreeNode[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー情報 */
  error: ApiError | null;
  /** 接続済みかどうか */
  isConnected: boolean;
}

/**
 * @description Vault ストアのアクション
 */
export interface VaultActions {
  /** vault に接続する */
  connect: (connection: VaultConnection) => Promise<void>;
  /** vault から切断する */
  disconnect: () => void;
  /** エラーをクリアする */
  clearError: () => void;
}
