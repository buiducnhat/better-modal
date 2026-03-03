---
name: better-modal
description: >
  Guide for using @buiducnhat/better-modal — the headless, Promise-based React modal
  state management library. Apply when writing, reviewing, or refactoring modal code
  in any React app that uses this package. Covers installation, all public APIs,
  React/Vercel best practices, TypeScript patterns, and common anti-patterns to avoid.
metadata:
  author: buiducnhat
  version: "1.0.0"
---

# better-modal Usage Guide

`@buiducnhat/better-modal` is a **headless, Promise-based** modal state manager for React 19+.
It centralises all modal state in a Zustand store and lets you open modals imperatively from
**anywhere** in your app — including outside React components — then `await` the result.

---

## Installation

```bash
# npm
npm install @buiducnhat/better-modal zustand

# bun
bun add @buiducnhat/better-modal zustand
```

Peer dependencies that must be installed separately:

- `react ^19`
- `zustand ^5`

---

## Quick-Start (3 Steps)

### Step 1 — Place `<ModalContainer />` once at the app root

```tsx
// app/layout.tsx (Next.js) or main.tsx (Vite)
import { ModalContainer } from "@buiducnhat/better-modal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <ModalContainer /> {/* ← required, exactly once */}
      </body>
    </html>
  );
}
```

### Step 2 — Define a modal with `createModal`

```tsx
// modals/confirm-modal.tsx
import { createModal } from "@buiducnhat/better-modal";
import type { useModal } from "@buiducnhat/better-modal";

type Props = { title: string; message: string };

export const ConfirmModal = createModal<Props>(
  "confirm",
  ({ title, message, modal }) => (
    <dialog open={modal.visible}>
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={() => modal.resolve(true)}>Confirm</button>
      <button onClick={() => modal.resolve(false)}>Cancel</button>
    </dialog>
  ),
);
```

### Step 3 — Open the modal from anywhere

```tsx
// Any component, server action boundary, or plain module
import { ConfirmModal } from "@/modals/confirm-modal";

async function handleDelete() {
  const confirmed = await ConfirmModal.show({
    title: "Delete item",
    message: "This action cannot be undone.",
  });
  if (confirmed) {
    await deleteItem();
  }
}
```

---

## Public API

### `createModal(id, Component)` → `{ id, show, hide }`

Registers a modal component and returns its control object.

| Return | Type                          | Description                                   |
| ------ | ----------------------------- | --------------------------------------------- |
| `id`   | `string`                      | The ID used to register the modal             |
| `show` | `(props?: T) => Promise<any>` | Opens the modal, returns an awaitable Promise |
| `hide` | `() => void`                  | Closes without resolving the Promise          |

```ts
const MyModal = createModal<MyProps>("my-modal", MyComponent);

const result = await MyModal.show({
  /* props */
});
MyModal.hide();
```

**Rules:**

- Call `createModal` at **module level** (outside components) — it registers once.
- The `id` string must be globally unique across your app.
- Generic `T` types the props passed to `show()`.

---

### `useModal(id)` — Hook used **inside** a modal component

Subscribe to a modal's state from within its own component.

```ts
const modal = useModal("my-modal");
```

| Property  | Type                     | Description                                |
| --------- | ------------------------ | ------------------------------------------ |
| `visible` | `boolean`                | Whether the modal is currently open        |
| `props`   | `T`                      | Props passed to `show()`                   |
| `show`    | `(props?: T) => Promise` | Imperatively open this modal               |
| `hide`    | `() => void`             | Close without resolving                    |
| `resolve` | `(value: any) => void`   | Close + resolve the awaiting Promise       |
| `reject`  | `(reason: any) => void`  | Close + reject the awaiting Promise        |
| `remove`  | `() => void`             | Remove modal from store entirely (cleanup) |

> **Note:** `modal` is already injected as a prop by `ModalContainer` / `createModal` —
> you only need to call `useModal` manually for more advanced use-cases.

---

### `<ModalContainer />`

Renders all active modals. Place **exactly once** at the app root (layout level).
Uses `useShallow` internally — only re-renders when the set of modal IDs changes.

```tsx
<ModalContainer />
```

---

### `registerModal(id, Component)` — Low-level API

Direct registration without the `show/hide` control object.
Use only when `createModal` is not suitable (e.g., dynamic registration).

```ts
import { registerModal } from "@buiducnhat/better-modal";

registerModal("alert", AlertComponent);
```

---

## TypeScript Best Practices

### Type props and result separately

```tsx
type ConfirmProps = { title: string };
type ConfirmResult = boolean;

export const ConfirmModal = createModal<ConfirmProps>(
  "confirm",
  ({ title, modal }) => {
    const confirm = () => modal.resolve(true satisfies ConfirmResult);
    const cancel = () => modal.resolve(false satisfies ConfirmResult);

    return (
      <dialog open={modal.visible}>
        <p>{title}</p>
        <button onClick={confirm}>Yes</button>
        <button onClick={cancel}>No</button>
      </dialog>
    );
  },
);

// Caller gets: Promise<ConfirmResult>
const ok = await ConfirmModal.show({ title: "Continue?" });
```

### Keep modal files co-located with their feature

```
features/
  orders/
    delete-order-modal.tsx   ← modal definition
    orders-list.tsx          ← caller
```

---

## React / Vercel Performance Best Practices

### 1. Slice subscriptions — never subscribe to the whole store

`useModal` already subscribes to `state.modals[id]` only. Do not bypass this by
calling `useModalStore` directly and reading the full `modals` object.

```tsx
// ✅ Correct — slice subscription (built into useModal)
const modal = useModal("confirm");

// ❌ Wrong — subscribes to entire store, causes all modals to re-render together
const store = useModalStore();
```

### 2. Stable references with `useCallback` / `useMemo`

All action functions returned by `useModal` are already memoised with `useCallback`.
When you pass them as event handlers, **no extra wrapping is needed**.

```tsx
// ✅ Correct — modal.resolve is already stable
<button onClick={() => modal.resolve(true)}>Confirm</button>;

// ❌ Unnecessary — wrapping a stable ref in another useCallback adds noise
const handleConfirm = useCallback(() => modal.resolve(true), [modal.resolve]);
```

### 3. Avoid mounting modals unconditionally in JSX trees

`ModalContainer` renders only modals that have been `show()`-called.
Do **not** place modal components directly in your JSX tree — it defeats the library's
purpose and forces unnecessary renders.

```tsx
// ✅ Correct — driven by ModalContainer at the root
export const ConfirmModal = createModal("confirm", ConfirmComponent);

// ❌ Anti-pattern — manual conditional render in component tree
function Page() {
  const [open, setOpen] = useState(false);
  return <>{open && <ConfirmDialog />}</>;
}
```

### 4. Register modals at module level, not inside components

`createModal` is a registration side-effect. Call it once per modal at module scope.

```tsx
// ✅ Module level
export const AlertModal = createModal("alert", AlertComponent);

// ❌ Inside a component — re-registers on every render
function App() {
  const AlertModal = createModal("alert", AlertComponent); // BUG
}
```

### 5. Use `await` for confirmation flows, not prop-drilling callbacks

```tsx
// ✅ Promise-based — no callback prop-drilling required
async function handleDelete(id: string) {
  const ok = await ConfirmModal.show({ message: "Delete this item?" });
  if (!ok) return;
  await deleteItem(id);
}

// ❌ Old pattern — callback hell, tight coupling
function Parent() {
  const [showModal, setShowModal] = useState(false);
  const handleConfirm = () => {
    deleteItem(id);
    setShowModal(false);
  };
  return <ConfirmModal open={showModal} onConfirm={handleConfirm} />;
}
```

### 6. Handle Promise rejection — always catch or use `resolve(false)` for cancellation

```tsx
// ✅ Resolve-based cancellation (preferred)
<button onClick={() => modal.resolve(false)}>Cancel</button>;

// ✅ If you use reject(), always handle it at the call site
try {
  const result = await DeleteModal.show();
} catch {
  // user cancelled
}

// ❌ Unhandled rejection — will throw an unhandled Promise error
<button onClick={() => modal.reject("cancelled")}>Cancel</button>;
// ...without try/catch at the call site
```

### 7. Clean up with `modal.remove()` for modals with heavy side-effects

`hide()` sets `isOpen: false` but keeps the state in the store.
For modals with large props (e.g., image data) call `remove()` after close to free memory.

```tsx
const MyModal = createModal("heavy", ({ data, modal }) => {
  const close = () => {
    modal.resolve(null);
    // modal.remove() is called automatically by resolve → hide,
    // but you can call remove() explicitly after animations complete
  };
  return <dialog open={modal.visible}>...</dialog>;
});
```

### 8. Vercel composition pattern — use `children` over render-props inside modals

When your modal component needs to accept arbitrary content, prefer `children` over
render-prop patterns.

```tsx
// ✅ children prop — clear, composable
type Props = { title: string; children: React.ReactNode };
const DialogModal = createModal<Props>(
  "dialog",
  ({ title, children, modal }) => (
    <dialog open={modal.visible}>
      <h2>{title}</h2>
      <div>{children}</div>
      <button onClick={() => modal.hide()}>Close</button>
    </dialog>
  ),
);

// Call site
DialogModal.show({ title: "Info", children: <p>Some content</p> });
```

### 9. Co-locate modal definitions with the feature that owns them

Avoid a single `modals/` directory that becomes a dump of every modal in the app.
Instead, keep modals adjacent to the feature components that use them.

```
features/
  payments/
    payment-error-modal.tsx
    payment-form.tsx
  settings/
    delete-account-modal.tsx
    account-settings.tsx
```

### 10. Avoid prop-spreading `...modal.props` — be explicit

```tsx
// ✅ Explicit props — type-safe and readable
const { title, message } = modal.props;
return (
  <dialog>
    <h2>{title}</h2>
    <p>{message}</p>
  </dialog>
);

// ❌ Spread loses type information
return <dialog {...modal.props} />;
```

---

## Common Patterns

### Confirmation dialog

```tsx
// modals/confirm-modal.tsx
type ConfirmProps = { title: string; description?: string };

export const ConfirmModal = createModal<ConfirmProps>(
  "global-confirm",
  ({ title, description, modal }) => (
    <dialog open={modal.visible}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <footer>
        <button onClick={() => modal.resolve(true)}>Confirm</button>
        <button onClick={() => modal.resolve(false)}>Cancel</button>
      </footer>
    </dialog>
  ),
);

// Usage
const confirmed = await ConfirmModal.show({
  title: "Delete?",
  description: "Cannot undo.",
});
```

### Form modal with typed result

```tsx
// modals/edit-name-modal.tsx
type Props = { currentName: string };
type Result = { name: string } | null;

export const EditNameModal = createModal<Props>(
  "edit-name",
  ({ currentName, modal }) => {
    const [name, setName] = React.useState(currentName);

    return (
      <dialog open={modal.visible}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => modal.resolve({ name } satisfies Result)}>
          Save
        </button>
        <button onClick={() => modal.resolve(null)}>Cancel</button>
      </dialog>
    );
  },
);

// Usage
const result = await EditNameModal.show({ currentName: "Alice" });
if (result) {
  await updateName(result.name);
}
```

### Alert / notification (fire-and-forget)

```tsx
export const AlertModal = createModal<{ message: string }>(
  "alert",
  ({ message, modal }) => (
    <dialog open={modal.visible}>
      <p>{message}</p>
      <button onClick={modal.hide}>OK</button>
    </dialog>
  ),
);

// Fire-and-forget — no await needed
AlertModal.show({ message: "Saved successfully!" });
```

### Using with shadcn/ui `<Dialog>`

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createModal } from "@buiducnhat/better-modal";

type Props = { title: string };

export const InfoModal = createModal<Props>("info", ({ title, modal }) => (
  <Dialog open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <button onClick={modal.hide}>Close</button>
    </DialogContent>
  </Dialog>
));
```

### Using with Radix UI `<Dialog>`

```tsx
import * as Dialog from "@radix-ui/react-dialog";
import { createModal } from "@buiducnhat/better-modal";

export const ConfirmModal = createModal<{ message: string }>(
  "radix-confirm",
  ({ message, modal }) => (
    <Dialog.Root
      open={modal.visible}
      onOpenChange={(open) => !open && modal.resolve(false)}
    >
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <p>{message}</p>
          <button onClick={() => modal.resolve(true)}>Yes</button>
          <button onClick={() => modal.resolve(false)}>No</button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  ),
);
```

---

## Anti-Patterns Checklist

| Anti-pattern                                      | Why it's wrong                                  | Fix                                                           |
| ------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| `createModal` inside a component                  | Re-registers on every render                    | Move to module scope                                          |
| `<ModalContainer />` placed more than once        | Renders every modal twice                       | Place exactly once at root                                    |
| Subscribing to full `useModalStore()`             | Triggers re-renders for all modal state changes | Use `useModal(id)` or slice selectors                         |
| `modal.reject()` without `try/catch` at call site | Unhandled Promise rejection                     | Use `resolve(false)` for cancellation, or wrap in `try/catch` |
| Spreading `modal.props` onto JSX                  | Loses TypeScript type narrowing                 | Destructure explicitly                                        |
| Storing modal IDs as magic strings across files   | Typos cause silent failures                     | Export the ID from the modal definition file                  |

---

## Data Flow Reference

```
Module scope
  createModal(id, Comp)
    └─► modalRegistry.set(id, Comp)   (plain Map, not Zustand)
    └─► returns { id, show, hide }

Runtime
  Modal.show(props)
    └─► useModalStore.open(id, props) → stores Promise resolvers
    └─► returns Promise<result>

  <ModalContainer /> (root)
    └─► subscribes to Object.keys(store.modals)  [useShallow]
    └─► for each id → <ModalRenderer id={id} />
          └─► Comp = modalRegistry.get(id)
          └─► modal = useModal(id)                [slice subscription]
          └─► <Comp {...modal.props} modal={modal} />

  modal.resolve(value)
    └─► calls stored Promise resolver
    └─► sets isOpen = false
    └─► Promise resolves in original caller
```
