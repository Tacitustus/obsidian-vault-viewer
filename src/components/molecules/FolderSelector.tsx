import { FolderTree } from 'lucide-react';

interface FolderSelectorProps {
  /** 選択可能なフォルダパスのリスト */
  folderPaths: string[];
  /** 現在選択されているフォルダパスのリスト */
  selectedFolders: string[];
  /** フォルダ選択状態が変更された時のコールバック */
  onChange: (folders: string[]) => void;
  /** UIをコンパクトに表示するかどうか（デフォルト: false） */
  compact?: boolean;
}

/**
 * @description フォルダを複数選択するためのチェックボックスリストUI（Molecule）
 */
export const FolderSelector = ({
  folderPaths,
  selectedFolders,
  onChange,
  compact = false,
}: FolderSelectorProps) => {
  const handleToggle = (folder: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedFolders, folder]);
    } else {
      onChange(selectedFolders.filter((f) => f !== folder));
    }
  };

  return (
    <div className={`overflow-y-auto space-y-0.5 ${compact ? 'max-h-[120px]' : 'max-h-[240px]'}`}>
      {folderPaths.length === 0 ? (
        <div className="flex items-center gap-2 px-2 py-3 text-sm text-gray-500">
          <FolderTree className="w-4 h-4" />
          <span>フォルダが見つかりません</span>
        </div>
      ) : (
        folderPaths.map((folder) => (
          <label
            key={folder}
            className={`flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded ${
              compact ? 'text-[10px] px-1' : 'text-sm px-2 py-1'
            } text-gray-600 dark:text-gray-400`}
          >
            <input
              type="checkbox"
              checked={selectedFolders.includes(folder)}
              onChange={(e) => handleToggle(folder, e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500/20"
            />
            <span className="truncate">{folder}</span>
          </label>
        ))
      )}
    </div>
  );
};
