/**
 * @description Obsidian のwikilink・embed記法をパースする自前 remark プラグイン
 *
 * 以下の記法を MDAST カスタムノードに変換する:
 * - `[[Note]]` → wikiLink ノード
 * - `[[Note|Alias]]` → wikiLink ノード（alias 付き）
 * - `[[Note#heading]]` → wikiLink ノード（heading 付き）
 * - `![[Note]]` → wikiEmbed ノード
 * - `![[image.png]]` → wikiEmbed ノード（type: image）
 * - `![[image.png|300]]` → wikiEmbed ノード（type: image, width 付き）
 *
 * react-markdown の remarkPlugins に渡して使用する。
 */

import type { Root, RootContent, PhrasingContent } from 'mdast';
import type { Plugin } from 'unified';

// ============================================================
// カスタム MDAST ノード型定義
// ============================================================

/**
 * @description Wikilink のカスタム MDAST ノード
 */
export interface WikiLinkNode {
  type: 'wikiLink';
  data: {
    hName: string;
    hProperties: {
      target: string;
      alias?: string;
      heading?: string;
      className: string;
    };
  };
  children: Array<{ type: 'text'; value: string }>;
}

/**
 * @description Embed のカスタム MDAST ノード
 */
export interface WikiEmbedNode {
  type: 'wikiEmbed';
  data: {
    hName: string;
    hProperties: {
      target: string;
      embedType: string;
      width?: number;
      className: string;
    };
  };
  children: [];
}

// ============================================================
// 画像拡張子の判定
// ============================================================

/** 画像として認識する拡張子の一覧 */
const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'bmp',
  'ico',
]);

/** PDF として認識する拡張子 */
const PDF_EXTENSION = 'pdf';

/**
 * @description ファイル名から拡張子を取得する（小文字）
 * @param {string} fileName - ファイル名
 * @returns {string} 小文字の拡張子
 */
const getExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? '') : '';
};

/**
 * @description ファイル名が画像かどうかを判定する
 * @param {string} fileName - ファイル名
 * @returns {boolean} 画像ファイルの場合 true
 */
const isImageFile = (fileName: string): boolean => {
  return IMAGE_EXTENSIONS.has(getExtension(fileName));
};

/**
 * @description ファイル名が PDF かどうかを判定する
 * @param {string} fileName - ファイル名
 * @returns {boolean} PDF ファイルの場合 true
 */
const isPdfFile = (fileName: string): boolean => {
  return getExtension(fileName) === PDF_EXTENSION;
};

// ============================================================
// パース用正規表現
// ============================================================

/**
 * embed記法: ![[target]] / ![[target|widthOrAlias]]
 * wikilink記法: [[target]] / [[target|alias]]
 * 両方を一つの正規表現で処理する。embed は先にマッチさせる。
 */
const WIKILINK_REGEX =
  /(!?\[\[)([^\]|#]+?)(?:#([^\]|]*?))?(?:\|([^\]]*?))?\]\]/g;

// ============================================================
// プラグイン本体
// ============================================================

/**
 * @description Obsidian の wikilink と embed 記法をパースする remark プラグイン
 * テキストノードを走査し、wikilink/embed パターンを検出してカスタムノードに変換する。
 *
 * @returns {(tree: Root) => void} ツリー変換関数
 *
 * @example
 * ```tsx
 * <ReactMarkdown remarkPlugins={[remarkObsidianLink]}>
 *   {markdownContent}
 * </ReactMarkdown>
 * ```
 */
export const remarkObsidianLink: Plugin<[], Root> = () => {
  return (tree: Root) => {
    // ツリーを再帰的に走査する
    visitTextNodes(tree);
  };
};

/**
 * @description ツリー内のテキストノードを再帰的に走査し、wikilink/embed パターンを変換する
 * @param {Root | { children: (RootContent | PhrasingContent)[] }} node - 走査対象のノード
 */
const visitTextNodes = (
  node: Root | { children: (RootContent | PhrasingContent)[] },
): void => {
  if (!('children' in node) || !Array.isArray(node.children)) {
    return;
  }

  // 新しい子ノード配列を構築する
  const newChildren: (RootContent | PhrasingContent)[] = [];

  for (const child of node.children) {
    // テキストノードの場合、wikilink/embed パターンを検出する
    if (child.type === 'text') {
      const textNode = child;
      const parsed = parseWikilinksInText(textNode.value);
      newChildren.push(...parsed);
    } else {
      // テキストノード以外は再帰的に処理する
      if ('children' in child && Array.isArray(child.children)) {
        visitTextNodes(child);
      }
      newChildren.push(child);
    }
  }

  // 子ノードを置き換える
  node.children = newChildren;
};

/**
 * @description テキスト内の wikilink/embed パターンを検出し、ノード配列に変換する
 * @param {string} text - パース対象のテキスト
 * @returns {PhrasingContent[]} 変換後のノード配列
 */
const parseWikilinksInText = (text: string): PhrasingContent[] => {
  const nodes: PhrasingContent[] = [];
  let lastIndex = 0;

  // 正規表現のグローバルフラグをリセットする
  WIKILINK_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  // 全てのマッチを処理する
  while ((match = WIKILINK_REGEX.exec(text)) !== null) {
    // マッチの前にある通常テキストを追加する
    if (match.index > lastIndex) {
      nodes.push({
        type: 'text',
        value: text.slice(lastIndex, match.index),
      });
    }

    // マッチした部分を解析する
    const [, prefix, target, heading, pipeValue] = match;
    const isEmbed = prefix === '![[';
    const trimmedTarget = target.trim();

    if (isEmbed) {
      // embed ノードを生成する
      nodes.push(
        createEmbedNode(trimmedTarget, heading?.trim(), pipeValue?.trim()),
      );
    } else {
      // wikilink ノードを生成する
      nodes.push(
        createWikilinkNode(trimmedTarget, heading?.trim(), pipeValue?.trim()),
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // 残りのテキストを追加する
  if (lastIndex < text.length) {
    nodes.push({
      type: 'text',
      value: text.slice(lastIndex),
    });
  }

  // マッチがなかった場合はテキストノードをそのまま返す
  if (nodes.length === 0) {
    nodes.push({ type: 'text', value: text });
  }

  return nodes;
};

/**
 * @description Wikilink のカスタムノードを生成する
 * @param {string} target - リンク先のノート名
 * @param {string | undefined} heading - 見出し参照（あれば）
 * @param {string | undefined} alias - 表示名（あれば）
 * @returns {PhrasingContent} WikiLink カスタムノード
 */
const createWikilinkNode = (
  target: string,
  heading: string | undefined,
  alias: string | undefined,
): PhrasingContent => {
  // 表示テキストを決定する（エイリアスがあればそれを使う、なければターゲット名）
  const displayText = alias || target;

  return {
    type: 'wikiLink' as 'text',
    data: {
      hName: 'wiki-link',
      hProperties: {
        target,
        alias: alias || undefined,
        heading: heading || undefined,
        className: 'wiki-link',
      },
    },
    children: [{ type: 'text', value: displayText }],
  } as unknown as PhrasingContent;
};

/**
 * @description Embed のカスタムノードを生成する
 * @param {string} target - 埋め込み対象のファイル名
 * @param {string | undefined} heading - 見出し参照（あれば）
 * @param {string | undefined} pipeValue - パイプ後の値（画像の場合は幅、ノートの場合はエイリアス）
 * @returns {PhrasingContent} WikiEmbed カスタムノード
 */
const createEmbedNode = (
  target: string,
  heading: string | undefined,
  pipeValue: string | undefined,
): PhrasingContent => {
  // embed の種別を判定する
  let embedType = 'note';
  let width: number | undefined;

  if (isImageFile(target)) {
    embedType = 'image';
    // パイプ後の値が数値なら幅指定として扱う
    if (pipeValue && /^\d+$/.test(pipeValue)) {
      width = parseInt(pipeValue, 10);
    }
  } else if (isPdfFile(target)) {
    embedType = 'pdf';
  }

  return {
    type: 'wikiEmbed' as 'text',
    data: {
      hName: 'wiki-embed',
      hProperties: {
        target,
        embedType,
        width: width ?? undefined,
        heading: heading || undefined,
        className: 'wiki-embed',
      },
    },
    children: [],
  } as unknown as PhrasingContent;
};
