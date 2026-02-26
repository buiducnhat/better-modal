# better-modal

A lightweight React library for declarative modal state management — open modals imperatively from anywhere in your app and await their results as Promises.

**Stack:** TypeScript · React 19 · Zustand 5 · Bun · Turborepo · Biome

---

## Features

- 🔌 **Drop-in** — place `<ModalContainer />` once in your app root, done
- ⚡ **Imperative API** — call `Modal.show(props)` from anywhere, including outside React
- 🤝 **Promise-based results** — `await Modal.show()` and get the user's response
- 🎯 **Selective re-renders** — each modal subscribes only to its own Zustand slice
- 🧩 **Headless & UI-agnostic** — works with any component library (MUI, shadcn, Radix, etc.)
- 🔒 **Type-safe** — full TypeScript support for modal props

---

## Prerequisites

- Node.js 18+ or Bun 1.x
- React 19+
- Zustand 5+

---

## Installation

```bash
# npm
npm install @buiducnhat/better-modal zustand

# bun
bun add @buiducnhat/better-modal zustand
```

---

## Quick Start

### 1. Add `<ModalContainer />` to your app root

```tsx
import { ModalContainer } from "@buiducnhat/better-modal";

function App() {
  return (
    <>
      <YourRoutes />
      <ModalContainer />
    </>
  );
}
```

### 2. Create a modal

```tsx
import { createModal } from "@buiducnhat/better-modal";

const ConfirmModal = createModal(
  "confirm",
  ({ modal, title }: { modal: any; title: string }) => (
    <dialog open={modal.visible}>
      <p>{title}</p>
      <button onClick={() => modal.resolve(true)}>Confirm</button>
      <button onClick={() => modal.resolve(false)}>Cancel</button>
    </dialog>
  ),
);
```

### 3. Open it from anywhere

```ts
// Inside or outside React components
const confirmed = await ConfirmModal.show({ title: "Delete this item?" });

if (confirmed) {
  deleteItem();
}
```

---

## API Reference

### `createModal(id, Component)`

Registers a modal component and returns a typed controller.

```ts
const Modal = createModal("my-modal", MyComponent);

Modal.show(props); // → Promise<result>
Modal.hide(); // close without resolving
```

### `useModal(id)`

Hook to access modal state inside a modal component.

```ts
const modal = useModal("my-modal");

modal.visible; // boolean — is the modal open?
modal.props; // props passed to show()
modal.resolve(val); // close + resolve the Promise
modal.reject(err); // close + reject the Promise
modal.hide(); // close without resolving
modal.remove(); // remove from store entirely
```

### `<ModalContainer />`

Place once at your app root. Renders all active modals.

### `registerModal(id, Component)`

Low-level alternative to `createModal` — registers a component without returning the controller.

---

## Documentation

| Doc                                       | Description                             |
| ----------------------------------------- | --------------------------------------- |
| [Project PDR](./docs/project-pdr.md)      | Product requirements and roadmap        |
| [Architecture](./docs/architecture.md)    | System design and data flow             |
| [Codebase Map](./docs/codebase.md)        | File structure and public API reference |
| [Code Standards](./docs/code-standard.md) | Conventions, naming, and tooling        |

---

## Development

```bash
# Install dependencies
bun install

# Type-check all packages
bun run check-types

# Lint and format
bun run check

# Build for publishing
bun run build
```

---

## License

MIT
