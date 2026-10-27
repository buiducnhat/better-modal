# Code Standards — better-modal

## Language & Runtime

- **Language**: TypeScript (strict mode in `packages/better-modal/tsconfig.json`)
- **Runtime**: Bun (package manager + script runner)
- **Module**: ESM source (`"type": "module"`); the library ships ESM + CJS builds

## Formatting

Handled by **Oxfmt** via Vite+ (root `vite.config.ts`). Do not use Prettier or Biome.

Run formatting:

```bash
bun run fix     # vp check --fix — formats and applies safe lint fixes
bun run check   # vp check — verifies format, lint and types (CI parity)
```

## Linting

Handled by **Oxlint** via Vite+ (root `vite.config.ts`). Key rules enforced:

| Rule                             | Level                             |
| -------------------------------- | --------------------------------- |
| `typescript/no-explicit-any`     | Error (use `unknown` or generics) |
| `typescript/no-inferrable-types` | Error                             |
| `no-param-reassign`              | Error                             |
| `default-param-last`             | Error                             |
| `no-else-return`                 | Error                             |
| `react/self-closing-comp`        | Error                             |
| `react/rules-of-hooks`           | Error                             |
| `react/exhaustive-deps`          | Warn (React hooks)                |

Run lint:

```bash
bun run check   # same command — vp check runs format + lint + type check
```

## TypeScript

- Type checking runs as part of `vp check` (type-aware Oxlint)
- `any` is forbidden — use `unknown` or proper generics instead (`typescript/no-explicit-any: error`)
- Exported types must be explicit (no `export *` without careful review)
- Use `import type` for type-only imports

## Naming Conventions

| Entity             | Convention                  | Example                                                  |
| ------------------ | --------------------------- | -------------------------------------------------------- |
| React components   | PascalCase                  | `ModalContainer`, `ModalRenderer`                        |
| Hooks              | camelCase with `use` prefix | `useModal`, `useModalStore`                              |
| Factory functions  | camelCase                   | `createModal`, `registerModal`                           |
| Types / Interfaces | PascalCase                  | `ModalState`, `ModalStore`, `ModalId`                    |
| Type aliases       | PascalCase                  | `ModalId`                                                |
| Constants / Maps   | camelCase                   | `modalRegistry`                                          |
| Files              | kebab-case                  | `modal-container.tsx`, `use-modal.ts`, `create-modal.ts` |

## File Structure

```
packages/better-modal/src/
├── index.ts            # Public exports only — no logic here
├── types.ts            # All shared types and interfaces
├── store.ts            # Zustand store + modalRegistry
├── create-modal.ts     # createModal() factory
├── use-modal.ts        # useModal() hook
├── modal-container.tsx # React components
└── store.test.ts       # Vitest tests (import from `vite-plus/test`)
```

**Rules:**

- One concept per file
- `index.ts` re-exports only — no implementation logic
- Types live in `types.ts` unless they are component-local
- `.tsx` extension for files containing JSX; `.ts` for pure logic

## React Patterns

- Prefer `useMemo` and `useCallback` for stable references in hooks
- Subscribe to Zustand slices, never the whole store, to limit re-renders
- Use `useShallow` from `zustand/react/shallow` when subscribing to object/array slices
- Pass `modal` as an explicit prop to modal components (not via context) for clarity

## Commit Style

Use **Conventional Commits** — release automation (release-please) derives the
changelog and version bump from commit messages:

✅ `feat: add resolve/reject to useModal hook` → minor release
✅ `fix: ModalContainer not cleaning up on unmount` → patch release
✅ `refactor: store to use set callback pattern` → no release
❌ `update`
❌ `fix bug`

`feat:` → minor, `fix:` → patch, `feat!:` / `BREAKING CHANGE:` → major.
`docs:`, `chore:`, `refactor:` do not trigger releases.

## Build & Publish Checklist

Before releasing `@buiducnhat/better-modal` to npm:

1. `bun run check` — must pass with zero errors
2. `bun run test` — must pass
3. `bun run build` — must produce `dist/` with correct exports
4. Verify `package.json` exports map points to `dist/` (not `src/`)
5. Merge the release-please PR — `release.yml` publishes to npm with provenance

For a manual release (e.g. toolchain-only changes that release-please won't
pick up): bump the version in `packages/better-modal/package.json` and
`.release-please-manifest.json`, then run `gh workflow run release.yml`.

## Dependencies Policy

- The library has exactly one runtime dependency: **zustand**. Keep it that way.
- React and `@types/react` are **peer dependencies** — consumers must install them
- Build tooling (`typescript`, `vite-plus`) lives in `devDependencies`
- Never add `dependencies` to the library `package.json` without a strong reason
- Shared build config belongs in `packages/config`, not duplicated per package
