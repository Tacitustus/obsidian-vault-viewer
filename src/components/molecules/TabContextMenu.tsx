/**
 * @description タブの右クリックコンテキストメニューコンポーネント（Molecule）
 * タブの分割・閉じる操作を提供するドロップダウンメニュー。
 *
 * @param {{ x: number; y: number; tabId: string; paneId: string; onClose: () => void }} props
 * @returns {JSX.Element} コンテキストメニュー要素
 *
 * @example
 * ```tsx
 * <TabContextMenu x={100} y={200} tabId="tab-1" paneId="pane-1" onClose={() => {}} />
 * ```
 */

import { useEffect, useRef } from 'react';
import { Columns2, Rows2, X, XCircle } from 'lucide-react';

import { useTabStore } from '@/stores/tabStore';

interface TabContextMenuProps {
  /** メニューの表示X座標 */
  x: number;
  /** メニューの表示Y座標 */
  y: number;
  /** 対象タブのID */
  tabId: string;
  /** 対象ペインのID */
  paneId: string;
  /** メニューを閉じるコールバック */
  onClose: () => void;
}

/**
 * @description メニューアイテムの型
 */
interface MenuItem {
  /** ラベル */
  label: string;
  /** アイコン */
  icon: React.ReactNode;
  /** クリック時のアクション */
  action: () => void;
  /** 区切り線を上に表示するか */
  separator?: boolean;
}

export const TabContextMenu = ({ x, y, tabId, paneId, onClose }: TabContextMenuProps) => {
  // タブストアからアクションを取得する
  const splitPane = useTabStore((state) => state.splitPane);
  const closeTab = useTabStore((state) => state.closeTab);
  const closeOtherTabs = useTabStore((state) => state.closeOtherTabs);

  // メニュー外クリックで閉じるための ref
  const menuRef = useRef<HTMLDivElement>(null);

  // メニュー外クリック・Escape キーでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // イベントリスナーを登録する
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // メニューアイテム定義
  const menuItems: MenuItem[] = [
    {
      label: '右に分割',
      icon: <Columns2 className="w-3.5 h-3.5" />,
      action: () => {
        splitPane(paneId, 'horizontal', tabId);
        onClose();
      },
    },
    {
      label: '下に分割',
      icon: <Rows2 className="w-3.5 h-3.5" />,
      action: () => {
        splitPane(paneId, 'vertical', tabId);
        onClose();
      },
    },
    {
      label: '閉じる',
      icon: <X className="w-3.5 h-3.5" />,
      action: () => {
        closeTab(tabId, paneId);
        onClose();
      },
      separator: true,
    },
    {
      label: '他をすべて閉じる',
      icon: <XCircle className="w-3.5 h-3.5" />,
      action: () => {
        closeOtherTabs(tabId, paneId);
        onClose();
      },
    },
  ];

  // 画面外にはみ出さないようにメニュー位置を調整する
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 200);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl shadow-black/10 dark:shadow-black/30 py-1 animate-fade-in"
      style={{ left: adjustedX, top: adjustedY }}
      role="menu"
    >
      {menuItems.map((item) => (
        <div key={item.label}>
          {/* 区切り線 */}
          {item.separator && <div className="my-1 border-t border-gray-200 dark:border-gray-700" />}

          {/* メニューアイテム */}
          <button
            className="flex items-center gap-2.5 w-full px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150"
            onClick={item.action}
            role="menuitem"
          >
            {item.icon}
            {item.label}
          </button>
        </div>
      ))}
    </div>
  );
};
