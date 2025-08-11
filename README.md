# BBcom Shop Search MCP Server

宮古島の店舗・求人情報を検索するための Model Context Protocol (MCP)サーバー実装です。

## 概要

この MCP サーバーは、宮古島の店舗、レストラン、求人情報などのデータベースに対して、AI アシスタント（Claude 等）から自然言語でアクセスできるインターフェースを提供します。

## 機能

### 提供ツール

1. **searchByCategory** - カテゴリー別検索（位置情報によるソート対応）
2. **searchByLocation** - 位置情報ベースの半径検索
3. **searchByTags** - タグによる検索（AND/OR 条件）
4. **searchByText** - フリーテキスト検索
5. **getItemById** - ID 指定による詳細情報取得

### 主な特徴

- PostGIS を使用した高速な地理空間検索
- 宮古島の主要ランドマークデータベース内蔵
- 営業時間による絞り込み対応
- ページネーション対応
- 距離計算と並び替え機能

## セットアップ

### 必要要件

- Node.js 18 以上
- PostgreSQL 14 以上（PostGIS 拡張必須）
- npm または yarn

### インストール手順

1. リポジトリのクローン

```bash
git clone <repository-url>
cd bbcom_shop_search_mcp_server
```

2. 依存関係のインストール

```bash
npm install
```

3. 環境変数の設定

```bash
cp .env.example .env
# .envファイルを編集してDATABASE_URLを設定
```

4. Prisma クライアントの生成

```bash
npx prisma generate
```

5. データベースマイグレーション

```bash
npx prisma migrate dev
```

## 使用方法

### 開発環境での実行

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### テスト

```bash
# データベース接続テスト
npm run test:connection

# ツールテスト
npm run test:tools
```

## Claude Desktop との統合

### 方法1: Desktop Extensions (DXT) を使用（推奨）

DXTファイルを使用すると、ワンクリックでインストールできます。

#### DXTファイルの作成

1. 通常版DXTファイル（約67MB）の作成：
```bash
npm run dxt:pack
```

2. 最適化版DXTファイル（約14MB）の作成：
```bash
npm run dxt:pack:optimized
```

#### DXTファイルのインストール

生成された`.dxt`ファイルをClaude Desktopにドラッグ&ドロップするだけでインストールできます。
インストール時にDATABASE_URLの設定を求められます。

#### アイコンのカスタマイズ

`icon.png`ファイル（推奨サイズ: 256x256または512x512ピクセル）をプロジェクトルートに配置してから、DXTファイルを作成してください。

### 方法2: 手動設定

Claude Desktop の設定ファイル（`~/Library/Application Support/Claude/claude_desktop_config.json`）に以下を追加：

```json
{
  "mcpServers": {
    "bbcom-miyakojima": {
      "command": "node",
      "args": ["/path/to/bbcom_shop_search_mcp_server/dist/server.js"],
      "env": {
        "DATABASE_URL": "postgresql://user:password@host:port/database?sslmode=require"
      }
    }
  }
}
```

## データベーススキーマ

主要テーブル：

- `citadela_items` - 店舗・求人情報
- `landmarks` - 宮古島のランドマーク情報

詳細は`prisma/schema.prisma`を参照してください。

## 開発

### プロジェクト構造

```
├── src/
│   ├── mcp/
│   │   ├── server.ts          # MCPサーバー本体
│   │   ├── tools/             # 各ツールの実装
│   │   └── schemas/           # Zodスキーマ定義
│   └── utils/
│       ├── geocoding.ts       # ジオコーディング機能
│       └── landmarks.ts       # ランドマークデータ
├── prisma/
│   └── schema.prisma         # データベーススキーマ
└── scripts/                  # テストスクリプト
```

### コマンド一覧

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run build:optimized` - 最適化ビルド（minify + tree-shaking）
- `npm run test:connection` - DB 接続テスト
- `npm run test:tools` - ツールテスト
- `npm run lint` - TypeScript 型チェック
- `npm run typecheck` - TypeScript 型チェック
- `npm run dxt:pack` - DXTファイルの作成（通常版）
- `npm run dxt:pack:optimized` - DXTファイルの作成（最適化版）
- `npm run dxt:validate` - manifest.json の検証

## ライセンス

ISC

## サポート

問題や質問がある場合は、GitHub の Issue セクションに報告してください。
