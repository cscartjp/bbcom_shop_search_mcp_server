# BBcom Shop Search MCP Server API 仕様書

## 概要

このドキュメントは、BBcom Shop Search MCP Server が提供するツールの詳細な仕様を記載しています。

## ツール一覧

### 検索系ツール

#### 1. searchByCategory

カテゴリー別に項目を検索し、オプションで位置情報に基づいてソートします。

**パラメータ:**
- `category` (string, optional): 検索するカテゴリー
- `subCategory` (string, optional): サブカテゴリー
- `limit` (number, default: 20): 最大結果数（1-100）
- `offset` (number, default: 0): ページネーションオフセット
- `userLat` (number, optional): ユーザーの緯度（距離ソート用）
- `userLng` (number, optional): ユーザーの経度（距離ソート用）
- `sortBy` (string, default: 'updated'): ソート順 ['created', 'updated', 'title', 'distance']
- `order` (string, default: 'desc'): ソート方向 ['asc', 'desc']
- `status` (string, default: 'publish'): ステータスフィルター ['publish', 'draft', 'all']

**レスポンス:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "items": [
    {
      "itemId": 123,
      "slug": "shop-name",
      "title": "店舗名",
      "subtitle": "サブタイトル",
      "categories": ["レストラン", "カフェ"],
      "tags": ["WiFi", "駐車場"],
      "address": "宮古島市...",
      "latitude": 24.7,
      "longitude": 125.3,
      "distance": 0.5,
      "telephone": "0980-xx-xxxx",
      "webUrl": "https://example.com",
      "openingHours": {...},
      "isOpen": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-02T00:00:00Z"
    }
  ]
}
```

#### 2. searchByLocation

指定された座標から半径内の項目を検索します。

**パラメータ:**
- `latitude` (number, required): 中心緯度（-90 〜 90）
- `longitude` (number, required): 中心経度（-180 〜 180）
- `radiusKm` (number, default: 1): 検索半径（0.1 〜 50 km）
- `category` (string, optional): カテゴリーフィルター
- `tags` (string[], optional): タグフィルター
- `onlyOpen` (boolean, optional): 現在営業中の場所のみ
- `limit` (number, default: 20): 最大結果数（1-100）
- `offset` (number, default: 0): ページネーションオフセット

**レスポンス:**
```json
{
  "success": true,
  "count": 5,
  "center": {
    "latitude": 24.7,
    "longitude": 125.3
  },
  "radiusKm": 1,
  "items": [...]
}
```

#### 3. searchByTags

タグを使用して項目を検索します（AND/OR ロジック対応）。

**パラメータ:**
- `tags` (string[], required): 検索するタグの配列
- `matchAll` (boolean, default: false): true = AND検索、false = OR検索
- `category` (string, optional): カテゴリーフィルター
- `limit` (number, default: 20): 最大結果数
- `offset` (number, default: 0): ページネーションオフセット
- `userLat` (number, optional): ユーザーの緯度
- `userLng` (number, optional): ユーザーの経度

**レスポンス:**
```json
{
  "success": true,
  "count": 8,
  "matchedTags": ["WiFi", "駐車場"],
  "matchAll": false,
  "items": [...]
}
```

#### 4. searchByText

タイトル、コンテンツ、住所を横断してフリーテキスト検索を行います。

**パラメータ:**
- `query` (string, required): 検索クエリテキスト
- `searchIn` (string[], default: ['title', 'subtitle', 'content']): 検索対象フィールド
  - 選択可能: 'title', 'subtitle', 'content', 'address'
- `category` (string, optional): カテゴリーフィルター
- `tags` (string[], optional): タグフィルター
- `limit` (number, default: 20): 最大結果数
- `offset` (number, default: 0): ページネーションオフセット
- `userLat` (number, optional): ユーザーの緯度
- `userLng` (number, optional): ユーザーの経度

**レスポンス:**
```json
{
  "success": true,
  "query": "宮古島",
  "count": 15,
  "searchIn": ["title", "content"],
  "items": [...]
}
```

#### 5. getItemById

特定のIDを持つ項目の詳細情報を取得します。

**パラメータ:**
- `itemId` (number, required): 項目ID（1以上）

**レスポンス:**
```json
{
  "success": true,
  "item": {
    "itemId": 123,
    "slug": "shop-name",
    "title": "店舗名",
    "subtitle": "サブタイトル",
    "content": "詳細説明...",
    "status": "publish",
    "categories": ["レストラン"],
    "tags": ["WiFi"],
    "address": "宮古島市...",
    "latitude": 24.7,
    "longitude": 125.3,
    "telephone": "0980-xx-xxxx",
    "email": "info@example.com",
    "webUrl": "https://example.com",
    "webUrlLabel": "公式サイト",
    "openingHours": {
      "monday": ["09:00-18:00"],
      "tuesday": ["09:00-18:00"],
      ...
    },
    "showEmail": true,
    "showOpeningHours": true,
    "useContactForm": false,
    "mapEnabled": true,
    "streetviewEnabled": true,
    "featured": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

### カテゴリー管理ツール

#### 6. listCategories

利用可能なカテゴリーの一覧を取得します。デフォルトではアイテム数の多い上位10件を返します。

**パラメータ:**
- `includeCount` (boolean, default: true): 各カテゴリーのアイテム数を含めるか
- `orderBy` (string, default: 'item_count'): ソート順
  - 'name': カテゴリー名順（昇順）
  - 'item_count': アイテム数順（降順）
  - 'created_at': 作成日時順（降順）
- `limit` (number, default: 10): 返すカテゴリーの最大数（1-100）

**レスポンス:**
```json
{
  "success": true,
  "count": 25,
  "categories": [
    {
      "id": 1,
      "name": "レストラン",
      "slug": "restaurant",
      "description": "宮古島のレストラン",
      "itemCount": 45,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "カフェ",
      "slug": "cafe",
      "description": "カフェ・喫茶店",
      "itemCount": 32,
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-16T09:15:00.000Z"
    }
  ]
}
```

**エラーレスポンス:**
```json
{
  "success": false,
  "error": "Database connection failed",
  "categories": []
}
```

#### 7. checkCategory

特定のカテゴリーが存在するか確認し、存在しない場合は類似候補を提案します。

**パラメータ:**
- `name` (string, required): 確認したいカテゴリー名
- `fuzzy` (boolean, default: false): 
  - true: 部分一致検索（大文字小文字を区別しない）
  - false: 完全一致検索（大文字小文字を区別しない）

**レスポンス（カテゴリーが存在する場合）:**
```json
{
  "success": true,
  "exists": true,
  "category": {
    "id": 1,
    "name": "レストラン",
    "slug": "restaurant",
    "description": "宮古島のレストラン",
    "itemCount": 45,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**レスポンス（カテゴリーが存在しない場合）:**
```json
{
  "success": true,
  "exists": false,
  "message": "Category \"レストラ\" not found",
  "suggestions": [
    "レストラン",
    "レストランバー"
  ]
}
```

**エラーレスポンス:**
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

## 共通仕様

### エラーハンドリング

すべてのツールは以下の形式でエラーを返す可能性があります：

```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

### 日時フォーマット

すべての日時は ISO 8601 形式（例：`2024-01-01T00:00:00Z`）で返されます。

### 距離計算

距離は PostGIS の `ST_Distance` 関数を使用して計算され、キロメートル単位で返されます。

### 営業時間フォーマット

営業時間は以下の形式で返されます：

```json
{
  "monday": ["09:00-12:00", "13:00-18:00"],
  "tuesday": ["09:00-18:00"],
  "wednesday": ["closed"],
  ...
}
```

## 使用例

### カテゴリー一覧を取得してから検索

```javascript
// 1. まず利用可能なカテゴリーを確認
const categories = await listCategories({
  includeCount: true,
  orderBy: 'item_count'
});

// 2. 特定のカテゴリーが存在するか確認
const categoryCheck = await checkCategory({
  name: "レストラン",
  fuzzy: false
});

// 3. カテゴリーで検索
if (categoryCheck.exists) {
  const results = await searchByCategory({
    category: categoryCheck.category.name,
    limit: 10,
    sortBy: 'distance',
    userLat: 24.7,
    userLng: 125.3
  });
}
```

### 位置情報ベースの複合検索

```javascript
// 現在地から1km以内のレストランを検索
const nearbyRestaurants = await searchByLocation({
  latitude: 24.7,
  longitude: 125.3,
  radiusKm: 1,
  category: "レストラン",
  onlyOpen: true
});
```

## 注意事項

1. **レート制限**: 現在レート制限は実装されていませんが、将来的に追加される可能性があります。
2. **データ更新**: データベースの内容は定期的に更新されます。
3. **位置情報精度**: 座標は小数点以下6桁まで有効です。
4. **カテゴリー名**: カテゴリー名の検索は大文字小文字を区別しません。

## 変更履歴

- 2024-01-XX: カテゴリー管理ツール（listCategories, checkCategory）を追加
- 2024-01-01: 初版リリース