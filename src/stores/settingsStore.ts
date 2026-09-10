import { create } from 'zustand';
import { fetchVaultSettings, updateVaultSettings } from '@/lib/settingsApi';
import type { PaneSnapshot } from '@/stores/tabStore';

interface SettingsStore {
  /** サイドバーで表示するフォルダパスの配列 */
  sidebarFolders: string[];
  /** サーバーから取得した初期状態のタブ（ペイン構造） */
  openedTabs: PaneSnapshot | null;
  /** ローディング中かどうか */
  isLoading: boolean;
  /** 初期ロードが完了したかどうか */
  isLoaded: boolean;

  /** Vaultの設定をサーバーからロードする */
  loadSettings: (repoKey: string) => Promise<void>;
  /** サイドバーの表示フォルダを設定し、サーバーに保存する */
  setSidebarFolders: (repoKey: string, folders: string[]) => void;
  /** タブ構造のスナップショットをサーバーに保存する */
  saveOpenedTabs: (repoKey: string, paneSnapshot: PaneSnapshot) => void;
}

// デバウンス用のタイマーIDを保持
let saveTabsTimeoutId: ReturnType<typeof setTimeout> | null = null;
let saveFoldersTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const useSettingsStore = create<SettingsStore>((set) => ({
  sidebarFolders: [],
  openedTabs: null,
  isLoading: false,
  isLoaded: false,

  loadSettings: async (repoKey: string) => {
    set({ isLoading: true });
    try {
      const settings = await fetchVaultSettings(repoKey);
      if (settings) {
        set({
          sidebarFolders: settings.sidebar_folders || [],
          openedTabs: settings.opened_tabs || null,
        });
      } else {
        // 設定がない場合はデフォルト
        set({
          sidebarFolders: [],
          openedTabs: null,
        });
      }
    } finally {
      set({ isLoading: false, isLoaded: true });
    }
  },

  setSidebarFolders: (repoKey: string, folders: string[]) => {
    // ローカルのStateを即座に更新する
    set({ sidebarFolders: folders });

    // サーバーへの保存をデバウンス（1秒）
    if (saveFoldersTimeoutId) {
      clearTimeout(saveFoldersTimeoutId);
    }
    saveFoldersTimeoutId = setTimeout(() => {
      void updateVaultSettings(repoKey, { sidebar_folders: folders });
    }, 1000);
  },

  saveOpenedTabs: (repoKey: string, paneSnapshot: PaneSnapshot) => {
    // サーバーへの保存をデバウンス（2秒）してAPIコールを抑える
    if (saveTabsTimeoutId) {
      clearTimeout(saveTabsTimeoutId);
    }
    saveTabsTimeoutId = setTimeout(() => {
      void updateVaultSettings(repoKey, { opened_tabs: paneSnapshot });
    }, 2000);
  },
}));
