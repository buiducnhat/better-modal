# Codebase Map — better-modal

## Repository Structure

```
better-modal/
├── packages/
│   ├── better-modal/                  # @buiducnhat/better-modal — publishable library
│   │   ├── src/
│   │   │   ├── index.ts               # Public entry: re-exports all public symbols
│   │   │   ├── types.ts               # Shared types: ModalId, ModalState, ModalStore
│   │   │   ├── store.ts               # Zustand store (useModalStore) + modalRegistry Map
│   │   │   ├── create-modal.ts        # createModal() — registers a modal, returns show/hide API
│   │   │   ├── use-modal.ts           # useModal(id) — React hook for modal state & actions
│   │   │   └── modal-container.tsx    # <ModalContainer /> — renders all active modals
│   │   └── package.json
│   └── config/
│       ├── tsconfig.base.json         # Shared TypeScript base config
│       └── package.json
├── docs/
│   ├── project-pdr.md                 # Product requirements and business context
│   ├── architecture.md               # System design and data flow
│   ├── codebase.md                   # This file — codebase map
│   └── code-standard.md              # Coding conventions and standards
├── biome.json                         # Biome lint + format config (repo-wide)
├── turbo.json                         # Turborepo pipeline: build, dev, check-types
├── package.json                       # Root workspace manifest (Bun workspaces)
├── bun.lock                           # Bun lockfile
├── bts.jsonc                          # Better-T-Stack scaffold config (safe to delete)
└── CLAUDE.md                          # Claude Code project instructions
```

## Key Files

| File                                            | Purpose                                              |
| ----------------------------------------------- | ---------------------------------------------------- |
| `packages/better-modal/src/index.ts`            | Public API surface — start here                      |
| `packages/better-modal/src/store.ts`            | Core state: Zustand store + modal component registry |
| `packages/better-modal/src/types.ts`            | All shared TypeScript types                          |
| `packages/better-modal/src/create-modal.ts`     | Factory to register + expose a typed modal           |
| `packages/better-modal/src/use-modal.ts`        | Hook used inside modal components                    |
| `packages/better-modal/src/modal-container.tsx` | Must be placed once at the app root                  |
| `biome.json`                                    | Single source of truth for lint/format rules         |
| `turbo.json`                                    | Task dependency graph for all packages               |

## Public API (`@buiducnhat/better-modal`)

### Exports

```ts
import {
  createModal, // Register a modal + get show/hide API
  ModalContainer, // Place once in app root to render modals
  registerModal, // Low-level: register a component by ID
  useModal, // Hook: access modal state inside a modal component
} from "@buiducnhat/better-modal";
```

### `createModal(id, Component)`

```ts
const ConfirmModal = createModal("confirm", ({ modal, title }) => (
  <dialog open={modal.visible}>
    <p>{title}</p>
    <button onClick={() => modal.resolve(true)}>Yes</button>
    <button onClick={() => modal.resolve(false)}>No</button>
  </dialog>
));

// Open from anywhere:
const result = await ConfirmModal.show({ title: "Are you sure?" });
```

Returns: `{ id: string, show(props?) => Promise<any>, hide() => void }`

### `useModal(id)`

```ts
const modal = useModal("confirm");
// modal.visible   — boolean
// modal.props     — the props passed to show()
// modal.show()    — open the modal
// modal.hide()    — close without resolving
// modal.resolve() — close + resolve the Promise
// modal.reject()  — close + reject the Promise
// modal.remove()  — remove from store entirely
```

### `<ModalContainer />`

```tsx
// Place once in your app root:
<ModalContainer />
```

Renders all modals that have been opened via `show()`. Uses `useShallow` to avoid unnecessary re-renders.

### `registerModal(id, Component)`

Low-level registration without the `show/hide` return API. Used internally by `createModal`.

## Dependency Graph

```
@buiducnhat/better-modal
  peerDependencies:
    react ^19
    zustand ^5
    typescript (catalog)
  devDependencies:
    @better-modal/config (workspace)
    @types/react ^19
    tsdown (catalog)
```

## Scripts

| Command               | What it does                                   |
| --------------------- | ---------------------------------------------- |
| `bun run dev`         | Turborepo dev mode (watch) across all packages |
| `bun run build`       | Build all packages via Turborepo → tsdown      |
| `bun run check-types` | TypeScript type-check across all packages      |
| `bun run check`       | Biome lint + format (writes fixes in place)    |
