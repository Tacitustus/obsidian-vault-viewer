import { create } from 'zustand';

/**
 * @description テーマストアの型定義
 */
interface ThemeState {
  /** ダークモードが有効かどうか */
  isDarkMode: boolean;
  /** ダークモードの切り替えを行う */
  toggleDarkMode: () => void;
  /** ダークモードを明示的に設定する */
  setDarkMode: (isDark: boolean) => void;
}

/**
 * @description テーマ（ダークモード）の状態を管理するZustandストア
 * システムのカラースキーム設定を初期値として使用し、
 * ユーザーの切り替え操作を反映する。
 *
 * @returns {ThemeState} テーマの状態と操作関数
 *
 * @example
 * ```tsx
 * const { isDarkMode, toggleDarkMode } = useThemeStore();
 * ```
 */
export const useThemeStore = create<ThemeState>((set) => ({
  // システムのカラースキーム設定を初期値として使用する
  isDarkMode:
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,

  // ダークモードの切り替えを行う
  toggleDarkMode: () => {
    set((state) => {
      const newIsDarkMode = !state.isDarkMode;
      // HTML要素のクラスを更新してTailwindCSSのダークモードを切り替える
      applyDarkModeClass(newIsDarkMode);
      return { isDarkMode: newIsDarkMode };
    });
  },

  // ダークモードを明示的に設定する
  setDarkMode: (isDark: boolean) => {
    applyDarkModeClass(isDark);
    set({ isDarkMode: isDark });
  },
}));

/**
 * @description HTML要素にダークモードクラスを適用・削除するヘルパー関数
 * @param {boolean} isDark - ダークモードが有効かどうか
 */
const applyDarkModeClass = (isDark: boolean): void => {
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

// 初期化時にシステム設定に基づいてダークモードクラスを適用する
if (typeof window !== 'undefined') {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyDarkModeClass(isDark);
}
