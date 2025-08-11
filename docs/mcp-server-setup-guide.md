# 宮古島 BBcom MCP サーバー構築手順書

## 概要

このドキュメントは、宮古島 BBcom の MCP サーバーを独立したリポジトリとして構築するための詳細な手順書です。MCP サーバーは、宮古島の店舗・求人情報データベースを検索可能にする Model Context Protocol (MCP)準拠のサーバーです。

## アーキテクチャ構成

### 主要コンポーネント

1. **MCP サーバー本体** (`src/mcp/server-simple.ts`)

   - Model Context Protocol に準拠したサーバー実装
   - StdioServerTransport を使用したプロセス間通信
   - 5 つの検索ツールを提供

2. **データベース層**

   - PostgreSQL + PostGIS 拡張
   - Prisma ORM を使用したデータアクセス
   - 地理空間インデックス（GIST）による高速検索

3. **ジオコーディング機能**
   - ランドマークデータベース（ローカル）
   - Google Maps Geocoding API（オプション）

## 提供ツール一覧

| ツール名           | 機能                   | パラメータ                                |
| ------------------ | ---------------------- | ----------------------------------------- |
| `searchByCategory` | カテゴリー検索         | category, limit, userLat, userLng         |
| `searchByLocation` | 位置情報検索（半径内） | latitude, longitude, radiusKm, limit      |
| `searchByTags`     | タグ検索               | tags[], matchAll, limit, userLat, userLng |
| `searchByText`     | フリーワード検索       | query, limit, userLat, userLng            |
| `getItemById`      | ID 指定取得            | itemId                                    |

## 新規リポジトリ構築手順

### 1. プロジェクト初期化

```bash
# 新規ディレクトリ作成
mkdir bbcom-mcp-server
cd bbcom-mcp-server

# Gitリポジトリ初期化
git init

# package.json作成
npm init -y

# TypeScript設定
npm install --save-dev typescript @types/node tsx
npx tsc --init
```

### 2. 必要な依存関係のインストール

```bash
# MCP SDK
npm install @modelcontextprotocol/sdk

# Prisma関連
npm install @prisma/client
npm install --save-dev prisma

# その他ユーティリティ
npm install dotenv zod

# 開発用ツール
npm install --save-dev esbuild
```

### 3. プロジェクト構造の作成

```bash
# ディレクトリ構造作成
mkdir -p src/mcp
mkdir -p src/utils
mkdir -p prisma
mkdir -p docs
mkdir -p scripts
```

推奨ディレクトリ構造：

```
bbcom-mcp-server/
├── src/
│   ├── mcp/
│   │   ├── server.ts          # MCPサーバー本体
│   │   ├── tools/             # 各ツールの実装
│   │   │   ├── search-by-category.ts
│   │   │   ├── search-by-location.ts
│   │   │   ├── search-by-tags.ts
│   │   │   ├── search-by-text.ts
│   │   │   └── get-item-by-id.ts
│   │   └── schemas/           # Zodスキーマ定義
│   │       └── index.ts
│   └── utils/
│       ├── geocoding.ts       # ジオコーディング機能
│       └── landmarks.ts       # ランドマーク定義
├── prisma/
│   ├── schema.prisma          # データベーススキーマ
│   └── migrations/            # マイグレーションファイル
├── scripts/
│   └── test-connection.ts     # DB接続テストスクリプト
├── docs/
│   └── api.md                 # API仕様書
├── .env.example               # 環境変数テンプレート
├── package.json
├── tsconfig.json
├── mcp.json                   # MCP設定ファイル
└── README.md
```

### 4. Prisma スキーマの設定

`prisma/schema.prisma`:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

model CitadelaItem {
  id                Int      @id @default(autoincrement())
  itemId            Int      @unique @map("item_id")
  slug              String   @unique
  link              String?

  // Content fields
  title             String
  subtitle          String?
  content           String?  @db.Text
  status            String   @default("publish")
  author            Int      @default(1)

  // Location fields
  latitude          Float?
  longitude         Float?
  location          Unsupported("geography(Point, 4326)")?
  address           String?

  // Categorization
  categories        String[]
  tags              String[]

  // Metadata
  featuredImage     Int?
  galleryImages     Int[]
  openingHours      Json?
  phoneNumber       String?
  telephoneNumber   String?
  email             String?
  showEmail         Boolean  @default(true)
  web               String?
  showWeb           Boolean  @default(true)
  socialIcons       Json?
  features          String[]
  customFields      Json?

  // Timestamps
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  publishedAt       DateTime @default(now()) @map("published_at")

  @@index([categories], type: Gin)
  @@index([tags], type: Gin)
  @@index([location], type: Gist)
  @@map("citadela_items")
}

model Landmark {
  id           Int      @id @default(autoincrement())
  name         String   @unique
  nameKana     String?  @map("name_kana")
  nameEnglish  String?  @map("name_english")
  category     String
  latitude     Float
  longitude    Float
  location     Unsupported("geography(Point, 4326)")?
  address      String?
  description  String?

  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([category])
  @@index([location], type: Gist)
  @@map("landmarks")
}
```

### 5. 環境変数設定

`.env.example`:

```env
# Database connection (Required)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Google Maps API (Optional - for geocoding)
GOOGLE_MAPS_API_KEY=""

# Server configuration
MCP_SERVER_NAME="bbcom-miyakojima"
MCP_SERVER_VERSION="1.0.0"
```

### 6. TypeScript 設定

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 7. MCP サーバー実装

メインサーバーファイルを作成（`src/mcp/server.ts`）。既存の`server-simple.ts`をベースに、以下の改善を加えます：

1. **モジュール化**: 各ツールを個別ファイルに分離
2. **エラーハンドリング強化**: より詳細なエラーメッセージ
3. **ロギング追加**: デバッグ用のログ出力
4. **型安全性向上**: TypeScript 型定義の強化

### 8. package.json スクリプト設定

```json
{
  "scripts": {
    "dev": "tsx src/mcp/server.ts",
    "build": "esbuild src/mcp/server.ts --bundle --platform=node --outfile=dist/server.js --external:@prisma/client --external:pg",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "test:connection": "tsx scripts/test-connection.ts",
    "postinstall": "prisma generate"
  }
}
```

### 9. MCP 設定ファイル

`mcp.json`:

```json
{
  "mcpServers": {
    "bbcom-miyakojima": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 10. データベースセットアップ

```bash
# Prismaクライアント生成
npx prisma generate

# マイグレーション実行
npx prisma migrate dev --name init

# PostGIS拡張の有効化（DBコンソールで実行）
CREATE EXTENSION IF NOT EXISTS postgis;

# 接続テスト
npm run test:connection
```

### 11. ランドマークデータの初期化

```sql
-- ランドマークテーブルへの初期データ投入
INSERT INTO landmarks (name, name_kana, name_english, category, latitude, longitude, address, location) VALUES
('宮古島市役所', 'みやこじましやくしょ', 'Miyakojima City Hall', 'government', 24.8056, 125.2811, '沖縄県宮古島市平良字西里', ST_MakePoint(125.2811, 24.8056)::geography),
('宮古空港', 'みやこくうこう', 'Miyako Airport', 'transport', 24.7828, 125.2951, '沖縄県宮古島市平良字下里', ST_MakePoint(125.2951, 24.7828)::geography),
('平良港', 'ひららこう', 'Hirara Port', 'transport', 24.8074, 125.2787, '沖縄県宮古島市平良字西里', ST_MakePoint(125.2787, 24.8074)::geography),
('与那覇前浜ビーチ', 'よなはまえはまびーち', 'Yonaha Maehama Beach', 'tourist', 24.7378, 125.2628, '沖縄県宮古島市下地字与那覇', ST_MakePoint(125.2628, 24.7378)::geography),
('砂山ビーチ', 'すなやまびーち', 'Sunayama Beach', 'tourist', 24.8269, 125.2636, '沖縄県宮古島市平良字荷川取', ST_MakePoint(125.2636, 24.8269)::geography),
('池間大橋', 'いけまおおはし', 'Ikema Bridge', 'tourist', 24.9333, 125.2833, '沖縄県宮古島市平良字池間', ST_MakePoint(125.2833, 24.9333)::geography),
('来間大橋', 'くりまおおはし', 'Kurima Bridge', 'tourist', 24.7436, 125.2544, '沖縄県宮古島市下地字来間', ST_MakePoint(125.2544, 24.7436)::geography),
('伊良部大橋', 'いらぶおおはし', 'Irabu Bridge', 'tourist', 24.8239, 125.2608, '沖縄県宮古島市平良字久貝', ST_MakePoint(125.2608, 24.8239)::geography);
```

## 開発・テスト手順

### 1. ローカル開発環境の起動

```bash
# 環境変数設定
cp .env.example .env
# .envファイルを編集してデータベース接続情報を設定

# 開発サーバー起動
npm run dev
```

### 2. テストツールの作成

`scripts/test-tools.ts`:

```typescript
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function testTool(toolName: string, args: object) {
  const request = {
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args,
    },
    id: 1,
  };

  console.log(`Testing ${toolName}...`);
  console.log("Request:", JSON.stringify(request, null, 2));

  // MCPサーバーとの通信をシミュレート
  // 実際の実装では、StdioTransportを使用
}

// テスト実行
async function runTests() {
  await testTool("searchByCategory", { category: "居酒屋", limit: 5 });
  await testTool("searchByLocation", {
    latitude: 24.8056,
    longitude: 125.2811,
    radiusKm: 2,
  });
  await testTool("searchByText", { query: "ラーメン" });
}

runTests().catch(console.error);
```

### 3. Claude Desktop との統合

Claude Desktop 設定ファイル（`~/Library/Application Support/Claude/claude_desktop_config.json`）に追加：

```json
{
  "mcpServers": {
    "bbcom-miyakojima": {
      "command": "node",
      "args": ["/path/to/bbcom-mcp-server/dist/server.js"],
      "env": {
        "DATABASE_URL": "your-database-url"
      }
    }
  }
}
```

## デプロイメント

### 1. プロダクションビルド

```bash
# TypeScriptコンパイル
npm run build

# 依存関係の最適化
npm ci --production
```

### 2. Docker コンテナ化（オプション）

`Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install PostgreSQL client for Prisma
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci --production && \
    npx prisma generate

# Copy built application
COPY dist ./dist

# Set environment
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
```

### 3. システムサービス化（Linux）

`/etc/systemd/system/bbcom-mcp.service`:

```ini
[Unit]
Description=BBcom MCP Server
After=network.target

[Service]
Type=simple
User=mcp
WorkingDirectory=/opt/bbcom-mcp-server
ExecStart=/usr/bin/node /opt/bbcom-mcp-server/dist/server.js
Restart=on-failure
Environment="NODE_ENV=production"
Environment="DATABASE_URL=postgresql://..."

[Install]
WantedBy=multi-user.target
```

## パフォーマンス最適化

### 1. データベースインデックス

```sql
-- 高速検索のためのインデックス
CREATE INDEX idx_citadela_items_categories ON citadela_items USING GIN (categories);
CREATE INDEX idx_citadela_items_tags ON citadela_items USING GIN (tags);
CREATE INDEX idx_citadela_items_location ON citadela_items USING GIST (location);
CREATE INDEX idx_citadela_items_title ON citadela_items USING GIN (to_tsvector('japanese', title));
CREATE INDEX idx_citadela_items_content ON citadela_items USING GIN (to_tsvector('japanese', content));
```

### 2. 接続プーリング

```typescript
// Prisma接続プーリング設定
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: ["error", "warn"],
  errorFormat: "minimal",
  // 接続プール設定
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      // 接続プールサイズ
      connectionLimit: 10,
    },
  },
});
```

### 3. クエリ最適化

- 必要なフィールドのみ選択（`select`句の使用）
- 適切な`limit`値の設定
- 距離計算の最適化（PostGIS 関数の活用）

## トラブルシューティング

### 一般的な問題と解決方法

1. **PostGIS 拡張が見つからない**

   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Prisma クライアントエラー**

   ```bash
   npx prisma generate
   npm install @prisma/client
   ```

3. **環境変数が読み込まれない**

   - `.env`ファイルのパスを確認
   - `dotenv`パッケージの設定を確認

4. **MCP ツールが認識されない**
   - Claude Desktop 設定を再読み込み
   - サーバープロセスの再起動

## メンテナンス

### ログ管理

```typescript
// ロギング設定例
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

### モニタリング

- レスポンスタイム測定
- エラー率の監視
- データベース接続状態
- メモリ使用量

## セキュリティ考慮事項

1. **データベース接続**

   - SSL/TLS 接続の使用
   - 接続文字列の安全な管理

2. **入力検証**

   - Zod スキーマによる型検証
   - SQL インジェクション対策（Prisma 使用）

3. **アクセス制御**
   - 必要に応じて API キー認証
   - レート制限の実装

## 今後の拡張計画

1. **追加ツール**

   - 営業時間チェックツール
   - 複数条件での高度な検索
   - データ集計・分析ツール

2. **機能改善**

   - キャッシング機構
   - 全文検索の日本語対応強化
   - リアルタイムデータ更新

3. **運用改善**
   - 自動バックアップ
   - ヘルスチェックエンドポイント
   - メトリクス収集

## 参考リンク

- [Model Context Protocol 仕様](https://modelcontextprotocol.io/)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [PostGIS ドキュメント](https://postgis.net/documentation/)
- [Claude MCP SDK](https://github.com/anthropics/claude-mcp-sdk)

## サポート

問題が発生した場合は、以下を確認してください：

1. エラーログの確認
2. データベース接続状態
3. 環境変数の設定
4. Prisma スキーマの同期状態

技術的な質問は、プロジェクトの Issue トラッカーまたは Discussions で受け付けています。
