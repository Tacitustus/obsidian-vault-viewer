/**
 * @description タブとペイン分割の状態を管理する Zustand ストア
 * VSCode ライクな複数タブ・ペイン分割を実現する。
 * ペインは再帰的なツリー構造で管理し、上下左右の分割をサポートする。
 *
 * @returns {TabStore} タブ・ペインの状態と操作関数
 *
 * @example
 * ```tsx
 * const { rootPane, openTab, splitPane, closeTab } = useTabStore();
 * ```
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';

// ============================================================
// 型定義
// ============================================================

/**
 * @description タブの情報
 */
export interface Tab {
  /** タブの一意ID */
  id: string;
  /** ノートのファイルパス */
  filePath: string;
  /** タブに表示するタイトル（ファイル名） */
  title: string;
}

/**
 * @description リーフペイン（タブを含む末端ペイン）
 */
export interface LeafPane {
  /** ペインの種別 */
  type: 'leaf';
  /** ペインの一意ID */
  id: string;
  /** このペインに含まれるタブ一覧 */
  tabs: Tab[];
  /** アクティブなタブのID */
  activeTabId: string | null;
}

/**
 * @description 分割ペイン（子ペインを含む中間ノード）
 */
export interface SplitPane {
  /** ペインの種別 */
  type: 'split';
  /** ペインの一意ID */
  id: string;
  /** 分割方向: horizontal（左右） / vertical（上下） */
  direction: 'horizontal' | 'vertical';
  /** 子ペイン一覧 */
  children: PaneNode[];
  /** 各子ペインのサイズ比率（パーセント） */
  sizes: number[];
}

/**
 * @description ペインノード（リーフまたは分割）
 */
export type PaneNode = LeafPane | SplitPane;

/**
 * @description タブストアの状態とアクションの型定義
 */
interface TabStore {
  /** ルートペインノード */
  rootPane: PaneNode;
  /** 最後にフォーカスされたペインID */
  activePaneId: string;
  /** タブを開く（既存タブがあればフォーカス） */
  openTab: (filePath: string, paneId?: string) => void;
  /** タブを閉じる */
  closeTab: (tabId: string, paneId: string) => void;
  /** アクティブタブを切り替える */
  setActiveTab: (tabId: string, paneId: string) => void;
  /** ペインを分割する */
  splitPane: (paneId: string, direction: 'horizontal' | 'vertical', tabId?: string) => void;
  /** タブを別ペインに移動する */
  moveTab: (tabId: string, fromPaneId: string, toPaneId: string) => void;
  /** アクティブペインを設定する */
  setActivePane: (paneId: string) => void;
  /** 現在アクティブなタブのファイルパスを取得する */
  getActiveFilePath: () => string | null;
  /** ペインのリサイズ比率を更新する */
  updatePaneSizes: (splitPaneId: string, sizes: number[]) => void;
  /** 他のタブを全て閉じる */
  closeOtherTabs: (tabId: string, paneId: string) => void;
}

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * @description ファイルパスからタブタイトルを生成する
 * @param {string} filePath - ファイルパス
 * @returns {string} タブタイトル
 */
const createTabTitle = (filePath: string): string => {
  // タブのタイトルはファイルパスのベース名にする（URLエンコードされている場合を考慮）
  const decodedPath = decodeURIComponent(filePath);
  return decodedPath.split('/').pop()?.replace(/\.(md|markdown)$/, '') ?? decodedPath;
};

/**
 * @description ペインツリー内の特定ペインを更新する再帰関数
 * @param {PaneNode} node - 現在のノード
 * @param {string} targetId - 更新対象のペインID
 * @param {(pane: PaneNode) => PaneNode | null} updater - 更新関数（null を返すと削除）
 * @returns {PaneNode | null} 更新後のノード
 */
const updatePaneInTree = (
  node: PaneNode,
  targetId: string,
  updater: (pane: PaneNode) => PaneNode | null,
): PaneNode | null => {
  // 対象ノードが見つかった場合
  if (node.id === targetId) {
    return updater(node);
  }

  // 分割ペインの場合は子ノードを再帰的に探索する
  if (node.type === 'split') {
    const newChildren: PaneNode[] = [];
    const newSizes: number[] = [];

    for (let i = 0; i < node.children.length; i++) {
      const updated = updatePaneInTree(node.children[i], targetId, updater);
      if (updated !== null) {
        newChildren.push(updated);
        newSizes.push(node.sizes[i]);
      }
    }

    // 子が0個になったらこのノードも削除する
    if (newChildren.length === 0) {
      return null;
    }

    // 子が1個になったらその子で置き換える（不要な分割を除去）
    if (newChildren.length === 1) {
      return newChildren[0];
    }

    // サイズを正規化する（合計100%にする）
    const totalSize = newSizes.reduce((a, b) => a + b, 0);
    const normalizedSizes = newSizes.map((s) => (s / totalSize) * 100);

    return {
      ...node,
      children: newChildren,
      sizes: normalizedSizes,
    };
  }

  return node;
};

/**
 * @description ペインツリー内の特定ペインを検索する
 * @param {PaneNode} node - 現在のノード
 * @param {string} paneId - 検索対象のペインID
 * @returns {LeafPane | undefined} 見つかったリーフペイン
 */
const findLeafPane = (node: PaneNode, paneId: string): LeafPane | undefined => {
  if (node.type === 'leaf' && node.id === paneId) {
    return node;
  }
  if (node.type === 'split') {
    for (const child of node.children) {
      const found = findLeafPane(child, paneId);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * @description ペインツリー内で特定ファイルパスを持つタブを検索する
 * @param {PaneNode} node - 現在のノード
 * @param {string} filePath - 検索対象のファイルパス
 * @returns {{ paneId: string; tabId: string } | undefined} 見つかったタブ情報
 */
const findTabByFilePath = (
  node: PaneNode,
  filePath: string,
): { paneId: string; tabId: string } | undefined => {
  if (node.type === 'leaf') {
    const tab = node.tabs.find((t) => t.filePath === filePath);
    if (tab) {
      return { paneId: node.id, tabId: tab.id };
    }
  }
  if (node.type === 'split') {
    for (const child of node.children) {
      const found = findTabByFilePath(child, filePath);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * @description 最初のリーフペインを見つける
 * @param {PaneNode} node - 現在のノード
 * @returns {LeafPane | undefined} 最初のリーフペイン
 */
const findFirstLeafPane = (node: PaneNode): LeafPane | undefined => {
  if (node.type === 'leaf') return node;
  if (node.type === 'split' && node.children.length > 0) {
    return findFirstLeafPane(node.children[0]);
  }
  return undefined;
};

// ============================================================
// 初期ペインID
// ============================================================

/** 初期ペインのID */
const INITIAL_PANE_ID = nanoid();

// ============================================================
// ストア
// ============================================================

export const useTabStore = create<TabStore>((set, get) => ({
  // 初期状態: 空のリーフペインが1つ
  rootPane: {
    type: 'leaf',
    id: INITIAL_PANE_ID,
    tabs: [],
    activeTabId: null,
  },
  activePaneId: INITIAL_PANE_ID,

  // タブを開く
  openTab: (filePath: string, paneId?: string) => {
    const state = get();

    // 既に同じファイルが開かれているか確認する
    const existing = findTabByFilePath(state.rootPane, filePath);
    if (existing) {
      // 既存タブをアクティブにする
      set((prev) => ({
        rootPane: updatePaneInTree(prev.rootPane, existing.paneId, (pane) => {
          if (pane.type !== 'leaf') return pane;
          return { ...pane, activeTabId: existing.tabId };
        }) ?? prev.rootPane,
        activePaneId: existing.paneId,
      }));
      return;
    }

    // ターゲットペインを決定する（指定なしの場合はアクティブペイン）
    const targetPaneId = paneId ?? state.activePaneId;

    // 新しいタブを作成する
    const newTab: Tab = {
      id: nanoid(),
      filePath,
      title: createTabTitle(filePath),
    };

    // ペインにタブを追加する
    set((prev) => ({
      rootPane: updatePaneInTree(prev.rootPane, targetPaneId, (pane) => {
        if (pane.type !== 'leaf') return pane;
        return {
          ...pane,
          tabs: [...pane.tabs, newTab],
          activeTabId: newTab.id,
        };
      }) ?? prev.rootPane,
      activePaneId: targetPaneId,
    }));
  },

  // タブを閉じる
  closeTab: (tabId: string, paneId: string) => {
    set((prev) => {
      const updated = updatePaneInTree(prev.rootPane, paneId, (pane) => {
        if (pane.type !== 'leaf') return pane;

        // タブを除去する
        const newTabs = pane.tabs.filter((t) => t.id !== tabId);

        // タブが全て閉じられた場合
        if (newTabs.length === 0) {
          // ルートペインの場合は空のペインを残す
          if (prev.rootPane.id === paneId) {
            return { ...pane, tabs: [], activeTabId: null };
          }
          // それ以外のペインは削除する
          return null;
        }

        // アクティブタブが閉じられた場合は隣のタブをアクティブにする
        let newActiveTabId = pane.activeTabId;
        if (pane.activeTabId === tabId) {
          const closedIndex = pane.tabs.findIndex((t) => t.id === tabId);
          const newIndex = Math.min(closedIndex, newTabs.length - 1);
          newActiveTabId = newTabs[newIndex].id;
        }

        return { ...pane, tabs: newTabs, activeTabId: newActiveTabId };
      });

      // ルートが null になった場合はフォールバック
      if (!updated) {
        const newId = nanoid();
        return {
          rootPane: { type: 'leaf' as const, id: newId, tabs: [], activeTabId: null },
          activePaneId: newId,
        };
      }

      // アクティブペインが存在しなくなった場合、最初のリーフペインに設定する
      let newActivePaneId = prev.activePaneId;
      if (!findLeafPane(updated, prev.activePaneId)) {
        const firstLeaf = findFirstLeafPane(updated);
        if (firstLeaf) {
          newActivePaneId = firstLeaf.id;
        }
      }

      return { rootPane: updated, activePaneId: newActivePaneId };
    });
  },

  // アクティブタブを切り替える
  setActiveTab: (tabId: string, paneId: string) => {
    set((prev) => ({
      rootPane: updatePaneInTree(prev.rootPane, paneId, (pane) => {
        if (pane.type !== 'leaf') return pane;
        return { ...pane, activeTabId: tabId };
      }) ?? prev.rootPane,
      activePaneId: paneId,
    }));
  },

  // ペインを分割する
  splitPane: (paneId: string, direction: 'horizontal' | 'vertical', tabId?: string) => {
    set((prev) => {
      const updated = updatePaneInTree(prev.rootPane, paneId, (pane) => {
        if (pane.type !== 'leaf') return pane;

        // 分割元のタブを決定する
        const tabToMove = tabId
          ? pane.tabs.find((t) => t.id === tabId)
          : pane.activeTabId
            ? pane.tabs.find((t) => t.id === pane.activeTabId)
            : null;

        // 新しいペインを作成する
        const newPaneId = nanoid();
        const newPane: LeafPane = {
          type: 'leaf',
          id: newPaneId,
          tabs: tabToMove ? [{ ...tabToMove }] : [],
          activeTabId: tabToMove?.id ?? null,
        };

        // 元のペインからタブを移動する場合
        let originalPane = pane;
        if (tabToMove) {
          const remainingTabs = pane.tabs.filter((t) => t.id !== tabToMove.id);
          const newActiveTabId = remainingTabs.length > 0
            ? (pane.activeTabId === tabToMove.id
              ? remainingTabs[0].id
              : pane.activeTabId)
            : null;
          originalPane = {
            ...pane,
            tabs: remainingTabs,
            activeTabId: newActiveTabId,
          };
        }

        // 分割ペインを作成する
        const splitPane: SplitPane = {
          type: 'split',
          id: nanoid(),
          direction,
          children: [originalPane, newPane],
          sizes: [50, 50],
        };

        return splitPane;
      });

      return {
        rootPane: updated ?? prev.rootPane,
      };
    });
  },

  // タブを別ペインに移動する
  moveTab: (tabId: string, fromPaneId: string, toPaneId: string) => {
    const state = get();

    // 移動元のペインからタブを取得する
    const fromPane = findLeafPane(state.rootPane, fromPaneId);
    if (!fromPane) return;

    const tab = fromPane.tabs.find((t) => t.id === tabId);
    if (!tab) return;

    // タブを移動元から削除し、移動先に追加する
    get().closeTab(tabId, fromPaneId);
    get().openTab(tab.filePath, toPaneId);
  },

  // アクティブペインを設定する
  setActivePane: (paneId: string) => {
    set({ activePaneId: paneId });
  },

  // 現在アクティブなタブのファイルパスを取得する
  getActiveFilePath: (): string | null => {
    const state = get();
    const pane = findLeafPane(state.rootPane, state.activePaneId);
    if (!pane || !pane.activeTabId) return null;
    const tab = pane.tabs.find((t) => t.id === pane.activeTabId);
    return tab?.filePath ?? null;
  },

  // ペインのリサイズ比率を更新する
  updatePaneSizes: (splitPaneId: string, sizes: number[]) => {
    set((prev) => ({
      rootPane: updatePaneInTree(prev.rootPane, splitPaneId, (pane) => {
        if (pane.type !== 'split') return pane;
        return { ...pane, sizes };
      }) ?? prev.rootPane,
    }));
  },

  // 他のタブを全て閉じる
  closeOtherTabs: (tabId: string, paneId: string) => {
    set((prev) => ({
      rootPane: updatePaneInTree(prev.rootPane, paneId, (pane) => {
        if (pane.type !== 'leaf') return pane;
        const keepTab = pane.tabs.find((t) => t.id === tabId);
        if (!keepTab) return pane;
        return { ...pane, tabs: [keepTab], activeTabId: keepTab.id };
      }) ?? prev.rootPane,
    }));
  },
}));
