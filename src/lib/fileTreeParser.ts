/**
 * @description フラットなファイルパス一覧をネスト構造のツリーに変換するユーティリティ
 * GitHub Git Trees API から取得したフラットなパス一覧を、
 * フォルダの親子関係を持つ TreeNode の配列に変換する。
 */

import type { FileType, GitHubTreeItem, TreeNode } from '@/types/Vault';

/**
 * @description ファイルの拡張子からファイル種別を判定する
 * @param {string} fileName - ファイル名
 * @returns {FileType} ファイル種別
 */
export const getFileType = (fileName: string): FileType => {
  // 拡張子を取得する（小文字に統一）
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

  // Markdown ファイルの判定
  if (extension === 'md' || extension === 'markdown') {
    return 'markdown';
  }

  // 画像ファイルの判定
  const imageExtensions = [
    'png',
    'jpg',
    'jpeg',
    'gif',
    'svg',
    'webp',
    'bmp',
    'ico',
  ];
  if (imageExtensions.includes(extension)) {
    return 'image';
  }

  // PDF ファイルの判定
  if (extension === 'pdf') {
    return 'pdf';
  }

  // その他のファイル
  return 'other';
};

/**
 * @description フラットなファイルパス一覧をネスト構造のツリーノードに変換する
 * GitHub Git Trees API のレスポンスは全ファイルのフラットなパス一覧を返すため、
 * これを再帰的なツリー構造に組み替える。
 *
 * @param {GitHubTreeItem[]} items - GitHub API から取得したフラットなアイテム一覧
 * @returns {TreeNode[]} ネスト構造のファイルツリー
 *
 * @example
 * ```ts
 * const items = [
 *   { path: 'notes/hello.md', type: 'blob', ... },
 *   { path: 'notes/world.md', type: 'blob', ... },
 * ];
 * const tree = buildNestedTree(items);
 * // [{ name: 'notes', isDirectory: true, children: [...] }]
 * ```
 */
export const buildNestedTree = (items: GitHubTreeItem[]): TreeNode[] => {
  // ルートノードを作成する（仮のルートディレクトリ）
  const root: TreeNode = {
    name: '',
    path: '',
    isDirectory: true,
    children: [],
  };

  // 各アイテムをツリーに挿入する
  for (const item of items) {
    // パスをセグメントに分割する
    const segments = item.path.split('/');
    // 現在のノードを追跡する
    let currentNode = root;

    // パスの各セグメントを走査してツリーを構築する
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLastSegment = i === segments.length - 1;
      // ここまでのパスを結合する
      const currentPath = segments.slice(0, i + 1).join('/');

      // 既存の子ノードを探す
      const existingChild = currentNode.children.find(
        (child) => child.name === segment,
      );

      if (existingChild) {
        // 既存のノードが見つかったら、そこを辿る
        currentNode = existingChild;
      } else {
        // 新しいノードを作成する
        const newNode: TreeNode = {
          name: segment,
          path: currentPath,
          isDirectory: !isLastSegment || item.type === 'tree',
          fileType:
            isLastSegment && item.type === 'blob'
              ? getFileType(segment)
              : undefined,
          children: [],
        };

        // 親ノードに子として追加する
        currentNode.children.push(newNode);
        currentNode = newNode;
      }
    }
  }

  // 各ディレクトリの子ノードをソートする（ディレクトリ優先、アルファベット順）
  sortTreeNodes(root.children);

  return root.children;
};

/**
 * @description ツリーノードの子要素を再帰的にソートする
 * ディレクトリを先頭に、その後にファイルをアルファベット順で並べる。
 *
 * @param {TreeNode[]} nodes - ソート対象のノード配列
 */
const sortTreeNodes = (nodes: TreeNode[]): void => {
  // ディレクトリを先頭に、アルファベット順にソートする
  nodes.sort((a, b) => {
    // ディレクトリ同士、またはファイル同士の場合は名前で比較する
    if (a.isDirectory === b.isDirectory) {
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    }
    // ディレクトリを先頭にする
    return a.isDirectory ? -1 : 1;
  });

  // 子ノードも再帰的にソートする
  for (const node of nodes) {
    if (node.isDirectory && node.children.length > 0) {
      sortTreeNodes(node.children);
    }
  }
};

/**
 * @description ツリーノードをフラットな配列に展開する（検索用）
 * @param {TreeNode[]} nodes - ツリーノード配列
 * @returns {TreeNode[]} フラットに展開されたノード配列
 */
export const flattenTree = (nodes: TreeNode[]): TreeNode[] => {
  const result: TreeNode[] = [];

  // 再帰的にノードを展開する
  const flatten = (nodeList: TreeNode[]): void => {
    for (const node of nodeList) {
      result.push(node);
      if (node.isDirectory && node.children.length > 0) {
        flatten(node.children);
      }
    }
  };

  flatten(nodes);
  return result;
};

/**
 * @description 検索クエリでファイルツリーをフィルタする
 * パスとファイル名を検索対象として、マッチするノードを返す。
 * 親ディレクトリも含めて返す（ツリー構造を維持するため）。
 *
 * @param {TreeNode[]} nodes - フィルタ対象のツリーノード
 * @param {string} query - 検索クエリ（大文字小文字を区別しない）
 * @returns {TreeNode[]} フィルタされたツリーノード
 */
export const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
  // 空のクエリの場合はそのまま返す
  if (!query.trim()) {
    return nodes;
  }

  // 検索クエリを小文字に変換する
  const lowerQuery = query.toLowerCase();

  // 再帰的にフィルタする
  const filterNodes = (nodeList: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];

    for (const node of nodeList) {
      if (node.isDirectory) {
        // ディレクトリの場合: 子ノードを再帰的にフィルタし、マッチする子がいれば含める
        const filteredChildren = filterNodes(node.children);
        if (filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren,
          });
        }
      } else {
        // ファイルの場合: パスまたは名前がクエリにマッチすれば含める
        if (
          node.name.toLowerCase().includes(lowerQuery) ||
          node.path.toLowerCase().includes(lowerQuery)
        ) {
          result.push(node);
        }
      }
    }

    return result;
  };

  return filterNodes(nodes);
};
