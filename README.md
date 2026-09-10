# Obsidian Vault Viewer

GitHub リポジトリ上で管理されている Obsidian の Vault をブラウザ上でそのまま閲覧するためのウェブアプリケーションです。

🌐 **アプリ URL**: [https://Tacitustus.github.io/obsidian-vault-viewer/](https://Tacitustus.github.io/obsidian-vault-viewer/)

## ✨ 主な機能

- **そのまま閲覧**: GitHub 上にある Markdown ファイル群を Obsidian に近い見た目でレンダリングします。
- **Wikilink 解決**: `[[ノート名]]` 形式のリンクをクリックして他のノートへシームレスに遷移できます。
- **インライン埋め込み**: `![[ノート名]]` や `![[画像.png]]` によるコンテンツの埋め込み表示に対応しています。
- **フォルダツリー**: リポジトリ内のファイルを階層構造で表示し、インクリメンタル検索が可能です。
- **プライベートリポジトリ対応**: Personal Access Token (PAT) を入力することで、プライベートリポジトリの Vault も閲覧できます。
- **複数タブ + ペイン分割**: 複数のノートをタブで同時に開き、上下左右にペインを分割して並べて閲覧できます。
- **高機能検索**: ファイル名検索に加え、ノート本文のフルテキスト検索に対応。マッチ箇所のスニペットをプレビュー表示します。
- **タグ検索**: Vault 内のすべてのタグを一覧表示し、クリックで該当ノートを絞り込み。ノート内のタグバッジをクリックしても連動します。
- **閲覧アナリティクス**: Supabase と連携して各ノートの閲覧回数を記録。人気ノートランキングやヒートマップで閲覧傾向を可視化できます（オプション機能）。

## 📖 使い方

1. [アプリ (Obsidian Vault Viewer)](https://Tacitustus.github.io/obsidian-vault-viewer/) にアクセスします。
2. 接続フォームに以下の情報を入力します：
   - **Owner**: GitHub のユーザー名 または 組織名（例: `Tacitustus`）
   - **Repository**: Vault があるリポジトリ名（例: `my-vault`）
   - **Branch**: ブランチ名（デフォルト: `main`）
3. **プライベートリポジトリの場合**:
   - 「Personal Access Token」の欄に GitHub の PAT を入力してください。
   - ※ トークンはブラウザのメモリ上にのみ保持され、外部サーバーに送信されたり保存されたりすることはありません。
4. 「Vault を開く」ボタンをクリックすると、左側にフォルダツリー、右側にノートが表示されるビューア画面に切り替わります。

### タブ操作

| 操作 | 方法 |
|------|------|
| 新しいタブで開く | サイドバーからファイルをクリック |
| タブを閉じる | タブの × ボタン or 中クリック（ホイールクリック） |
| ペインを分割 | タブを右クリック →「右に分割」/「下に分割」 |
| 他のタブを全て閉じる | タブを右クリック →「他をすべて閉じる」 |
| ペインのリサイズ | ペイン間のセパレーターをドラッグ |

### 検索

検索窓の左側にあるアイコンをクリックすると、以下の3つの検索モードを切り替えられます：

| モード | 説明 |
|--------|------|
| 📄 ファイル名検索 | ファイル名・パスで絞り込み |
| 📝 本文検索 | ノートの内容をフルテキスト検索。マッチ箇所をスニペット表示 |
| 🏷 タグ検索 | Vault 内のタグを一覧表示し、クリックで絞り込み |

## 💻 ローカル開発環境のセットアップ

本リポジトリをクローンして手元で動かす場合の手順です。

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定（オプション）

アナリティクス機能（閲覧回数の記録・ヒートマップ）を有効にする場合は、Supabase の設定が必要です。
**設定しない場合でも他のすべての機能は正常に動作します。**

```bash
# テンプレートから .env ファイルを作成
cp .env.example .env
```

作成した `.env` ファイルに Supabase の接続情報を記入してください。詳細は後述の「[Supabase セットアップ（アナリティクス機能）](#-supabase-セットアップアナリティクス機能)」を参照してください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` が自動的に開きます。

## 🗄 Supabase セットアップ（アナリティクス機能）

アナリティクス機能（閲覧回数の記録、人気ノートランキング、ヒートマップ表示、フィルタ設定の保存）を利用するには、[Supabase](https://supabase.com) のプロジェクトが必要です。

> **💡 この手順は完全にオプションです。** Supabase を設定しなくてもアプリの閲覧機能は問題なく動作します。

### Step 1: Supabase プロジェクトの作成

1. [supabase.com](https://supabase.com) にアクセスし、GitHub アカウントでログイン
2. ダッシュボードで **「New project」** をクリック
3. プロジェクト名・データベースパスワード・リージョンを入力して作成（リージョンは `Northeast Asia (Tokyo)` を推奨）
4. プロジェクトの初期化が完了するまで数分待機

### Step 2: API キーの取得

1. Supabase ダッシュボードで対象プロジェクトを開く
2. 左サイドバーの **⚙️「Project Settings」** をクリック
3. **「API」** タブを開く
4. 以下の2つの値をコピーしてメモしておく：

| 項目 | 場所 | 説明 |
|------|------|------|
| **Project URL** | 「API Settings」セクションの **URL** | `https://xxxxxxxx.supabase.co` 形式。プロジェクトの REST API エンドポイント |
| **anon public key** | 「Project API keys」セクションの **`anon` `public`** | `eyJhbGciOiJIUz...` で始まる JWT トークン。匿名ユーザー用の公開キー |

> ⚠️ **`service_role` キーは使用しないでください。** `service_role` はサーバーサイド専用のキーであり、フロントエンドに埋め込むと全データへのフルアクセスが可能になってしまいます。必ず **`anon` (`public`)** のキーを使用してください。

### Step 3: `.env` ファイルの設定

プロジェクトルートにある `.env.example` をコピーして `.env` を作成し、Step 2 で取得した値を記入します：

```bash
cp .env.example .env
```

`.env` ファイルの中身：

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ `.env` ファイルは `.gitignore` に含まれており、Git にコミットされることはありません。

### Step 4: データベーステーブルの作成

1. Supabase ダッシュボードで対象プロジェクトを開く
2. 左サイドバーの **「SQL Editor」** をクリック
3. 以下の SQL を貼り付けて **「Run」** を実行：

```sql
-- note_views テーブル: ノートの閲覧回数を記録する
CREATE TABLE IF NOT EXISTS note_views (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  repo_key TEXT NOT NULL,
  file_path TEXT NOT NULL,
  view_count BIGINT DEFAULT 1,
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_key, file_path)
);

ALTER TABLE note_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous select on note_views"
  ON note_views FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on note_views"
  ON note_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on note_views"
  ON note_views FOR UPDATE USING (true);

-- analytics_filters テーブル: フィルタ設定を保存する
CREATE TABLE IF NOT EXISTS analytics_filters (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  repo_key TEXT NOT NULL,
  filter_name TEXT NOT NULL,
  folder_paths JSONB NOT NULL DEFAULT '[]',
  operator TEXT NOT NULL DEFAULT 'or',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous select on analytics_filters"
  ON analytics_filters FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on analytics_filters"
  ON analytics_filters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on analytics_filters"
  ON analytics_filters FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete on analytics_filters"
  ON analytics_filters FOR DELETE USING (true);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_note_views_repo_key ON note_views(repo_key);
CREATE INDEX IF NOT EXISTS idx_note_views_view_count ON note_views(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_filters_repo_key ON analytics_filters(repo_key);
```

4. 「Success. No rows returned.」と表示されれば完了です
5. 左サイドバーの **「Table Editor」** で `note_views` と `analytics_filters` の2テーブルが作成されていることを確認

### Step 5: 動作確認

1. `npm run dev` で開発サーバーを起動
2. Vault を開いてノートを表示
3. サイドバー下部の **「アナリティクス」** をクリックして展開
4. ノートを閲覧した後、ランキングやヒートマップにデータが反映されることを確認

### アナリティクスのフィルタ設定

ヒートマップの表示対象をフォルダで絞り込むことができます：

1. アナリティクスダッシュボードの **「ヒートマップ」** タブを選択
2. フォルダセレクターの横にある **＋** ボタンをクリック
3. フィルタ名を入力し、対象フォルダを選択
4. **AND**（すべてのフォルダに含まれる）または **OR**（いずれかのフォルダに含まれる）を選択
5. **「保存」** をクリック → フィルタがサーバーに永続化されます

## 🛠 技術スタック

- **React 19**
- **TypeScript**
- **Vite**
- **TailwindCSS v3**
- **Zustand** (状態管理)
- **react-markdown** + **remark-gfm** + カスタムプラグイン (Markdown レンダリング)
- **react-resizable-panels** (ペイン分割)
- **@supabase/supabase-js** (アナリティクス永続化)
- **nanoid** (一意ID生成)

## 📄 ライセンス

MIT
