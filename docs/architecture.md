# Architecture — better-modal

## Overview

better-modal is a **Bun monorepo** managed by **Turborepo**. It contains one publishable library package and one shared config package.

```
better-modal/                    # Monorepo root
├── packages/
│   ├── better-modal/            # @buiducnhat/better-modal — main publishable library
│   └── config/                  # @better-modal/config — shared TypeScript config
├── biome.json                   # Shared linting + formatting config (Biome)
├── turbo.json                   # Turborepo pipeline config
├── package.json                 # Root workspace manifest (Bun workspaces)
└── bun.lock                     # Bun lockfile
```

## Packages

### `@buiducnhat/better-modal` (`packages/better-modal`)

The single publishable package. All public API lives under `src/`:

```
src/
├── index.ts             # Public entry point — re-exports all public symbols
├── types.ts             # Shared TypeScript types (ModalId, ModalState, ModalStore)
├── store.ts             # Zustand store + modalRegistry Map
├── create-modal.ts      # createModal() factory function
├── use-modal.ts         # useModal() React hook
└── modal-container.tsx  # <ModalContainer /> React component
```

### `@better-modal/config` (`packages/config`)

Shared internal config (currently `tsconfig.base.json`). Private — never published.

## Data Flow

```
User code
  │
  ├── createModal(id, Component)
  │     └──► modalRegistry.set(id, Component)   // registers in Map
  │     └──► returns { id, show(), hide() }
  │
  ├── Modal.show(props)
  │     └──► useModalStore.open(id, props)       // sets modals[id].isOpen = true
  │     └──► returns Promise<result>             // resolvers stored in modal state
  │
  └── <ModalContainer />  (placed once in app root)
        └── subscribes to useModalStore (Object.keys(modals))
        └── for each active id:
              └── <ModalRenderer id={id} />
                    └── looks up Component in modalRegistry
                    └── passes modal = useModal(id) as prop
                          └── { visible, props, show, hide, resolve, reject }
```

### Modal lifecycle

```
show(props)
  → modals[id] = { isOpen: true, props, resolve, reject }
  → ModalContainer renders <Component modal={...} />
  → Component calls modal.resolve(value) or modal.reject(reason)
  → store calls resolve/reject callback, then sets isOpen = false
  → Promise resolves/rejects in caller
```

## State Management

**Zustand** (`useModalStore`) is the single source of truth for all modal state.

| Store slice          | Type                          | Description                             |
| -------------------- | ----------------------------- | --------------------------------------- |
| `modals`             | `Record<ModalId, ModalState>` | Map of all registered modal states      |
| `open(id, props)`    | `() => Promise<any>`          | Opens a modal, stores Promise resolvers |
| `hide(id)`           | `() => void`                  | Sets `isOpen = false` without resolving |
| `remove(id)`         | `() => void`                  | Removes modal state from store entirely |
| `resolve(id, value)` | `() => void`                  | Resolves Promise + hides modal          |
| `reject(id, reason)` | `() => void`                  | Rejects Promise + hides modal           |

The `modalRegistry` is a plain `Map<ModalId, React.FC>` (not Zustand state) — it holds component references and never changes after registration.

## Build System

| Tool          | Role                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------- |
| **Turborepo** | Task orchestration: `build`, `dev`, `check-types`, `lint` with dependency-aware ordering |
| **tsdown**    | Bundles the library package into `dist/` for npm publishing                              |
| **Biome**     | Linting and formatting across all packages (single config at root)                       |
| **Bun**       | Package manager and workspace runner                                                     |

### Turborepo task pipeline

```
build     → outputs: dist/**   (depends on ^build)
check-types → (depends on ^check-types)
dev       → persistent, no cache
```

## Deployment

This is a library — it is deployed by publishing to npm:

```bash
bun run build   # builds dist/ via tsdown
npm publish     # publishes @buiducnhat/better-modal
```

No server, no database, no auth. Pure frontend library.

## Key Design Decisions

| Decision                                 | Rationale                                                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Zustand for state                        | Minimal, selector-based subscriptions prevent unnecessary re-renders; state accessible outside React |
| Promise-based `show()`                   | Enables `await Modal.show()` patterns — treating modals like async dialogs                           |
| `modalRegistry` as a Map                 | Component references don't need to be reactive state — a plain Map is simpler and faster             |
| Zustand slice subscription in `useModal` | Each modal component subscribes only to `state.modals[id]`, not the whole store                      |
| `useShallow` in ModalContainer           | Prevents re-render when modal count is unchanged but a modal's props update                          |
| Headless (no UI)                         | Library is UI-agnostic — works with any component library (MUI, shadcn, Radix, etc.)                 |
