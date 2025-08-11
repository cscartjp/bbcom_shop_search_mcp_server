# Project Structure

## Directory Layout
```
bbcom_shop_search_mcp_server/
├── src/                        # Source code
│   ├── mcp/                   # MCP server implementation
│   │   ├── server.ts          # Main server entry point
│   │   ├── tools/             # Tool implementations
│   │   │   ├── search-by-category.ts
│   │   │   ├── search-by-location.ts
│   │   │   ├── search-by-tags.ts
│   │   │   ├── search-by-text.ts
│   │   │   └── get-item-by-id.ts
│   │   └── schemas/           # Zod validation schemas
│   │       └── index.ts       # All schema definitions
│   └── utils/                 # Utility functions
│       ├── geocoding.ts       # Geocoding helpers
│       └── landmarks.ts       # Miyakojima landmarks data
├── prisma/
│   └── schema.prisma          # Database schema
├── scripts/                   # Utility scripts
│   ├── test-connection.ts     # DB connection tester
│   └── test-tools.ts          # MCP tools tester
├── docs/                      # Documentation
│   ├── mcp-server-requirements.md
│   └── mcp-server-setup-guide.md
├── dist/                      # Build output (gitignored)
├── node_modules/              # Dependencies (gitignored)
├── .serena/                   # Serena MCP config
│   └── project.yml
├── package.json               # Node.js project config
├── tsconfig.json              # TypeScript config
├── .env.example               # Environment template
├── .env                       # Environment variables (gitignored)
├── .gitignore                 # Git ignore rules
├── CLAUDE.md                  # Claude AI instructions
└── README.md                  # Project documentation
```

## Key Files

### Entry Point
- `src/mcp/server.ts`: Main MCP server that registers tools and handles requests

### Database Models
- `prisma/schema.prisma`: Defines CitadelaItem and Landmark models with PostGIS support

### Tool Implementations
Each tool in `src/mcp/tools/` follows the pattern:
1. Accepts validated parameters
2. Builds database query (Prisma or raw SQL for spatial)
3. Returns structured JSON response

### Configuration Files
- `package.json`: Defines scripts and dependencies
- `tsconfig.json`: TypeScript compiler options
- `.env`: Database connection and API keys

## Data Flow
1. MCP client sends request → 
2. Server validates with Zod schema → 
3. Tool executes database query → 
4. Response formatted as JSON → 
5. Sent back to MCP client

## Important Notes
- All imports use `.js` extension (ESM requirement)
- PostGIS operations use raw SQL queries
- Prisma handles regular CRUD operations
- Tools are stateless and independent