# BBcom Shop Search MCP Server

宮古島の店舗・求人情報を検索するためのModel Context Protocol (MCP)サーバー実装です。

## 概要

このMCPサーバーは、宮古島の店舗、レストラン、求人情報などのデータベースに対して、AI アシスタント（Claude等）から自然言語でアクセスできるインターフェースを提供します。

## 機能

### 提供ツール

1. **searchByCategory** - カテゴリー別検索（位置情報によるソート対応）
2. **searchByLocation** - 位置情報ベースの半径検索
3. **searchByTags** - タグによる検索（AND/OR条件）
4. **searchByText** - フリーテキスト検索
5. **getItemById** - ID指定による詳細情報取得

### 主な特徴

- PostGISを使用した高速な地理空間検索
- 宮古島の主要ランドマークデータベース内蔵
- 営業時間による絞り込み対応
- ページネーション対応
- 距離計算と並び替え機能

## セットアップ

### 必要要件

- Node.js 18以上
- PostgreSQL 14以上（PostGIS拡張必須）
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

4. Prismaクライアントの生成
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

## Claude Desktopとの統合

Claude Desktopの設定ファイル（`~/Library/Application Support/Claude/claude_desktop_config.json`）に以下を追加：

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
- `npm run test:connection` - DB接続テスト
- `npm run test:tools` - ツールテスト
- `npm run lint` - TypeScript型チェック
- `npm run typecheck` - TypeScript型チェック

## ライセンス

ISC

## サポート

問題や質問がある場合は、GitHubのIssueセクションに報告してください。