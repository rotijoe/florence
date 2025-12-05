# Linting

- ESLint uses the flat config at `eslint.config.mjs` with TypeScript and Prettier layers shared across packages. Quote rules are re-applied after Prettier so they stay enforced.
- Quotes are enforced as single for both JS/TS strings (`quotes`) and JSX attributes (`jsx-quotes`); double quotes will fail lint.
- Prettier is aligned with the lint rule (`singleQuote: true`, `jsxSingleQuote: true`) to avoid formatting conflicts.
- Test files are linted in the web app (spec/test files are no longer ignored).
- Run `pnpm lint` at the root to lint all workspaces; package-level lint scripts remain available via `pnpm --filter`.

