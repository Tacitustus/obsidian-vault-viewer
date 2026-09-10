/**
 * @description 再帰的ペインコンテナコンポーネント（Organism）
 * PaneNode のツリーを走査し、react-resizable-panels でリサイズ可能なペインを構築する。
 * リーフペインはタブバー + NoteContent を表示し、分割ペインは子ペインを再帰的にレンダリングする。
 *
 * @returns {JSX.Element} ペインコンテナ要素
 *
 * @example
 * ```tsx
 * <PaneContainer />
 * ```
 */

import { useState, useCallback } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';

import { useTabStore } from '@/stores/tabStore';
import { TabBar } from '@/components/molecules/TabBar';
import { TabContextMenu } from '@/components/molecules/TabContextMenu';
import { NoteContent } from '@/components/organisms/NoteContent';

import type { PaneNode, LeafPane, SplitPane } from '@/stores/tabStore';

/**
 * @description コンテキストメニューの状態
 */
interface ContextMenuState {
  /** メニュー表示X座標 */
  x: number;
  /** メニュー表示Y座標 */
  y: number;
  /** 対象タブID */
  tabId: string;
  /** 対象ペインID */
  paneId: string;
}

/**
 * @description リーフペインのレンダリングコンポーネント
 */
const LeafPaneRenderer = ({
  pane,
  onContextMenu,
}: {
  pane: LeafPane;
  onContextMenu: (e: React.MouseEvent, tabId: string, paneId: string) => void;
}) => {
  // アクティブタブのファイルパスを取得する
  const activeTab = pane.tabs.find((t) => t.id === pane.activeTabId);
  const activeFilePath = activeTab?.filePath ?? null;

  // ペインフォーカス
  const setActivePane = useTabStore((state) => state.setActivePane);

  return (
    <div
      className="flex flex-col h-full"
      onPointerDownCapture={() => setActivePane(pane.id)}
      onFocusCapture={() => setActivePane(pane.id)}
      role="tabpanel"
      tabIndex={-1}
    >
      {/* タブバー */}
      <TabBar
        paneId={pane.id}
        tabs={pane.tabs}
        activeTabId={pane.activeTabId}
        onContextMenu={(e, tabId) => onContextMenu(e, tabId, pane.id)}
      />

      {/* ノートコンテンツ */}
      <div className="flex-1 overflow-y-auto">
        <NoteContent filePath={activeFilePath} />
      </div>
    </div>
  );
};

/**
 * @description 分割ペインのレンダリングコンポーネント
 */
const SplitPaneRenderer = ({
  pane,
  onContextMenu,
}: {
  pane: SplitPane;
  onContextMenu: (e: React.MouseEvent, tabId: string, paneId: string) => void;
}) => {
  return (
    <Group
      orientation={pane.direction}
      className="h-full"
    >
      {pane.children.map((child, index) => (
        <div key={child.id} className="contents">
          {/* パネル */}
          <Panel
            defaultSize={`${String(pane.sizes[index])}%`}
            minSize={50}
          >
            <PaneNodeRenderer
              node={child}
              onContextMenu={onContextMenu}
            />
          </Panel>

          {/* リサイズハンドル（最後の子以外に表示） */}
          {index < pane.children.length - 1 && (
            <Separator
              className={`group relative flex items-center justify-center ${
                pane.direction === 'horizontal' ? 'w-1.5' : 'h-1.5'
              } bg-gray-200/50 dark:bg-gray-700/50 hover:bg-primary-400/50 dark:hover:bg-primary-500/50 transition-colors duration-150`}
            />
          )}
        </div>
      ))}
    </Group>
  );
};

/**
 * @description ペインノードの再帰レンダラー
 */
const PaneNodeRenderer = ({
  node,
  onContextMenu,
}: {
  node: PaneNode;
  onContextMenu: (e: React.MouseEvent, tabId: string, paneId: string) => void;
}) => {
  if (node.type === 'leaf') {
    return <LeafPaneRenderer pane={node} onContextMenu={onContextMenu} />;
  }
  return <SplitPaneRenderer pane={node} onContextMenu={onContextMenu} />;
};

/**
 * @description ペインコンテナのルートコンポーネント
 */
export const PaneContainer = () => {
  // タブストアからルートペインを取得する
  const rootPane = useTabStore((state) => state.rootPane);

  // コンテキストメニューの状態
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // コンテキストメニューを表示するハンドラー
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, tabId: string, paneId: string) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        tabId,
        paneId,
      });
    },
    [],
  );

  // コンテキストメニューを閉じるハンドラー
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <div className="h-full relative">
      {/* ペインツリーのレンダリング */}
      <PaneNodeRenderer
        node={rootPane}
        onContextMenu={handleContextMenu}
      />

      {/* コンテキストメニュー */}
      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          tabId={contextMenu.tabId}
          paneId={contextMenu.paneId}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
};
