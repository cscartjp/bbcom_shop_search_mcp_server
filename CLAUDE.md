# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL DATABASE RULES - 絶対に守ること

### マイグレーション禁止事項

**このプロジェクトから本番データベースへのマイグレーションは絶対に禁止です。**

- ❌ **絶対にやってはいけないこと**:
  - `npx prisma migrate deploy` を本番環境に対して実行
  - `npx prisma migrate dev` を本番データベースURLで実行
  - `npx prisma db push` を本番環境に対して実行
  - 本番データベースのスキーマを上書きする操作全般

- ✅ **やるべきこと**:
  - 本番データベースの変更が必要な場合は、必ず管理者に確認
  - スキーマの同期は `npx prisma db pull` で本番から取得する方向のみ
  - ローカル開発環境でのみマイグレーションを実行

### スキーマ同期の正しい手順

1. **本番スキーマの取得** (READ-ONLY):
   ```bash
   npx prisma db pull --force  # 本番からスキーマを取得
   npx prisma generate         # Prismaクライアントを生成
   ```

2. **ローカル開発のみ**:
   ```bash
   # ローカル環境のDATABASE_URLを確認してから
   npx prisma migrate dev      # ローカルでのみ実行可能
   ```

**理由**: 本番データベースは他のシステムと共有されており、このプロジェクト独自のマイグレーションを適用すると既存のデータや他のアプリケーションが破損する可能性があります。

## Development Tools

### Serena MCP Integration

このプロジェクトの開発では、Serena MCPツールを活用してください。Serena MCPは以下の機能を提供します：

- **シンボルベースのコード解析と編集**: `find_symbol`、`replace_symbol_body`などのツールを使用して、コード構造を理解し、精密な編集を行います
- **効率的なコード検索**: `search_for_pattern`、`get_symbols_overview`で必要な情報を素早く見つけます
- **メモリ管理**: プロジェクト固有の情報を`write_memory`、`read_memory`で保存・参照します

開発時は以下のアプローチを推奨：

1. **コード変更前**: `get_symbols_overview`でファイル構造を理解
2. **実装時**: `replace_symbol_body`や`insert_after_symbol`でシンボル単位の編集
3. **小規模な変更**: `replace_regex`で特定行の修正
4. **依存関係確認**: `find_referencing_symbols`で影響範囲を確認

## Project Overview

This is the BBcom Shop Search MCP Server for Miyakojima, Okinawa. It provides a Model Context Protocol (MCP) compliant server that enables AI assistants to search and retrieve information about shops, restaurants, and job listings in Miyakojima through natural language queries.

## Architecture

### Core Components

1. **MCP Server** (`src/mcp/server.ts` or `server-simple.ts`)

   - Implements Model Context Protocol specification
   - Uses StdioServerTransport for inter-process communication
   - Provides 5 main search tools

2. **Database Layer**

   - PostgreSQL with PostGIS extension for geospatial queries
   - Prisma ORM for database access
   - GIST indexes for efficient location-based searches

3. **Geocoding System**
   - Local landmark database for common Miyakojima locations
   - Optional Google Maps Geocoding API integration

### Available MCP Tools

- `searchByCategory`: Search items by category with optional location sorting
- `searchByLocation`: Find items within a radius from coordinates
- `searchByTags`: Filter items by tags with AND/OR logic
- `searchByText`: Free text search across titles and content
- `getItemById`: Retrieve detailed information for a specific item

### Data Model

The main entity is `CitadelaItem` which represents shops, restaurants, and job listings with:

- Location data (latitude, longitude, address)
- Categorization (categories array, tags array)
- Business information (opening hours, contact details)
- Content (title, subtitle, description)

## Development Commands

### Initial Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with DATABASE_URL

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### Development

```bash
# Start development server
npm run dev

# Start TypeScript development server
npx tsx src/mcp/server.ts

# Open Prisma Studio for database inspection
npx prisma studio
```

### Building

```bash
# Build for production
npm run build

# Bundle with esbuild
npx esbuild src/mcp/server.ts --bundle --platform=node --outfile=dist/server.js --external:@prisma/client --external:pg
```

### Database Operations

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration_name>

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Test database connection
npm run test:connection
```

### Testing

```bash
# Test MCP tools
npx tsx scripts/test-tools.ts

# Test specific search functionality
npx tsx scripts/test-connection.ts
```

## Project Structure

```
bbcom_shop_search_mcp_server/
├── src/
│   ├── mcp/
│   │   ├── server.ts              # Main MCP server implementation
│   │   ├── tools/                 # Individual tool implementations
│   │   └── schemas/               # Zod validation schemas
│   └── utils/
│       ├── geocoding.ts           # Geocoding utilities
│       └── landmarks.ts           # Miyakojima landmark definitions
├── prisma/
│   ├── schema.prisma             # Database schema definition
│   └── migrations/               # Database migration files
├── docs/
│   ├── mcp-server-requirements.md  # Detailed functional requirements
│   └── mcp-server-setup-guide.md   # Comprehensive setup guide
└── scripts/                      # Utility scripts for testing
```

## Key Technical Details

### PostGIS Spatial Queries

The server uses PostGIS for efficient geospatial operations:

- `ST_DWithin` for radius searches
- `ST_Distance` for distance calculations
- GIST indexes on location columns for performance

### Database Schema Highlights

- Uses PostgreSQL arrays for categories and tags (with GIN indexes)
- JSONB fields for flexible data like opening hours
- Geography type for precise geospatial calculations

### MCP Protocol Implementation

- Follows MCP specification for tool definitions
- Uses Zod for runtime parameter validation
- Returns structured JSON responses with consistent error handling

## Environment Variables

Required:

- `DATABASE_URL`: PostgreSQL connection string with PostGIS support

Optional:

- `GOOGLE_MAPS_API_KEY`: For geocoding location names to coordinates
- `MCP_SERVER_NAME`: Server identifier (default: "bbcom-miyakojima")
- `MCP_SERVER_VERSION`: Version string (default: "1.0.0")

## Common Tasks

### Adding a New Search Tool

1. Create tool implementation in `src/mcp/tools/`
2. Define Zod schema for parameters in `src/mcp/schemas/`
3. Register tool in main server file
4. Add corresponding database queries using Prisma

### Optimizing Search Performance

1. Ensure appropriate indexes exist in Prisma schema
2. Use `select` clause to fetch only needed fields
3. Implement pagination with `limit` and `offset`
4. Consider caching for frequently accessed data

### Debugging Database Queries

1. Enable Prisma query logging in development
2. Use Prisma Studio to inspect data
3. Check PostGIS function performance with EXPLAIN ANALYZE

## Integration with Claude Desktop

Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "bbcom-miyakojima": {
      "command": "node",
      "args": ["/path/to/dist/server.js"],
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}
```
