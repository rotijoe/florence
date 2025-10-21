# TypeScript Type Checking Setup

## Overview

Robust TypeScript type checking has been configured across all packages in the monorepo using a centralized turbo-based approach.

## Available Commands

### Root Level (checks all packages)

```bash
pnpm typecheck
```

### Package Level

```bash
# Database package
pnpm --filter @packages/database typecheck

# API package
pnpm --filter @app/api typecheck

# Web package
pnpm --filter @app/web typecheck
```

### Watch Mode (database only)

```bash
pnpm --filter @packages/database typecheck:watch
```

## Configuration

### TypeScript Configurations

**Root:** `tsconfig.base.json` - Base configuration for all packages

- Strict mode enabled
- ESNext module system
- Path aliases configured for workspace packages

**Database:** `packages/database/tsconfig.json`

- Extends base config
- Uses Bundler module resolution for better ESM support
- Includes Prisma-generated types
- Includes: `src/**/*`, `prisma/**/*`

**API:** `apps/api/tsconfig.json`

- Extends base config
- Configured for Hono API endpoints

**Web:** `apps/web/tsconfig.json`

- Extends base config
- Configured for Next.js with React

### Script Locations

Each package has a `typecheck` script in its `package.json`:

- `@packages/database` - includes watch mode
- `@app/api`
- `@app/web`

The root `package.json` includes a `typecheck` script that runs all package checks via Turbo.

## Integration with CI/CD

Add to your CI pipeline:

```yaml
- name: Type Check
  run: pnpm typecheck
```

## Troubleshooting

### Editor showing errors but tsc passes

If your editor shows TypeScript errors but `pnpm typecheck` passes:

1. **Restart TypeScript Server**

   - VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
   - Cursor: Same command

2. **Regenerate Prisma Client** (if working with database)

   ```bash
   pnpm --filter @packages/database db:generate
   ```

3. **Clear Turbo Cache**

   ```bash
   rm -rf .turbo
   pnpm typecheck
   ```

4. **Reinstall Dependencies**
   ```bash
   pnpm install
   pnpm typecheck
   ```

### Module resolution issues

If you encounter "Cannot find module" errors:

- Ensure you're using the correct relative or alias paths
- Check that workspace dependencies are properly linked
- Verify `tsconfig.json` paths match your project structure

## Best Practices

1. **Run typecheck before commits**

   - Consider adding to pre-commit hooks

2. **Fix type errors immediately**

   - Don't use `@ts-ignore` or `any` without good reason
   - Type errors indicate actual bugs in many cases

3. **Keep TypeScript versions aligned**

   - All packages should use the same TypeScript version
   - Currently using: `^5.8.3` (database/api) and `^5` (web)

4. **Leverage Turbo caching**
   - Turbo caches successful typecheck results
   - Only changed packages are rechecked

## Performance

Turbo parallelizes type checking across packages:

- Typical full check: ~3-4 seconds
- Cached checks: <1 second
- Watch mode: incremental checks in milliseconds
