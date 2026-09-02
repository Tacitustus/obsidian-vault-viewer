/**
 * @description アプリケーション全体で使用する定数値を定義するファイル
 */

/** アプリケーション名 */
export const APP_NAME = 'Obsidian Vault Viewer';

/** アプリケーションの説明 */
export const APP_DESCRIPTION = 'ObsidianのVaultをブラウザ上で閲覧するためのアプリケーション';

/** レスポンシブブレークポイント（TailwindCSS のデフォルトに準拠） */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;
