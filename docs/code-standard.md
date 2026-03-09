# Code Standards — better-modal

## Language & Runtime

- **Language**: TypeScript (strict mode via shared `tsconfig.base.json`)
- **Runtime**: Bun (package manager + script runner)
- **Target**: ESM only (`"type": "module"` in all packages)

## Formatting

Handled by **Biome** (`biome.json` at repo root). Do not use Prettier.

| Rule                | Setting                     |
| ------------------- | --------------------------- |
| Indent style        | Tabs                        |
| Quote style         | Double quotes (JS/TS)       |
| Import organisation | Auto-sorted by Biome assist |

Run formatting:

```bash
bun run check   # biome check --write .
```

## Linting

Also handled by **Biome**. Key rules enforced:

| Rule                        | Level                                        |
| --------------------------- | -------------------------------------------- |
| `noExplicitAny`             | Error (enforced — use `unknown` or generics) |
| `noParameterAssign`         | Error                                        |
| `useAsConstAssertion`       | Error                                        |
| `useSelfClosingElements`    | Error                                        |
| `noUselessElse`             | Error                                        |
| `useExhaustiveDependencies` | Info (React hooks)                           |

Run lint:

```bash
bun run check   # same command — Biome lints and formats together
```

## TypeScript

- All packages extend `@better-modal/config/tsconfig.base.json`
- `any` is forbidden — use `unknown` or proper generics instead (`noExplicitAny: error` in Biome)
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
└── modal-container.tsx # React components
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

Free-form commit messages. Aim to be descriptive:

✅ `add resolve/reject to useModal hook`
✅ `fix: ModalContainer not cleaning up on unmount`
✅ `refactor store to use set callback pattern`
❌ `update`
❌ `fix bug`

## Build & Publish Checklist

Before publishing `@buiducnhat/better-modal` to npm:

1. `bun run check-types` — must pass with zero errors
2. `bun run check` — must pass with zero errors
3. `bun run build` — must produce `dist/` with correct exports
4. Verify `package.json` exports map points to `dist/` (not `src/`)
5. Bump version in `packages/better-modal/package.json`
6. `npm publish --access public`

## Dependencies Policy

- **Zero runtime dependencies** in the library package (only Bun scripts and build tools as devDeps)
- React and Zustand are **peer dependencies** — consumers must install them
- Never add `dependencies` to the library `package.json` without a strong reason
- Shared build config belongs in `packages/config`, not duplicated per package
