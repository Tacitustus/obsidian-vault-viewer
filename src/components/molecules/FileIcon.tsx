/**
 * @description ファイル種別アイコンコンポーネント（Molecule）
 * ファイルの種類に応じたアイコンを表示する。
 *
 * @param {{ fileType?: FileType; isDirectory?: boolean; isExpanded?: boolean; className?: string }} props
 * @returns {JSX.Element} アイコン要素
 *
 * @example
 * ```tsx
 * <FileIcon fileType="markdown" />
 * <FileIcon isDirectory isExpanded />
 * ```
 */

import { FileText, Image, FileDown, File, Folder, FolderOpen } from 'lucide-react';

import type { FileType } from '@/types/Vault';

interface FileIconProps {
  /** ファイル種別 */
  fileType?: FileType;
  /** ディレクトリかどうか */
  isDirectory?: boolean;
  /** ディレクトリが展開されているかどうか */
  isExpanded?: boolean;
  /** 追加のCSSクラス */
  className?: string;
}

export const FileIcon = ({ fileType, isDirectory, isExpanded, className = '' }: FileIconProps) => {
  // 共通のアイコンサイズクラス
  const iconClass = `w-4 h-4 flex-shrink-0 ${className}`;

  // ディレクトリの場合
  if (isDirectory) {
    return isExpanded ? (
      <FolderOpen className={`${iconClass} text-yellow-500 dark:text-yellow-400`} />
    ) : (
      <Folder className={`${iconClass} text-yellow-500 dark:text-yellow-400`} />
    );
  }

  // ファイル種別に応じたアイコンを返す
  switch (fileType) {
    case 'markdown':
      return <FileText className={`${iconClass} text-primary-500 dark:text-primary-400`} />;
    case 'image':
      return <Image className={`${iconClass} text-green-500 dark:text-green-400`} />;
    case 'pdf':
      return <FileDown className={`${iconClass} text-red-500 dark:text-red-400`} />;
    default:
      return <File className={`${iconClass} text-gray-400 dark:text-gray-500`} />;
  }
};
