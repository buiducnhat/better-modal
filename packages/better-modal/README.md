# @buiducnhat/better-modal

A small, headless React utility for declarative modal state management. Register modals once, open them from anywhere in your app, and await their results as Promises.

This README is shipped with the package on npm and contains the usage instructions that appear on the package page.

## Installation

```bash
# npm
npm install @buiducnhat/better-modal zustand

# bun
bun add @buiducnhat/better-modal zustand
```

`react` and `zustand` are **peer dependencies** and must be installed by the consumer.

## Usage

1. **Render the container** somewhere near your app root:

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

2. **Create a modal** using `createModal`:

```tsx
import { createModal } from "@buiducnhat/better-modal";

const ConfirmModal = createModal(
  "confirm",
  ({ modal, message }: { modal: any; message: string }) => (
    <dialog open={modal.visible}>
      <p>{message}</p>
      <button onClick={() => modal.resolve(true)}>OK</button>
      <button onClick={() => modal.resolve(false)}>Cancel</button>
    </dialog>
  ),
);
```

3. **Open the modal from anywhere** (inside or outside React components):

```ts
const result = await ConfirmModal.show({ message: "Proceed with action?" });
if (result) {
  // user confirmed
}
```

### API

- `createModal(id, Component)` — registers a modal and returns `{ id, show(props?), hide() }`.
- `useModal(id)` — hook used inside the modal component to access state and control methods.
- `<ModalContainer />` — renders active modals; must be mounted once.
- `registerModal(id, Component)` — low-level registration helper.

## License

MIT
