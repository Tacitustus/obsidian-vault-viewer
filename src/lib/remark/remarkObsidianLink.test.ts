/**
 * @description remarkObsidianLink プラグインの各機能のテスト
 *
 * - wikilink/embed 記法のパース
 * - HTML ブロック内の wikilink/embed 検出
 * - 各種コンテキスト（リスト内、引用内、テーブル内等）での動作
 */

import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

import { remarkObsidianLink } from './remarkObsidianLink';

import type { Root } from 'mdast';

/** wikiEmbed ノードの数を再帰的に数える */
const countWikiEmbeds = (node: unknown): number => {
  const n = node as { type?: string; children?: unknown[] };
  let count = 0;
  if (n.type === 'wikiEmbed') count++;
  if (n.children) {
    for (const child of n.children) {
      count += countWikiEmbeds(child);
    }
  }
  return count;
};

/** wikiLink ノードの数を再帰的に数える */
const countWikiLinks = (node: unknown): number => {
  const n = node as { type?: string; children?: unknown[] };
  let count = 0;
  if (n.type === 'wikiLink') count++;
  if (n.children) {
    for (const child of n.children) {
      count += countWikiLinks(child);
    }
  }
  return count;
};

/** 指定した type のノードの hProperties を取得する */
const findNodeProperties = (
  node: unknown,
  targetType: string,
): Record<string, unknown> | undefined => {
  const n = node as {
    type?: string;
    data?: { hProperties?: Record<string, unknown> };
    children?: unknown[];
  };
  if (n.type === targetType && n.data?.hProperties) {
    return n.data.hProperties;
  }
  if (n.children) {
    for (const child of n.children) {
      const found = findNodeProperties(child, targetType);
      if (found) return found;
    }
  }
  return undefined;
};

/** テスト用パーサー: remarkParse + remarkGfm + remarkObsidianLink */
const parseWithPlugin = (markdown: string): Root => {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkObsidianLink);
  return processor.runSync(processor.parse(markdown));
};

describe('remarkObsidianLink', () => {
  // ============================================================
  // 基本的な embed パース
  // ============================================================

  describe('embed 記法のパース', () => {
    // 基本的な画像 embed
    it('画像 embed を正しくパースする', () => {
      const tree = parseWithPlugin('![[image.png]]');
      expect(countWikiEmbeds(tree)).toBe(1);

      const props = findNodeProperties(tree, 'wikiEmbed');
      expect(props?.target).toBe('image.png');
      expect(props?.embedType).toBe('image');
    });

    // アンダースコア付き日本語ファイル名
    it('アンダースコア付き日本語ファイル名の embed をパースする', () => {
      const tree = parseWithPlugin('![[病気がみえる_消化器_食道_解剖.png]]');
      expect(countWikiEmbeds(tree)).toBe(1);

      const props = findNodeProperties(tree, 'wikiEmbed');
      expect(props?.target).toBe('病気がみえる_消化器_食道_解剖.png');
      expect(props?.embedType).toBe('image');
    });

    // 幅指定付き embed
    it('幅指定付きの画像 embed をパースする', () => {
      const tree = parseWithPlugin('![[image_file.png|300]]');
      expect(countWikiEmbeds(tree)).toBe(1);

      const props = findNodeProperties(tree, 'wikiEmbed');
      expect(props?.target).toBe('image_file.png');
      expect(props?.width).toBe(300);
    });

    // ノート embed
    it('ノート embed をパースする', () => {
      const tree = parseWithPlugin('![[MyNote]]');
      expect(countWikiEmbeds(tree)).toBe(1);

      const props = findNodeProperties(tree, 'wikiEmbed');
      expect(props?.target).toBe('MyNote');
      expect(props?.embedType).toBe('note');
    });

    // PDF embed
    it('PDF embed をパースする', () => {
      const tree = parseWithPlugin('![[document.pdf]]');
      expect(countWikiEmbeds(tree)).toBe(1);

      const props = findNodeProperties(tree, 'wikiEmbed');
      expect(props?.embedType).toBe('pdf');
    });
  });

  // ============================================================
  // wikilink パース
  // ============================================================

  describe('wikilink 記法のパース', () => {
    // 基本的な wikilink
    it('基本的な wikilink をパースする', () => {
      const tree = parseWithPlugin('[[MyNote]]');
      expect(countWikiLinks(tree)).toBe(1);

      const props = findNodeProperties(tree, 'wikiLink');
      expect(props?.target).toBe('MyNote');
    });

    // エイリアス付き wikilink
    it('エイリアス付き wikilink をパースする', () => {
      const tree = parseWithPlugin('[[MyNote|表示名]]');
      expect(countWikiLinks(tree)).toBe(1);

      const props = findNodeProperties(tree, 'wikiLink');
      expect(props?.target).toBe('MyNote');
      expect(props?.alias).toBe('表示名');
    });

    // ヘディング付き wikilink
    it('ヘディング付き wikilink をパースする', () => {
      const tree = parseWithPlugin('[[MyNote#見出し]]');
      expect(countWikiLinks(tree)).toBe(1);

      const props = findNodeProperties(tree, 'wikiLink');
      expect(props?.target).toBe('MyNote');
      expect(props?.heading).toBe('見出し');
    });
  });

  // ============================================================
  // 各種コンテキストでの動作
  // ============================================================

  describe('各種 Markdown コンテキストでの動作', () => {
    // リスト直後の embed（ユーザーの実際のケース）
    it('リスト直後の embed が正しくパースされる', () => {
      const markdown = `- 項目1
- 項目2
- 項目3
![[病気がみえる_消化器_食道_解剖.png]]`;

      const tree = parseWithPlugin(markdown);
      expect(countWikiEmbeds(tree)).toBe(1);
    });

    // テーブルセル内
    it('テーブルセル内の embed がパースされる', () => {
      const markdown = '| col1 | col2 |\n|------|------|\n| ![[image.png]] | text |';
      const tree = parseWithPlugin(markdown);
      expect(countWikiEmbeds(tree)).toBe(1);
    });

    // 引用内
    it('引用内の embed がパースされる', () => {
      const markdown = '> ![[image.png]]';
      const tree = parseWithPlugin(markdown);
      expect(countWikiEmbeds(tree)).toBe(1);
    });

    // 複数の embed が同じ行にある場合
    it('同一行の複数 embed がパースされる', () => {
      const markdown = '![[a.png]] ![[b.png]] ![[c.png]]';
      const tree = parseWithPlugin(markdown);
      expect(countWikiEmbeds(tree)).toBe(3);
    });

    // コードブロック内（変換されてはいけない）
    it('コードブロック内の embed は変換しない', () => {
      const markdown = '```\n![[image.png]]\n```';
      const tree = parseWithPlugin(markdown);
      expect(countWikiEmbeds(tree)).toBe(0);
    });

    // インラインコード内（変換されてはいけない）
    it('インラインコード内の embed は変換しない', () => {
      const markdown = '`![[image.png]]`';
      const tree = parseWithPlugin(markdown);
      expect(countWikiEmbeds(tree)).toBe(0);
    });
  });

  // ============================================================
  // HTML ブロック内の embed 対応
  // ============================================================

  describe('HTML ブロック内の wikilink/embed', () => {
    // <div> 内の embed
    it('<div> 内の embed がパースされる', () => {
      const markdown = '<div>\n![[image.png]]\n</div>';
      const tree = parseWithPlugin(markdown);
      expect(countWikiEmbeds(tree)).toBe(1);
    });

    // <p> 内の embed
    it('<p> 内の embed がパースされる', () => {
      const markdown = '<p>![[image.png]]</p>';
      const tree = parseWithPlugin(markdown);
      expect(countWikiEmbeds(tree)).toBe(1);
    });

    // <details> 内の embed
    it('<details> 内の embed がパースされる', () => {
      const markdown = '<details>\n<summary>画像</summary>\n\n![[image.png]]\n\n</details>';
      const tree = parseWithPlugin(markdown);
      expect(countWikiEmbeds(tree)).toBe(1);
    });

    // HTML 内の wikilink
    it('<div> 内の wikilink がパースされる', () => {
      const markdown = '<div>[[MyNote]]</div>';
      const tree = parseWithPlugin(markdown);
      expect(countWikiLinks(tree)).toBe(1);
    });
  });
});
