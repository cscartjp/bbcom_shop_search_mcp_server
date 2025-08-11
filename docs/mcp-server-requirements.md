# MCP サーバー機能要件定義書

## 1. 概要

### 1.1 目的

宮古島の店舗・求人情報データベースに対して、AI アシスタント（Claude 等）から自然言語でアクセスできる MCP サーバーを提供する。

### 1.2 スコープ

- 位置情報ベースの検索機能
- カテゴリー/タグによる絞り込み検索
- 店舗・求人情報の詳細取得
- 営業時間・ステータスによるフィルタリング

## 2. ユースケース

### 2.1 近隣検索

**シナリオ**: ユーザーが現在地から半径 1km 以内の飲食店を探す

```
入力: 緯度24.8047, 経度125.2775, 半径1000m, カテゴリー"グルメ"
出力: 該当する店舗リスト（距離順）
```

### 2.2 カテゴリー検索

**シナリオ**: 求人情報を業種別に検索

```
入力: カテゴリー"求人情報", サブカテゴリー"飲食系"
出力: 該当する求人リスト（更新日順）
```

### 2.3 営業中店舗検索

**シナリオ**: 現在営業中の居酒屋を検索

```
入力: カテゴリー"居酒屋", 現在時刻, 営業中フィルター
出力: 営業中の居酒屋リスト
```

## 3. MCP ツール仕様

### 3.1 searchByLocation

**説明**: 指定座標から半径内のアイテムを検索

**パラメータ**:

```typescript
{
  latitude: number;      // 緯度（必須）
  longitude: number;     // 経度（必須）
  radius?: number;       // 検索半径(m)、デフォルト1000
  category?: string;     // カテゴリーフィルター
  tags?: string[];       // タグフィルター
  onlyOpen?: boolean;    // 営業中のみ
  limit?: number;        // 結果上限、デフォルト20
  offset?: number;       // ページネーション用
}
```

**レスポンス**:

```typescript
{
  items: Array<{
    item_id: number;
    title: string;
    subtitle: string;
    address: string;
    distance: number; // メートル単位
    latitude: number;
    longitude: number;
    categories: string[];
    tags: string[];
    is_open?: boolean; // 営業状態
  }>;
  total: number; // 総件数
  has_more: boolean; // 追加結果の有無
}
```

### 3.2 searchByCategory

**説明**: カテゴリー/タグでアイテムを検索

**パラメータ**:

```typescript
{
  category?: string;     // メインカテゴリー
  subCategory?: string;  // サブカテゴリー
  tags?: string[];       // タグリスト
  status?: 'publish' | 'draft';  // 公開状態
  sortBy?: 'created' | 'updated' | 'title';  // ソート順
  order?: 'asc' | 'desc';  // 並び順
  limit?: number;        // 結果上限、デフォルト20
  offset?: number;       // ページネーション用
}
```

**レスポンス**:

```typescript
{
  items: Array<{
    item_id: number;
    title: string;
    subtitle: string;
    categories: string[];
    tags: string[];
    created_at: string;
    updated_at: string;
    status: string;
  }>;
  total: number;
  has_more: boolean;
}
```

### 3.3 getItemDetails

**説明**: アイテムの詳細情報を取得

**パラメータ**:

```typescript
{
  item_id?: number;      // アイテムID
  slug?: string;         // URLスラッグ
  include_html?: boolean; // HTMLコンテンツを含むか
}
```

**レスポンス**:

```typescript
{
  item_id: number;
  slug: string;
  title: string;
  subtitle: string;
  content?: string;      // HTMLコンテンツ（オプション）
  content_text?: string; // プレーンテキスト版
  status: string;
  created_at: string;
  updated_at: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    map_enabled: boolean;
  };
  contact: {
    telephone: string;
    email: string;
    web_url: string;
    web_url_label: string;
  };
  opening_hours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    note: string;
    is_open_now?: boolean;
  };
  categories: string[];
  tags: string[];
  tax_map: string;
}
```

### 3.4 searchByKeyword

**説明**: キーワードで全文検索

**パラメータ**:

```typescript
{
  keyword: string;       // 検索キーワード（必須）
  fields?: string[];     // 検索対象フィールド
  fuzzy?: boolean;       // あいまい検索
  limit?: number;        // 結果上限
  offset?: number;       // ページネーション用
}
```

**レスポンス**:

```typescript
{
  items: Array<{
    item_id: number;
    title: string;
    subtitle: string;
    matched_fields: string[]; // マッチしたフィールド
    score: number; // 関連度スコア
  }>;
  total: number;
  has_more: boolean;
}
```

### 3.5 getCategories

**説明**: 利用可能なカテゴリー一覧を取得

**パラメータ**:

```typescript
{
  include_count?: boolean;  // 各カテゴリーのアイテム数を含む
}
```

**レスポンス**:

```typescript
{
  categories: Array<{
    name: string;
    slug: string;
    count?: number;
    sub_categories?: Array<{
      name: string;
      slug: string;
      count?: number;
    }>;
  }>;
}
```

## 4. データベース要件

### 4.1 テーブル構造

```sql
CREATE TABLE items (
  item_id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  subtitle TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,

  -- 位置情報
  address TEXT,
  location GEOGRAPHY(POINT, 4326),  -- PostGIS型
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- 連絡先
  telephone VARCHAR(50),
  email VARCHAR(255),
  web_url TEXT,
  web_url_label VARCHAR(255),

  -- 営業時間（JSON型）
  opening_hours JSONB,

  -- カテゴリー・タグ（配列型）
  categories TEXT[],
  tags TEXT[],
  tax_map TEXT,

  -- インデックス
  INDEX idx_location USING GIST(location),
  INDEX idx_categories GIN(categories),
  INDEX idx_tags GIN(tags),
  INDEX idx_status (status),
  INDEX idx_updated (updated_at DESC)
);
```

### 4.2 PostGIS 関数の利用

```sql
-- 距離計算
ST_Distance(location::geography, ST_MakePoint(lng, lat)::geography)

-- 半径内検索
ST_DWithin(location::geography, ST_MakePoint(lng, lat)::geography, radius)

-- バウンディングボックス検索（高速化）
location && ST_Expand(ST_MakePoint(lng, lat)::geometry, degrees)
```

## 5. 実装要件

### 5.1 技術スタック

- **言語**: TypeScript
- **フレームワーク**: @modelcontextprotocol/sdk
- **ORM**: Prisma + prisma-extension-postgis
- **データベース**: PostgreSQL 14+ with PostGIS 3.0+
- **バリデーション**: Zod
- **ロギング**: Winston

### 5.2 エラーハンドリング

- 適切な HTTP ステータスコードの返却
- エラーメッセージの標準化
- ロギングレベルの適切な設定（error, warn, info, debug）

### 5.3 パフォーマンス要件

- 位置情報検索: 1000 件以内で 100ms 以下
- カテゴリー検索: 50ms 以下
- 詳細取得: 20ms 以下
- 同時接続数: 100 接続まで対応

### 5.4 セキュリティ要件

- SQL インジェクション対策（Prisma 使用）
- レート制限の実装
- 環境変数による機密情報管理
- HTML コンテンツのサニタイゼーション

## 6. テスト要件

### 6.1 ユニットテスト

- 各ツール関数のテスト
- バリデーションロジックのテスト
- エラーケースのテスト

### 6.2 統合テスト

- データベース接続テスト
- PostGIS 関数の動作確認
- MCP プロトコル準拠テスト

### 6.3 パフォーマンステスト

- 大量データでの検索速度
- 同時アクセステスト
- メモリ使用量の監視

## 7. デプロイ要件

### 7.1 環境変数

```env
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
MCP_SERVER_PORT=3000
LOG_LEVEL=info
MAX_RESULTS_PER_PAGE=100
DEFAULT_SEARCH_RADIUS=1000
```

### 7.2 必要な拡張機能

- PostgreSQL: PostGIS 拡張
- Node.js: 20.x 以上

### 7.3 監視項目

- サーバー稼働状況
- レスポンスタイム
- エラー率
- データベース接続プール状態

## 8. 今後の拡張機能

### 8.1 Phase 2

- 画像データの管理と配信
- お気に入り機能
- レビュー・評価機能
- 多言語対応

### 8.2 Phase 3

- リアルタイム更新通知
- 予約・問い合わせ機能
- 統計・分析ダッシュボード
- AI による推薦機能
