# React GitHub Pages Template

AIエージェントがWebアプリケーションを開発する際に使い回すための、モダンで高品質なReactプロジェクトテンプレートです。

## 技術スタック

- **React 19+** (TypeScript)
- **Vite** (最新安定版)
- **TailwindCSS v3+**
- **React Router v7+** (GitHub Pages SPA対応)
- **Zustand** (状態管理)
- **lucide-react** (アイコン)
- **Vitest + React Testing Library** (テスト)

---

## 🚀 テンプレートからの新規プロジェクト作成

このテンプレートを使って新しいプロジェクトを作成するには、以下の手順に従ってください。

### 方法1: GitHub の「Use this template」ボタン（推奨）

1. GitHub リポジトリページの **「Use this template」** ボタンをクリック
2. 新しいリポジトリ名（例: `my-awesome-app`）を入力して作成
3. ローカルにクローンする:

```bash
git clone https://github.com/<your-username>/my-awesome-app.git
cd my-awesome-app
```

4. 依存パッケージをインストールする:

```bash
npm install
```

5. セットアップスクリプトを実行してプロジェクト名を一括変更する:

```bash
npm run setup
```

対話的にパッケージ名・表示名・説明文を入力するとプロジェクト内のファイルが自動的に更新されます。

### 方法2: 手動クローン

```bash
git clone https://github.com/<your-username>/react-github-pages-template.git my-awesome-app
cd my-awesome-app
rm -rf .git
git init
npm install
npm run setup
```

### 方法3: CLI引数で非対話実行

```bash
npm run setup -- --name my-awesome-app --display-name "My Awesome App" --description "アプリの説明"
```

---

## 📝 セットアップスクリプトが変更するファイル

`npm run setup` は以下のファイルを自動で更新します:

| ファイル | 変更箇所 |
|----------|----------|
| `package.json` | `name` フィールド |
| `vite.config.ts` | `BASE_PATH` のデフォルト値 |
| `index.html` | `<title>` タグ、`<meta name="description">` |
| `src/constants/appConfig.ts` | `APP_NAME`、`APP_DESCRIPTION` |
| `README.md` | タイトルと説明文 |
| `BLUEPRINT.md` | プロジェクト概要 |

> **💡 ヒント**: セットアップ後、以下のファイルも必要に応じて手動で変更してください:
>
> - `BLUEPRINT.md` — 機能要件・ページ構成・API仕様の定義
> - `tailwind.config.ts` — カラーパレットのカスタマイズ
> - `public/favicon.svg` — アプリのファビコン差し替え

---

## ⚙️ 手動で変更が必要になる場合

セットアップスクリプトでカバーされない設定変更が必要になるケースをまとめます。

### GitHub Pages のルートドメインで公開する場合

`username.github.io`（リポジトリ名なしのルートURL）で公開する場合、追加の変更が必要です:

1. **`vite.config.ts`** — `BASE_PATH` のデフォルト値を `'/'` に変更:
   ```ts
   const BASE_PATH = process.env.VITE_BASE_PATH || '/';
   ```

2. **`public/404.html`** — `segmentCount` を `0` に変更:
   ```js
   const segmentCount = 0; // user.github.io の場合は 0
   ```

### カスタムドメインを使用する場合

1. **`public/CNAME`** ファイルを作成し、ドメイン名を記述:
   ```
   www.example.com
   ```

2. **`vite.config.ts`** — `BASE_PATH` のデフォルト値を `'/'` に変更

### Node.js バージョンの変更

CI/CD で使用する Node.js バージョンを変更する場合:

- **`.github/workflows/deploy.yml`** — `node-version` の値を変更:
  ```yaml
  node-version: 22
  ```

---

## セットアップ手順（開発の開始）

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` が自動的に開きます。

## 開発コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動（HMR対応） |
| `npm run build` | プロダクションビルドを生成 |
| `npm run preview` | ビルド成果物をプレビュー |
| `npm run lint` | ESLint でコードを検証 |
| `npm run lint:fix` | ESLint で自動修正 |
| `npm run format` | Prettier でコードをフォーマット |
| `npm run type-check` | TypeScript の型チェック |
| `npm run test` | テストを実行 |
| `npm run test:ui` | テストをUIモードで実行 |
| `npm run setup` | テンプレートのセットアップ（プロジェクト名の一括変更） |

## ディレクトリ構成

```
src/
├── components/
│   ├── atoms/        # 最小単位のコンポーネント（Button, Input 等）
│   ├── molecules/    # atoms の組み合わせ（SearchBar 等）
│   ├── organisms/    # molecules の組み合わせ（Header 等）
│   ├── templates/    # ページレイアウト（DefaultLayout 等）
│   └── pages/        # ルーティング対象のページ（HomePage 等）
├── hooks/            # カスタムフック
├── stores/           # Zustand ストア
├── utils/            # ユーティリティ関数
├── types/            # 型定義
├── styles/           # グローバルCSS
├── constants/        # 定数定義
├── test/             # テストセットアップ
├── App.tsx           # ルートコンポーネント
├── main.tsx          # エントリーポイント
└── vite-env.d.ts     # Vite 型定義
```

## GitHub Pages へのデプロイ

### 自動デプロイ（推奨）

1. GitHub リポジトリの **Settings** > **Pages** > **Source** を **「GitHub Actions」** に設定する
2. `npm run setup` でプロジェクト名を設定済みであることを確認する（`vite.config.ts` の `BASE_PATH` が正しいリポジトリ名になっている必要がある）
3. `main` ブランチに push すると自動的にデプロイされる

### 手動デプロイ

```bash
npm run build
```

`dist/` ディレクトリに生成された成果物をデプロイしてください。

## 関連ドキュメント

- [BLUEPRINT.md](./BLUEPRINT.md) - プロジェクト仕様書
- [.agents/AGENTS.md](./.agents/AGENTS.md) - AIエージェント行動指示書

## ライセンス

MIT
