# Suggested Commands for BBcom Shop Search MCP Server

## Development Commands
```bash
# Install dependencies
npm install

# Generate Prisma client (after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev

# Run TypeScript files directly
npx tsx <file.ts>

# Open Prisma Studio for database inspection
npx prisma studio
```

## Testing Commands
```bash
# Test database connection
npm run test:connection

# Test MCP tools
npm run test:tools

# Type checking (lint)
npm run lint
npm run typecheck
```

## Build Commands
```bash
# Build for production
npm run build

# Manual esbuild command
npx esbuild src/mcp/server.ts --bundle --platform=node --outfile=dist/server.js --external:@prisma/client --external:pg
```

## Database Commands
```bash
# Create new migration
npx prisma migrate dev --name <migration_name>

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Push schema changes without migration (development only)
npx prisma db push
```

## Git Commands (Darwin/macOS)
```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "message"

# View logs
git log --oneline

# Create branch
git checkout -b <branch-name>
```

## System Commands (Darwin/macOS)
```bash
# List files with details
ls -la

# Search for files
find . -name "*.ts"

# Search in files (using ripgrep if available)
rg "pattern" --type ts

# Check Node.js version
node --version

# Check npm packages
npm list

# View environment variables
env | grep DATABASE
```

## Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env  # or vim .env
```