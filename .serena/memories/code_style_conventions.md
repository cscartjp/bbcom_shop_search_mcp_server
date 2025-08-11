# Code Style and Conventions

## TypeScript Configuration
- Target: ES2022
- Module: NodeNext with NodeNext resolution
- Strict mode enabled
- All strict type checking options enabled (noUnusedLocals, noUnusedParameters, noImplicitReturns, etc.)
- Source maps and declarations generated

## File Structure Conventions
- Use `.ts` extension for all TypeScript files
- ESM modules with `.js` extensions in imports (required by NodeNext)
- Organized in feature-based directories:
  - `src/mcp/` - MCP server core
  - `src/mcp/tools/` - Individual tool implementations
  - `src/mcp/schemas/` - Zod validation schemas
  - `src/utils/` - Utility functions

## Naming Conventions
- **Files**: kebab-case (e.g., `search-by-category.ts`)
- **Functions**: camelCase (e.g., `searchByCategory`, `checkIfOpen`)
- **Interfaces/Types**: PascalCase (e.g., `GeocodingResult`, `Landmark`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MIYAKOJIMA_LANDMARKS`, `TOOLS`)
- **Parameters**: camelCase with descriptive names

## Code Patterns
1. **Async/Await**: Always use async/await over promises
2. **Error Handling**: Use try-catch blocks, especially for database operations
3. **Validation**: Use Zod schemas for runtime validation
4. **Exports**: Named exports with explicit export statements
5. **Type Safety**: Leverage TypeScript's strict mode, avoid `any` type

## Database Patterns
- Use Prisma for all database operations
- Use raw SQL only for PostGIS spatial queries
- Always handle potential null values
- Use transactions for multi-step operations

## Comments and Documentation
- Minimal inline comments (code should be self-documenting)
- JSDoc comments for public APIs if needed
- Type definitions serve as documentation
- Detailed documentation in separate markdown files

## Import Organization
1. Node.js built-ins
2. External packages
3. Internal modules (with .js extension)
4. Type imports

Example:
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { PrismaClient } from '@prisma/client';
import { searchByCategory } from './tools/search-by-category.js';
```