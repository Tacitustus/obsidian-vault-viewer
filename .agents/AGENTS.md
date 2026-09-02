# AIエージェント行動指示書

このドキュメントは、本プロジェクトで作業するAIエージェントが遵守すべきコーディング規約・デザイン規約・命名規約をまとめた行動指示書です。

---

## コーディング規約

### TypeScript
- **TypeScript 厳格モード（`strict: true`）** を有効にすること
- **`any` 型の使用は一切禁止**。`unknown` + 型ガードを用いること
- 関数はすべて **アロー関数** で定義する（`export const MyComponent = () => {}` 形式）

### コメント
- コメントは処理単位で **非常に細かく親切に日本語で** 書く
  - 例: `// ユーザー一覧を取得し、アクティブなユーザーのみをフィルタリングする`

### JSDoc
- 以下の単位で **必ず** JSDoc を記述する：
  - すべてのコンポーネント（`@description`, `@param`, `@returns`, `@example`）
  - すべてのカスタムフック（`@description`, `@returns`, `@example`）
  - すべての汎用ユーティリティ関数（`@description`, `@param`, `@returns`）
  - 型定義（`@description`）

### インポート順序
1. React
2. 外部ライブラリ
3. 内部モジュール（絶対パス `@/`）
4. 相対パス
5. 型（`type` インポート）
6. スタイル

### パスエイリアス
- `@/` を使用する（`@/` → `src/`）

---

## デザイン規約

- **アトミックデザイン** の5階層（atoms / molecules / organisms / templates / pages）を厳守する
  - `atoms`: ボタン、入力フィールド、ラベル等の最小単位
  - `molecules`: atoms を組み合わせた小コンポーネント
  - `organisms`: molecules を組み合わせたセクション
  - `templates`: ページレイアウト
  - `pages`: ルーティング対象のページ
- **TailwindCSS のユーティリティクラスを優先** し、カスタムCSSは最小限にする
- **ダークモード対応** を考慮した設計にする（TailwindCSS の `dark:` プレフィックス）
- **レスポンシブデザイン** を前提とする（モバイルファースト）
- **モダンで洗練されたデザイン**: グラスモーフィズム、グラデーション、マイクロアニメーションを適切に活用する
- **カラーパレット** は `tailwind.config.ts` で一元管理する

---

## ファイル命名規約

| 種別 | 命名規則 | 例 |
|------|---------|-----|
| コンポーネント | PascalCase | `UserCard.tsx` |
| フック | camelCase、`use` プレフィックス | `useAuth.ts` |
| ユーティリティ | camelCase | `formatDate.ts` |
| 型定義 | PascalCase | `User.ts` |
| 定数 | UPPER_SNAKE_CASE のエクスポート名、camelCase のファイル名 | `apiEndpoints.ts` 内の `API_BASE_URL` |

---

## テスト規約

- 新規コンポーネントには必ず **基本的なレンダリングテスト** を書くこと（Vitest + React Testing Library）
- テストファイルは対象ファイルと同じディレクトリに `*.test.tsx` として配置する

---

## Git 規約

- コミットメッセージは **Conventional Commits** に従う
  - `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- 日本語の説明を括弧内に添える
  - 例: `feat: add login form (ログインフォームを追加)`

---

## タスク完了時の確認事項（必須）

タスクが完了したら、以下を **必ず** 実施すること：

1. `BLUEPRINT.md` を再読し、仕様との乖離がないことを確認する
2. `AGENTS.md` を再読し、コーディング規約・デザイン規約・命名規約をすべて守れていることを確認する
3. ESLint / Prettier エラーが 0 件であることを確認する（`npm run lint` で確認）
4. TypeScript コンパイルエラーが 0 件であることを確認する（`npx tsc --noEmit` で確認）
5. ビルドが成功することを確認する（`npm run build` で確認）
6. 以下の形式で報告する：

```
## ✅ タスク完了報告
### 修正内容
- （変更点を箇条書き）

### 仕様書チェック（BLUEPRINT.md）
- ✅ / ❌ 各要件の適合状況

### コーディング規約チェック（AGENTS.md）
- ✅ any 未使用
- ✅ アロー関数のみ使用
- ✅ JSDoc 記述済み
- ✅ 日本語コメント記述済み
- ✅ アトミックデザイン準拠
- ✅ ESLint エラー 0 件
- ✅ Prettier フォーマット済み
- ✅ TypeScript コンパイルエラー 0 件
- ✅ ビルド成功
```
