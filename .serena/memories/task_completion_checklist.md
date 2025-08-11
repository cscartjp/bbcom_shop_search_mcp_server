# Task Completion Checklist

When completing any development task in this project, ensure the following steps are performed:

## 1. Code Quality Checks
```bash
# Run TypeScript type checking
npm run lint
npm run typecheck
```

## 2. Testing
```bash
# If database-related changes
npm run test:connection

# If tool implementation changes
npm run test:tools
```

## 3. Prisma Updates (if schema changed)
```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <descriptive_name>
```

## 4. Build Verification
```bash
# Ensure the project builds successfully
npm run build
```

## 5. Documentation Updates
- Update CLAUDE.md if architecture changes
- Update README.md for new features or commands
- Update inline documentation if API changes

## 6. Git Workflow
```bash
# Check what changed
git status
git diff

# Stage and commit with descriptive message
git add .
git commit -m "feat/fix/chore: descriptive message"
```

## Common Issues to Check
- All imports use `.js` extension (required by NodeNext)
- No unused imports or variables (TypeScript strict mode)
- Proper error handling for async operations
- Database queries handle null values appropriately
- PostGIS functions used correctly for spatial queries

## Before Marking Task Complete
1. ✅ Code compiles without errors
2. ✅ Type checking passes
3. ✅ Tests pass (if applicable)
4. ✅ Build succeeds
5. ✅ Documentation is updated
6. ✅ Changes are committed